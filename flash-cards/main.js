function cde(type, properties, children)
{
    /// Dad's function
    var el;
    var className;
    var id;
    
    if (type) {
        type = type.replace(/[.#][^.#]+/g, function (match)
        {
            if (match[0] === ".") {
                className = match.substr(1);
            } else {
                id = match.substr(1);
            }
            return "";
        });
    }
    if (type) {
        el = document.createElement(type);
        
        if (className) {
            el.classList.add.apply(el.classList, className.split(" "));
        }
        if (id) {
            el.id = id;
        }
    } else {
        el = document.createDocumentFragment();
    }
    
    /// Make properties optional.
    if (!children && Array.isArray(properties)) {
        children = properties;
        properties = undefined;
    }
    
    if (properties && !Array.isArray(properties)) {
        Object.keys(properties).forEach(function (prop)
        {
            var propName = prop;
            
            /// If the property starts with "on", it's an event.
            if (prop.startsWith("on")) {
                el.addEventListener(prop.substring(2), properties[prop]);
            } else {
                if (prop === "class") {
                    propName = "className";
                } else if (prop === "t") {
                    propName = "textContent";
                }
                
                try {
                    if (propName === "style") {
                        Object.keys(properties[prop]).forEach(function (key)
                        {
                            el.style.setProperty(key, properties[prop][key]);
                        });
                    } else if (propName === "className" && typeof properties[prop] === "string") {
                        el.classList.add.apply(el.classList, properties[prop].split(" "));
                    } else if (typeof el[propName] === "undefined") {
                        el.setAttribute(propName, properties[prop]);
                    } else {
                        el[propName] = properties[prop];
                    }
                } catch (e) {
                    /// Sometimes Safari would through errors.
                    console.error(e, prop);
                }
            }
        });
    }
    
    if (Array.isArray(children)) {
        children.forEach(function (child)
        {
            if (child) {
                if (typeof child === "object") {
                    el.appendChild(child);
                } else {
                    el.appendChild(document.createTextNode(child));
                }
            }
        });
    }
    
    return el;
}
(function() {
    function getValue(id) {
        return document.getElementById(id).value;
    }

    function setDisplay(id, val) {
        document.getElementById(id).style.display = val;
    }

    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|```math ```\/\```])/g, "\\$1");
    }

    function parseSeparator(str) {
        // Support for \t, \n, etc.
        if (str === "\\t") return "\t";
        if (str === "\\n") return "\n";
        if (str === "\\r") return "\r";
        return str;
    }

    function parseData(data, termDefSep, cardSep) {
        var cards = [];
        var cardList = data.split(cardSep);
        for (var i = 0; i < cardList.length; i++) {
            var line = cardList[i];
            if (!line.trim()) continue;
            var parts = line.split(termDefSep);
            if (parts.length < 2) continue;
            cards.push([
                parts[0].trim(),
                parts.slice(1).join(termDefSep).trim()
            ]);
        }
        return cards;
    }
    var flashcardEl = document.getElementById("flashcards");
    function createFlashcards(cards, cardsPerPage) {
        function makePage() {
            var c1 = cde("div.cards-column");
            var c2 = cde("div.cards-column");
            var arr = [c1, c2];
            var page = cde("div.page", arr);
            flashcardEl.appendChild(page);
            return arr;
        }
        flashcardEl.appendChild(cde("div.br"));
        var p1 = makePage();
        var p2 = makePage();

        var side = 0;
        var i;
        var len = cards.length;
        var cardsAdded = 0;
        var cardHeight = (10/cardsPerPage * 2) + "in";
        for(i = 0; i < len; i++) {
            var card = cards[i];
            var front = cde("div.card", {t: card[0]});
            var back = cde("div.card", {t: card[1]});
            front.style.height = cardHeight;
            back.style.height = cardHeight;
            p1[side].appendChild(front);
            p2[1-side].appendChild(back);
            side = 1-side;
            if(++cardsAdded === cardsPerPage && i+1 !== len) {
                flashcardEl.appendChild(cde("div.br"));
                p1 = makePage();
                p2 = makePage();
            }
        }
    }

    document.getElementById('generate').onclick = function() {
        var data = getValue('data');
        var termDefSep = parseSeparator(getValue('term-def-sep'));
        var cardSep = parseSeparator(getValue('card-sep'));
        var cardsPerPage = parseInt(getValue('cards-per-page'), 10) || 4;

        var cards = parseData(data, termDefSep, cardSep);
        if (!cards.length) {
            alert('No valid cards found. Please check your input and separators.');
            return;
        }

        setDisplay('input-section', 'none');
        setDisplay('output-section', 'block');
        createFlashcards(cards, cardsPerPage);
    };

    document.getElementById('back').onclick = function() {
        setDisplay('output-section', 'none');
        setDisplay('input-section', 'block');
    };

    document.getElementById('print').onclick = function() {
        window.print();
    };
})();