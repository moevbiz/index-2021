import { Map } from './Map';
import { Logo } from './Logo';
import Swup from 'swup';

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
        // console.log(this.state);
        for (const [key, value] of Object.entries(this.state)) {
            document.body.dataset[key] = value;
        }
    }
    afterLoad() {
        if (window.location.pathname.includes('/list') && this.state.space) {
            // console.log(document.querySelectorAll('.space'));
            this.selectSpace(this.state.space);
        }
        this.$spaces = document.querySelectorAll('.space');
        if (this.$spaces) {
            this.$spaces.forEach(s => {
                s.addEventListener('click', () => {
                    this.selectSpace(s.id);
                })
            })
        }
        
        this.setState({
            useActiveArea: window.location.pathname.includes('/list'),
        })
        // this.setState({
            
        // });
    }
    setView(options) {
        if (options.view == 'space') {
            let hash = `#${options.space}`;
            if (window.location.pathname.includes('/list')) {
                // window.location.hash = hash;
                // this.update();
                // this.selectSpace(options.space);
            } else {
                swup.loadPage({
                    url: `/list/${hash}`, // route of request (defaults to current url)
                });
                this.setState({useActiveArea: true, space: options.space});
            }

            this.setState({
                view: 'space',
            })
        }
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
        window.location.hash = '#' + this.state.space;
        if (this.$spaces) {
            this.$spaces.forEach(s => {
                if (s.id == this.state.space) {
                    s.classList.add('is-selected');
                } else {
                    s.classList.remove('is-selected');
                }
            })
        }
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

        this.$map.markers.forEach(m => {
            m.on('click', (e) => {
                if (window.location.pathname.includes('/list')) {
                    this.selectSpace(m.options.title);
                } else {
                    this.setView({
                        view: 'space',
                        space: m.options.title,
                        trigger: e.target,
                    })
                }
            })
        });

        if (this.state.space) {
            this.setView({
                view: 'space',
                space: this.state.space,
            })
        }

        this.afterLoad();
    }
}