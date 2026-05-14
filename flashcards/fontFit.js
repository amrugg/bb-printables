// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, browser: true

/* exported FONT_FIT */

var FONT_FIT = function createFontFit(style, maxTries, debugging)
{
    "use strict";
    
    var body = document.body;
    var parentEl = document.createElement("fontSizeTester");
    var el = document.createElement("fontSizeTester");
    var obj;
    var tries;
    var lastSize;
    
    maxTries = maxTries || 100;
    
    /// Make sure the element won't be visible. Although, since it removes itself immediately, you won't anyway.
    parentEl.style.setProperty("position", "absolute", "important");
    parentEl.appendChild(el);
    
    if (!debugging) {
        el.style.setProperty("visibility", "hidden", "important");
        el.style.setProperty("pointer-events", "none", "important");
        el.style.setProperty("display", "inline", "important");
    }
    
    if (style) {
        ///TODO: Just give it an element.
        Object.keys(style).forEach(function (key)
        {
            el.style.setProperty(key, style[key], "important");
        });
    }
    
    function get_optimal_size(size, fit_to, unit, careful, dir)
    {
        var actual_w,
            actual_h,
            ratio,
            w_off,
            h_off,
            new_size;
        
        el.style.setProperty("font-size", size + unit, "important");
        
        actual_w = el.offsetWidth;
        actual_h = el.offsetHeight;
        
        w_off = actual_w - fit_to.w ;
        h_off = actual_h - fit_to.h;
        
        /// Is it just right or is it small enough and it already tried a bigger size?
        if ((w_off === 0 && h_off === 0) || (w_off <= 0 && h_off <= 0 && dir === "smaller")) {
            return size;
        }
        
        /// Can we get bigger and need to?
        if (dir !== "smaller" && w_off < 0 && h_off < 0) {
            dir = "bigger";
            /// Is the width the least off?
            if (w_off > h_off) {
                ratio = fit_to.w / actual_w;
            } else {
                ratio = fit_to.h / actual_h;
            }
        } else {
            dir = "smaller";
            /// Is the width the most off?
            if (w_off > h_off) {
                ratio = fit_to.w / actual_w;
            } else {
                ratio = fit_to.h / actual_h;
            }
        }
        
        tries += 1;
        if (tries > maxTries) {
            //throw "Can't fit the font!";
            return size;
        }
        
        /// Make sure to round down.
        if (careful) {
            new_size = Math.floor(size * ((ratio + 1) / 2));
        } else {
            new_size = Math.floor(size * ratio);
        }
        
        /// Did the size not change?
        if (new_size === size) {
            return size;
        }
        
        /// Try again with a different size.
        return get_optimal_size(new_size, fit_to, unit, careful, dir);
    }
    
    function findWordBreaks(textArr)
    {
        var text = "";
        var len = el.childNodes.length;
        var i;
        var node;
        var offset;
        var lastOffset;
        var wordsPos = 0;
        
        for (i = 0; i < len; ++i) {
            node = el.childNodes[i];
            if (node.tagName === "SPAN") {
                if (wordsPos === 0) {
                    lastOffset = node.offsetLeft;
                    text += textArr[wordsPos];
                } else {
                    offset = node.offsetLeft;
                    if (offset <= lastOffset) {
                        /// Line wrapped
                        text += "\n" + textArr[wordsPos];
                    } else {
                        text += " " + textArr[wordsPos];
                    }
                    lastOffset = offset;
                }
                ++wordsPos;
            }
        }
        
        return text;
    }
    
    obj = {
        destroy: function destroy()
        {
            el  = null;
            obj = null;
        },
        fit: function fit(text, fit_to, unit)
        {
            var fontSize;
            var textWithBreaks;
            var textArr;
            var hasSpaces;
            
            if (debugging) {
                console.time();
            }
            
            if (!fit_to) {
                fit_to = {w: window.innerWidth * 0.95, h: window.innerHeight * 0.95};
            } else if (isNaN(fit_to.w) || isNaN(fit_to.h)) {
                throw "I need a number to fit the font!";
            }
            if (!unit) {
                unit = "px";
            }
            parentEl.style.setProperty("width", fit_to.w + unit, "important");
            parentEl.style.setProperty("height", fit_to.h + unit, "important");
            
            /*
            ///HACK: IE comes out too big. Make it smaller.
            if (/MSIE|Trident/.test(navigator.userAgent)) {
                fit_to = {w: fit_to.w * 0.88, h: fit_to.h * 0.88};
            }
            */
            
            hasSpaces = text.indexOf(" ") > -1;
            
            if (hasSpaces) {
                textArr = text.split(/ +/g);
                el.innerHTML = "<span>" + text.replace(/</g, "&lt;").split(/ +/g).join("</span> <span>") + "</span>";
            } else {
                el.textContent = text;
            }
            
            body.appendChild(parentEl);
            
            tries = 0;
            /// Are there spaces? Text with spaces need to be treated more carefully.
            if (hasSpaces) {
                el.style.setProperty("white-space", "normal", "important");
                fontSize = get_optimal_size(lastSize || fit_to.w / text.length, fit_to, unit, true);
                textWithBreaks = findWordBreaks(textArr);
            } else {
                /// Word wrapping causes unpredictable behavior.
                el.style.setProperty("white-space", "nowrap", "important");
                fontSize = get_optimal_size(lastSize || Math.floor(fit_to.w / text.length), fit_to, unit);
                textWithBreaks = text;
            }
            
            if (!debugging) {
                body.removeChild(parentEl);
            } else {
                console.timeEnd();
            }
            
            lastSize = fontSize;
            return {
                text: textWithBreaks,
                size: fontSize,
            };
        },
        getEl: function ()
        {
            return el;
        }
    };
    
    return obj;
};
