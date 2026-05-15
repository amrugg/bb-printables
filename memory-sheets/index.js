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
var yearSelect = cde("select",  [
    cde("option", {t: "2026"}),
    cde("option", {t: "2025"}),
]);
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
    debugger
    loadVerseCardData(division.value[0], version.value, makeSheets);
}});
var printButton = cde("button.print-btn", {t: "Print", disabled: true, onclick: function(){window.print()}});
var uiContainer = cde("div.uiContainer no-print", [
    cde("label", {title: "Year for MPs"}, ["Year:", yearSelect]),
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
        cde("p", ["Alternatively, make an issue or create a pull request on ", cde("a", {href: "https://github.com/amrugg/bb-printables", t: "my github page."})]),
        cde("p", ["Other tools I have made include ", cde("a", {href: "https://bibleadventure.com/memorySchedule/", t: "Memory Schedule"}), " and ", cde("a", {href: "https://scriptureleague.org/reference-recall/", t: "Reference Recall"}), "."]),
        cde("p", ["~ Aaron Rugg"])
    ]);
    var modal = cde("div.modal", [closeBtn, header, content])
    var overlay = cde("div.modal-overlay", [modal]);
    page.appendChild(overlay);
    function closeModal() {
        page.removeChild(overlay);
    }
}
var cardHashes = {
    "2021": {
        "J-ESV": "9ccf649",
        "J-KJV": "0f87ace",
        "J-NASB": "886aa3e",
        "J-NIV": "d6b902b",
        "J-NKJV": "60bd3b3",
        "P-ESV": "fbb0375",
        "P-KJV": "63dc37c",
        "P-NASB": "69a4d04",
        "P-NIV": "0875425",
        "P-NKJV": "177ef2f",
        "S-ESV": "bd835a8",
        "S-KJV": "a9266f9",
        "S-NASB": "a55a264",
        "S-NIV": "cdaf693",
        "S-NKJV": "abaef54"
    },
    "2022": {
        "B-ESV": "38f47a0",
        "B-KJV": "eca652f",
        "B-NASB": "b41c43b",
        "B-NIV": "a5d9c3b",
        "B-NKJV": "8570708",
        "J-ESV": "4a39940",
        "J-KJV": "180e2a6",
        "J-NASB": "664d11c",
        "J-NIV": "50ce354",
        "J-NKJV": "b111896",
        "P-ESV": "c2e16f0",
        "P-KJV": "c3d211b",
        "P-NASB": "42d3b95",
        "P-NIV": "b807ea9",
        "P-NKJV": "21c4d0c",
        "S-ESV": "f1fb1c0",
        "S-KJV": "fc30223",
        "S-NASB": "4e1e09a",
        "S-NIV": "041de48",
        "S-NKJV": "8ef53e7"
    },
    "2023": {
        "B-ESV": "9db0e94",
        "B-KJV": "9dfaaa3",
        "B-NASB": "8b8a8da",
        "B-NIV": "3ed98ad",
        "B-NKJV": "7c8d43e",
        "J-ESV": "cc3aedf",
        "J-KJV": "a6a0085",
        "J-NASB": "2a094e1",
        "J-NIV": "34356c9",
        "J-NKJV": "b09d3ed",
        "P-ESV": "0858d5f",
        "P-KJV": "2c15778",
        "P-NASB": "c30517e",
        "P-NIV": "985a234",
        "P-NKJV": "13f2ad8",
        "S-ESV": "92a2cef",
        "S-KJV": "6af0495",
        "S-NASB": "4b46254",
        "S-NIV": "3469e6f",
        "S-NKJV": "4f3fbe2"
    },
    "2024": {
        "B-ESV": "5bd0b73",
        "B-KJV": "64b6fa7",
        "B-NASB": "d22394c",
        "B-NIV": "d951875",
        "B-NKJV": "f2e845b",
        "J-ESV": "0afb666",
        "J-KJV": "b2c3c6e",
        "J-NASB": "9f25f78",
        "J-NIV": "aae8b44",
        "J-NKJV": "0f70cc3",
        "P-ESV": "5e14e7a",
        "P-KJV": "691f62d",
        "P-NASB": "d2de621",
        "P-NIV": "750fb5b",
        "P-NKJV": "059f6ce",
        "S-ESV": "3f569c8",
        "S-KJV": "d9fc684",
        "S-NASB": "0ecbf55",
        "S-NIV": "ca4d093",
        "S-NKJV": "24c111a"
    },
    "2025": {
        "B-ESV": "c31b01c",
        "B-KJV": "8cd98a0",
        "B-NASB": "5d20f2f",
        "B-NIV": "58c4a95",
        "B-NKJV": "4f31328",
        "J-ESV": "e2b35dd",
        "J-KJV": "129becd",
        "J-NASB": "38730a4",
        "J-NIV": "5c35d9f",
        "J-NKJV": "e6f13bf",
        "P-ESV": "10baf2e",
        "P-KJV": "c2a21f3",
        "P-NASB": "00628c0",
        "P-NIV": "b404736",
        "P-NKJV": "a6051aa",
        "S-ESV": "42fd366",
        "S-KJV": "968beb8",
        "S-NASB": "911e671",
        "S-NIV": "e3a5e1c",
        "S-NKJV": "ae60adf"
    },
    "2026": {
        "B-ESV": "685194f",
        "B-KJV": "de5e2d3",
        "B-NASB": "0a25886",
        "B-NIV": "125753f",
        "B-NKJV": "b8be0b3",
        "J-ESV": "38f7690",
        "J-KJV": "e9e1d39",
        "J-NASB": "3febd14",
        "J-NIV": "f7dcfbb",
        "J-NKJV": "ceb0658",
        "P-ESV": "c18ad79",
        "P-KJV": "ddd2155",
        "P-NASB": "2dfe345",
        "P-NIV": "05e4b9b",
        "P-NKJV": "4cf0b6f",
        "S-ESV": "db08680",
        "S-KJV": "fa1968c",
        "S-NASB": "fc80b77",
        "S-NIV": "e52b376",
        "S-NKJV": "ea1b605"
    }
};
var verseReq;
var verseCardCache = {};
function loadVerseCardData(division, version, cb)
{
    var key;
    
    if (!version) {
        cb = version;
        version = "KJV";
    }
    key = division + "-" + version;
    var cacheKey = key + "-" + yearSelect.value;
    if (verseCardCache[cacheKey]) {
        return setTimeout(function ()
        {
            cb(verseCardCache[cacheKey]);
        }, 0);
    }
    
    if (verseReq && verseReq.status !== "DONE") {
        verseReq.cancelRequest();
    }
    var baseDir = "";
    if(window.location.href.startsWith("https")) {
        baseDir = "/bb-printables/memory-sheets/"
    }
    verseReq = request(baseDir + "verseCards/NBBC-" + yearSelect.value + "/" + key + "-" + cardHashes[yearSelect.value][key] + ".json", function (err, data)
    {
        if (err) {
            console.error(err);
            alert("Could not load verses.");
        } else {
            verseCardCache[cacheKey] = data;
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
            i++
        }
        var notSS = cards.slice(i);
        notSS.sort(function(a,b) {
            return a.wordCount - b.wordCount;
        })
        cards = notSS;
        i = 0;
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