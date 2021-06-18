export class Logo {
    constructor(qs) {
        this.$el = document.querySelector(qs);
    }
    hide() {
        this.$el.classList.add('is-hidden');
        return {logoHidden: true};
    }
}