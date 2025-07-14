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
page.appendChild(cde("label", {title: "Contestant division"}, ["Division:", division]));

page.appendChild(cde("label", {title: "The version to use when ordering the cards.\nThere will be little to no difference for most versions."}, ["Version:", version]));
var date = cde("input", {type: "date"});
page.appendChild(cde("label", ["Date:", date]));
var nameInput = cde("input", {type: "text"});
page.appendChild(cde("label", ["Name (leave blank if none desired):", nameInput]));

var order = cde("select", [
    cde("option", {t: "Summer Study, then length"}),
    cde("option", {t: "Passage number order"}),
    cde("option", {t: "Length"}),
]);
page.appendChild(cde("label", {title: "The order the passages should be put in."} ["Order:", order]));
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
            event.emit("loadedVerseData");
        }, 0);
    }
    
    if (verseReq && verseReq.status !== "DONE") {
        verseReq.cancelRequest();
    }
    
    verseReq = request("/verseCards/NBBC-" + year + "/" + key + "-" + cardHashes[key] + ".json", function (err, data)
    {
        if (err) {
            console.error(err);
            alert("Could not load verses.");
        } else {
            verseCardCache[key] = data;
            cb(data);
            event.emit("loadedVerseData");
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