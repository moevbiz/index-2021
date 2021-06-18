import { sub } from "../tools";

export class NewsletterForm {
    constructor(qs) {
        this.$el = document.querySelector(qs);
        if (this.$el) {
            this.$el.addEventListener('submit', (e) => {
                sub(e);
            })
        }
    }
}