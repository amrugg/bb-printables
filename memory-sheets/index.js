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
var page = document.getElementById("page");
var division = cde("select",  [
    cde("option", {t: "Senior"}),
    cde("option", {t: "Junior"}),
    cde("option", {t: "Primary"}),
]);
var version = cde("select", [
    cde("option", {t: "KJV"}),
    cde("option", {t: "NKJV"}),
    cde("option", {t: "ESV"}),
    cde("option", {t: "NASB"}),
    cde("option", {t: "NIV"}),
]);

var date = cde("input", {type: "date"});
(function() {
    function pad(n) { return n < 10 ? '0' + n : n; }

    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = pad(today.getMonth() + 1); // Months are zero-based
    var dd = pad(today.getDate());
    var formatted = yyyy + '-' + mm + '-' + dd;
    date.value = formatted;
})();
var nameInput = cde("input", {type: "text"});

var order = cde("select", [
    cde("option", {t: "Summer Study, then length"}),
    cde("option", {t: "Passage number order"}),
    cde("option", {t: "Length"}),
]);

var generate = cde("button", {t: "Generate", onclick: function() {
    loadVerseCardData(division.value[0], version.value, makeSheets);
}});
var printButton = cde("button.print-btn", {t: "Print", disabled: true, onclick: function(){window.print()}});
var uiContainer = cde("div.uiContainer no-print", [
    cde("label", {title: "Contestant division"}, ["Division:", division]),
    cde("label", {title: "The version to use when ordering the cards.\nThere will be little to no difference for most versions."}, ["Version:", version]),
    cde("label", ["Date:", date]),
    cde("label", ["Name (leave blank if none desired):", nameInput]),
    cde("label", {title: "The order the passages should be put in."}, ["Order:", order]),
    generate,
    printButton
]);
page.appendChild(uiContainer);
var printEl = cde("div.printContainer");
page.appendChild(printEl);

