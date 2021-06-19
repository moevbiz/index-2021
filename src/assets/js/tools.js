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

/*
 * Mailchimp AJAX form submit VanillaJS
 * Vanilla JS
 * Author: Michiel Vandewalle
 * Github author: https://github.com/michiel-vandewalle
 * Github project: https://github.com/michiel-vandewalle/Mailchimp-AJAX-form-submit-vanillaJS
 */

export const sub = (e) => {
    e.preventDefault();
    
    // Check for spam
    if(e.target.querySelector('#js-validate-robot').value !== '') { return false }

    // Get url for mailchimp
    var url = e.target.action.replace('/post?', '/post-json?');

    // Add form data to object
    var data = '';
    var inputs = e.target.querySelectorAll('#js-form-inputs input');
    for (var i = 0; i < inputs.length; i++) {
        data += '&' + inputs[i].name + '=' + encodeURIComponent(inputs[i].value);
    }

    // Create & add post script to the DOM
    var script = document.createElement('script');
    script.src = url + data;
    document.body.appendChild(script);

    // Callback function
    var callback = 'callback';
    window[callback] = function(data) {

        // Remove post script from the DOM
        delete window[callback];
        document.body.removeChild(script);

        // Display response message
        document.getElementById('js-subscribe-response').innerHTML = data.msg
    };
}

export function formatDistrict(district, format) {
    if (format == 'ordinal') return toOrdinalSuffix(district)
    if (format == 'plz') return toPLZ(district)
}

const toOrdinalSuffix = num => {
    const int = parseInt(num),
        digits = [int % 10, int % 100],
        ordinals = ['st', 'nd', 'rd', 'th'],
        oPattern = [1, 2, 3, 4],
        tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
    return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
        ? int + ordinals[digits[0] - 1]
        : int + ordinals[3];
}

const toPLZ = num => {
    if (num < 10) {
        num = `0${num}`
    }
    const PLZ = `1${num}0`
    return PLZ;
};

// scroll func
// https://stackoverflow.com/a/26808520/10727821
// first add raf shim
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/

// main function
export function scrollToY(scrollTargetY, speed, easing, callback = null) {
        

        // let requestAnimFrame = function() {
        //     return  window.requestAnimationFrame       ||
        //             window.webkitRequestAnimationFrame ||
        //             window.mozRequestAnimationFrame    ||
        //             function( callback ){
        //                 window.setTimeout(callback, 1000 / 60);
        //             };
        // };

        if (!window.requestAnimFrame) {
            window.requestAnimFrame = (function(){
                return  window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        function( callback ){
                        window.setTimeout(callback, 1000 / 60);
                        };
                })();
        }


      // scrollTargetY: the target scrollY property of the window
      // speed: time in pixels per second
      // easing: easing equation to use
      // callback: callback function after scroll is done | null
  
      var scrollY = window.scrollY || document.documentElement.scrollTop,
          scrollTargetY = scrollTargetY || 0,
          speed = speed || 2000,
          easing = easing || 'easeOutSine',
          currentTime = 0;
  
      // min time .1, max time .8 seconds
      var time = Math.max(.1, Math.min(Math.abs(scrollY - scrollTargetY) / speed, .8));
  
      // easing equations from https://github.com/danro/easing-js/blob/master/easing.js
      var easingEquations = {
              easeOutSine: function (pos) {
                  return Math.sin(pos * (Math.PI / 2));
              },
              easeInOutSine: function (pos) {
                  return (-0.5 * (Math.cos(Math.PI * pos) - 1));
              },
              easeInOutQuint: function (pos) {
                  if ((pos /= 0.5) < 1) {
                      return 0.5 * Math.pow(pos, 5);
                  }
                  return 0.5 * (Math.pow((pos - 2), 5) + 2);
              }
          };
  
      // add animation loop
      function tick() {
          currentTime += 1 / 60;
  
          var p = currentTime / time;
          var t = easingEquations[easing](p);
  
          if (p < 1) {
              requestAnimFrame(tick);
  
              window.scrollTo(0, scrollY + ((scrollTargetY - scrollY) * t));
          } else {
            //   console.log('scroll done');
              if (callback != null) {
                  callback();
              }
              window.scrollTo(0, scrollTargetY);
          }
      }
  
      // call it once to get started
      tick();
  }
  
  // scroll it
//     scrollToY(0, 1500, 'easeInOutQuint', cb);