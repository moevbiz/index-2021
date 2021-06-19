import { Map } from './Map';
import { Logo } from './Logo';
import Swup from 'swup';
import { scrollToY } from '../tools';
import { NewsletterForm } from "./NewsletterForm";
import { marker } from 'leaflet';

let swup;

export class App {
    constructor() {
        this.state = {
            space: window.location.pathname.includes('/list') ? window.location.hash.substr(1) : '',
            panelOpen: false,
            logoHidden: false,
            useActiveArea: window.location.pathname.includes('/list'),
            view: window.location.pathname ? window.location.pathname : 'index',
        };
        this.data = '';
        this.$logo = new Logo('#logo');
        this.getData().then(data => this.init(data));
    }
    async getData() {
        let response = await fetch('/spaces.json');
        let data = await response.json();
        return data;
    }
    setState(state = {}) {
        this.state = {...this.state, ...state};
        for (const [key, value] of Object.entries(this.state)) {
            document.body.dataset[key] = value;
        }
    }
    afterLoad() {
        this.setState({
            useActiveArea: window.location.pathname.includes('/list'),
            view: window.location.pathname,
        })
        this.$spaces = document.querySelectorAll('.space');
        if (this.$spaces) {
            this.$spaces.forEach(s => {
                s.addEventListener('click', e => {
                    this.selectSpace(s.id);
                })
            })
        }
        if (window.location.pathname.includes('/list') && this.state.space) {
            this.selectSpace(this.state.space);
        }

        if (document.querySelector('.signup-form')) {
            new NewsletterForm('.signup-form');
        }

        if (window.location.pathname.includes('info')) {
            window.scrollTo(0,0);
        }

        // this.setState({
            
        // });
    }
    setView(options) {
        if (options.view == 'space') {
            let st;
            let hash = `#${options.space}`;
            if (window.location.pathname.includes('/list')) {
                // window.location.hash = hash;
                // this.update();
                // this.selectSpace(options.space);
                st = {};
            } else {
                swup.loadPage({
                    url: `/list/${hash}`, // route of request (defaults to current url)
                });
                st = {useActiveArea: true, space: options.space};
            }

            this.setState({
                ...st,
                // view: 'space',
            })
        }
    }
    unselectSpace() {
        this.$map.markers.forEach(m => {
            m._icon.classList.remove('marker-icon-selected');
        })
        this.$spaces.forEach(s => {
            s.classList.remove('is-selected');
        });
        history.pushState({}, '', window.location.pathname);
        this.setState({space: ''});
    }
    selectSpace(space) {
        let marker;
        this.$map.markers.forEach(m => {
            if (m.options.title == space) {
                marker = m;
                m._icon.classList.add('marker-icon-selected');
                // m.setIcon(this.$map.markerIcons.selected);
            } else {
                m._icon.classList.remove('marker-icon-selected');
                // m.setIcon(this.$map.markerIcons.default);
            }
        })
        this.$map.$map.panTo(marker.getLatLng());
        this.setState({space});
        if (this.$spaces) {
            this.$spaces.forEach(s => {
                if (s.id == this.state.space) {
                    s.classList.add('is-selected');
                    scrollToY(s.offsetTop, this.view == '/list/' ? 1500 : 0, 'easeInOutQuint');
                    // s.scrollIntoView({
                    //     behavior: 'smooth'
                    // });
                } else {
                    s.classList.remove('is-selected');
                }
            })
        }
        // window.location.hash = '#' + this.state.space;
        history.replaceState({}, '', '#' + this.state.space);
    }
    init(data) {
        this.setState();
        this.$map = new Map('map', data);
        swup = new Swup();
        swup.on('contentReplaced', () => {
            this.afterLoad();
        });

        // hide logo on init
        ['click','ontouchstart', 'scroll'].forEach( evt => 
            document.addEventListener(evt, () => {
                if (this.state.logoHidden != true) {
                    this.setState(this.$logo.hide());
                }
            }, {once: true}),
        );

        ['zoomstart', 'movestart'].forEach((evt) => {
            this.$map.$map.on(evt, () => {
                if (this.state.logoHidden != true) {
                    this.setState(this.$logo.hide());
                }
            }, {once: true})
        })

        let tapTolerance = 500;
        let literallyJustTapped = false;

        const markerClickHandler = (m, e) => {
            if (window.location.pathname.includes('/list')) {
                this.selectSpace(m.options.title);
            } else {
                this.setView({
                    view: 'space',
                    space: m.options.title,
                    trigger: e.target,
                })
            }
        }

        this.$map.markers.forEach(m => {
            m.on('click', (e) => {
                if (window.innerWidth > 660) {
                    markerClickHandler(m, e);
                } else {
                    if (literallyJustTapped) return;
                    this.$map.markers.forEach(m => {
                        if (m == e.target) return;
                        m._icon.classList.remove('marker-icon-selected');
                        m._icon.classList.remove('is-clicked-once');
                    })
                    if (!m._icon.classList.contains('is-clicked-once')) {
                        m._icon.classList.add('is-clicked-once');
                    } else {
                        markerClickHandler(m, e);
                        m._icon.classList.remove('is-clicked-once');
                    }
                    window.setTimeout(() => {
                        literallyJustTapped = false;
                    }, tapTolerance);
                }
            })
        });

        if (this.state.space) {
            this.setView({
                view: 'space',
                space: this.state.space,
            })
        }

        this.$map.$map.on('click', e => {
            this.unselectSpace();
            this.$map.markers.forEach(m => {
                m._icon.classList.remove('is-clicked-once');
            });
        })

        this.afterLoad();
    }
}