var aboutBtn = cde("button.about-btn no-print", {t: "About", onclick: showAbout});
page.appendChild(aboutBtn);
function showAbout() {
    var header = cde("div.modal-header", {t: "Memory Verse Tracking Sheets"});
    var closeBtn = cde("button.modal-close", {innerHTML: "&times;", onclick: closeModal});
    var content = cde("div.modal-content", [
        cde("p", {t: "These memory sheets are designed to track your memory progress over time. Each sheet covers four weeks."}),
        cde("p", {t: "I use a simple scoring system to record my progress. Every time I recite a passage, I put a mark on my sheet. If I got it perfect, I get a green mark; if I make between 1 and 4 mistakes, I get a yellow mark; if I make 5 or more mistakes, I get a red mark."}),
        cde("p", {t: "If you don't have colored pencils, you could write numbers, draw stars, or make tally marks. By the end of four weeks, you should see noticable progress."}),
        cde("h1", {t: "Help and support"}),
        cde("p", ["Please mail any bug reports or feature requests to ", cde("a", {href: "mailto:aaron@bibleadventure.com", t: "aaron@bibleadventure.com"}), ". I will happily read them but I get very busy during Bible Bee season and may not have time to develop this project any further."]),
        cde("p", ["Other tools I have made include ", cde("a", {href: "https://bibleadventure.com/memorySchedule/", t: "Memory Schedule"}), " and ", cde("a", {href: "https://scriptureleague.org/reference-recall/", t: "Reference Recall"}), "."])
    ]);
    var modal = cde("div.modal", [closeBtn, header, content])
    var overlay = cde("div.modal-overlay", [modal]);
    page.appendChild(overlay);
    function closeModal() {
        page.removeChild(overlay);
    }
}
var cardHashes = {
    "J-ESV": "9f8aad6",
    "J-KJV": "ee37603",
    "J-NASB": "be2cb4d",
    "J-NIV": "47a70ee",
    "J-NKJV": "4b0aa6a",
    "P-ESV": "9b5e0fb",
    "P-KJV": "f6e2cf0",
    "P-NASB": "757b0f4",
    "P-NIV": "1d945a8",
    "P-NKJV": "169cb36",
    "S-ESV": "39f431d",
    "S-KJV": "ec3c0f9",
    "S-NASB": "1f2842a",
    "S-NIV": "cbf7c42",
    "S-NKJV": "4e6ad08",
}
var verseReq;
var verseCardCache = {};
var year = (new Date()).getUTCFullYear();
function loadVerseCardData(division, version, cb)
{
    var key;
    
    if (!version) {
        cb = version;
        version = "KJV";
    }
    key = division + "-" + version;
    if (verseCardCache[key]) {
        return setTimeout(function ()
        {
            cb(verseCardCache[key]);
        }, 0);
    }
    
    if (verseReq && verseReq.status !== "DONE") {
        verseReq.cancelRequest();
    }
    var baseDir = "";
    if(window.location.href.startsWith("https")) {
        baseDir = "/bb-printables/memory-sheets/"
    }
    verseReq = request(baseDir + "verseCards/NBBC-" + year + "/" + key + "-" + cardHashes[key] + ".json", function (err, data)
    {
        if (err) {
            console.error(err);
            alert("Could not load verses.");
        } else {
            verseCardCache[key] = data;
            cb(data);
        }
    });
}
function request(url, data, method, cb)
{
    var req = new XMLHttpRequest();
    var canceled;
    
    if (typeof data === "function") {
        cb = data;
        data = "";
        method = "GET";
    } else if (typeof method === "function") {
        cb = method;
        method = "GET";
    }
    
    if (!method) {
        method = "GET";
    }
    
    req.open(method, url);
    

    if (data) {
        if (typeof data === "string") {
            req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        } else {
            req.setRequestHeader("Content-Type", "application/octet-stream");
        }
    }
    
    req.onload = function ()
    {
        if (!canceled) {
            var contentType = req.getResponseHeader("Content-Type");
            var res;
            
            if (/^application\/json/i.test(contentType)) {
                try {
                    res = JSON.parse(req.responseText);
                } catch (e) {}
            } else {
                ///TODO: Binary?
                res = req.responseText;
            }
            
            /* istanbul ignore if */
            if (req.status >= 400) {
                //cb({err: "request failed", status: req.status}, res);
                cb(res && res.err ? res : {err: "request failed", status: req.status}, res);
            } else {
                cb(null, res);
            }
        }
    };
    /* istanbul ignore next */
    req.onerror = function (err)
    {
        if (!canceled) {
            cb({err: "network error", message: err});
        }
    };
    
    req.timeout = 10000;
    
    cb = cb || function () {};
    
    req.send(data);
    
    req.cancelRequest = function ()
    {
        canceled = true;
        try {
            req.abort();
        } catch (e) {}
    };
    
    return req;
}
function getNextFourWeeks(startDate) {
    var monthsFull = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var monthsAbbr = [
        "Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
        "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."
    ];

    function formatRange(start, end) {
        var sameMonth = start.getMonth() === end.getMonth();
        var rangeStr = "";

        // Try full month names
        if (sameMonth) {
        rangeStr = monthsFull[start.getMonth()] + " " + start.getDate() + "–" + end.getDate();
        } else {
        rangeStr = monthsFull[start.getMonth()] + " " + start.getDate() + "–" +
                    monthsFull[end.getMonth()] + " " + end.getDate();
        }

        // If too long, use abbreviations
        if (rangeStr.length > 15) {
        if (sameMonth) {
            rangeStr = monthsAbbr[start.getMonth()] + " " + start.getDate() + "–" + end.getDate();
        } else {
            rangeStr = monthsAbbr[start.getMonth()] + " " + start.getDate() + "–" +
                    monthsAbbr[end.getMonth()] + " " + end.getDate();
        }
        }

        return rangeStr;
    }

    var result = [];
    startDate.setDate(startDate.getDate()+1);
    var i, weekStart, weekEnd, current = new Date(startDate);

    for (i = 0; i < 4; i++) {
        weekStart = new Date(current);
        weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);

        result.push(formatRange(weekStart, weekEnd));

        // Move to next week
        current.setDate(current.getDate() + 7);
    }

    return result;
}

