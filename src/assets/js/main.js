import { appHeight, sub } from "./tools";

window.addEventListener('resize', appHeight);
appHeight();

const nlForm = document.querySelector('.signup-form');
nlForm.addEventListener('submit', (e) => {
    sub(e);
})