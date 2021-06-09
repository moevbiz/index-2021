// a collection of helper functions

// fix 100vh """feature""" on mob safari
// usage: 
// .module {
//     height: 100vh; /* Fallback for browsers that do not support Custom Properties */
//     height: calc(var(--vh, 1vh) * 100);
//   }
export function appHeight() {
    const doc = document.documentElement
    doc.style.setProperty('--vh', (window.innerHeight*.01) + 'px');
}