function makeSheets(cards) {
    printButton.disabled = false;
    printEl.textContent = "";
    cards = sort(cards);
    function isOverflowing(el) {
        return el.scrollHeight > el.clientHeight;
    }
    function makeHeader(table) {
        if(nameInput.value) {
            curPage.insertBefore(cde("div.name", {t: nameInput.value}), table);
        }
        table.appendChild(cde("thead", [
            cde("th.cell1", {t: "Passages"}),
            cde("th.cell2", {t: "#"}),
            cde("th.date", {t: dates[0]}),
            cde("th.date", {t: dates[1]}),
            cde("th.date", {t: dates[2]}),
            cde("th.date", {t: dates[3]}),
        ]))
    }
    function makeNewPage() {
        curPage = cde("div.page");
        printEl.appendChild(curPage);
        tBody = cde("tbody");
        table = cde("table", [tBody]);
        curPage.appendChild(table);
        makeHeader(table);
    }
    var dates = [];
    if(date.value) {
        dates = getNextFourWeeks(new Date(date.value));
    } else {
        dates = getNextFourWeeks(new Date());
    }
    var curPage;
    var table;
    var tBody;

    makeNewPage();

    for(var i = 0; i < cards.length; i++) {
        var cur = cards[i];
        if(cur.break) {
            tBody.appendChild(cde("tr.barrier " + cur.class, [
                cde("td", {colspan: 6, t: cur.break})
            ]))
            continue;
        }
        var tr = cde("tr", [
            cde("td.cell1", {t: cur.ref}),
            cde("td.cell2", {t: cur.cardNum}),
            cde("td.date"),
            cde("td.date"),
            cde("td.date"),
            cde("td.date")

        ]);
        tBody.appendChild(tr);
        if(isOverflowing(curPage)) {
            tBody.removeChild(tr);
            printEl.appendChild(cde("div.page-break"));
            makeNewPage();
            tBody.appendChild(tr);
        }
    }
}
function sort(cards) {
    var newCards = [];
    cards.sort(function(a,b) {
        return a.cardNum - b.cardNum;
    });
    if (order.selectedIndex === 0) {
        var i = 0;
        while(i < cards.length) {
            var cur = cards[i];
            if(cur.release === "Summer Study") {
                newCards.push(cur);
            } else {
                newCards.push({break: "Summer Study", class: "barrier-green"});
                break;
            }
            cards.shift();
        }
        cards.sort(function(a,b) {
            return a.wordCount - b.wordCount;
        })

        while(i < cards.length) {
            var cur = cards[i];
            if(cur.cards < 2) {
                newCards.push(cur);
            } else {
                newCards.push({break: "Two Cards Appear", class: "barrier-orange"});
                break;
            }
            i++;
        }

        while(i < cards.length) {
            var cur = cards[i];
            if(cur.cards < 3) {
                newCards.push(cur);
            } else {
                newCards.push({break: "Three Cards Appear", class: "barrier-red"});
                break;
            }
            i++;
        }
        while(i < cards.length) {
            var cur = cards[i];
            if(cur.cards < 4) {
                newCards.push(cur);
            } else {
                newCards.push({break: "Four Cards Appear", class: "barrier-blue"});
                break;
            }
            i++;
        }
        while(i < cards.length) {
            var cur = cards[i];
            newCards.push(cur);
            i++;
        }
    } else if (order.selectedIndex === 1) {
        var i = 0;
        while(i < cards.length) {
            var cur = cards[i];
            if(cur.release === "Summer Study") {
                newCards.push(cur);
            } else {
                newCards.push({break: "Summer Study", class: "barrier-green"});
                break;
            }
            cards.shift();
        }

        while(i < cards.length) {
            var cur = cards[i];
            if(cur.release === "Early Release") {
                newCards.push(cur);
            } else {
                newCards.push({break: "Early Release", class: "barrier-red"});
                break;
            }
            i++;
        }

        while(i < cards.length) {
            var cur = cards[i];
            newCards.push(cur);
        }
    } else {
        cards.sort(function(a,b) {
            return a.wordCount - b.wordCount;
        })
        var i = 0;
        while(i < cards.length) {
            var cur = cards[i];
            if(cur.cards < 2) {
                newCards.push(cur);
            } else {
                newCards.push({break: "Two Cards Appear", class: "barrier-green"});
                break;
            }
            i++;
        }

        while(i < cards.length) {
            var cur = cards[i];
            if(cur.cards < 3) {
                newCards.push(cur);
            } else {
                newCards.push({break: "Three Cards Appear", class: "barrier-red"});
                break;
            }
            i++;
        }
        while(i < cards.length) {
            var cur = cards[i];
            if(cur.cards < 4) {
                newCards.push(cur);
            } else {
                newCards.push({break: "Four Cards Appear", class: "barrier-blue"});
                break;
            }
            i++;
        }
        while(i < cards.length) {
            var cur = cards[i];
            newCards.push(cur);
            i++;
        }
    }
    return newCards;
}