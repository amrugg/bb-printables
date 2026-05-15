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
        data = data.replaceAll("￼", "");
        if(data.includes("You've been getting these terms right!")) {
            alert("Detected the substring:\n" + "You've been getting these terms right!" + "\nin your set. You may want to double-check your input—you may have accidentally copied a Quizlet message.");
        }
        if(termDefSep === "|") {
            termDefSep = "\\|"
        }

        termDefSep = new RegExp(parseSeparator(termDefSep))
        cardSep = new RegExp(parseSeparator(cardSep), "g");
        
        var cards = [];
        var cardList = data.split(cardSep);
        debugger
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
    var page = document.body;

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
    function createFlashcardsPDF(cardTextArr, cardsPerPage, fontSize, fontFamily) {
        function wrapText(text, maxWidth, font, fontSize) {
            // 1. Split the text by explicit newlines (\n) first
            const paragraphs = text.split("\n");
            let lines = [];

            // 2. Loop through each paragraph and wrap lines that are too long
            for (let p of paragraphs) {
                const words = p.split(/([ \/])/);
                let currentLine = "";

                for (let word of words) {
                    // Test what the line would look like if we added the next word
                    const testLine = currentLine.length === 0 ? word : currentLine + word;
                    
                    // Measure the width of the test line
                    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

                    if (testWidth > maxWidth && currentLine.length > 0) {
                        // If it's too wide, push the current line and start a new one
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        // Otherwise, keep adding to the current line
                        currentLine = testLine;
                    }
                }
                // Push whatever is left over
                if (currentLine) {
                    lines.push(currentLine);
                }
            }
            return lines;
        }
        
        const { PDFDocument, rgb } = PDFLib;

        let pdfDoc;
        let page;

        const inch = 72;
        const pageWidth = 8.5 * inch;
        const pageHeight = 11 * inch;
        
        const cardWidth = 4 * inch;
        const cardHeight = 2.5 * inch * 8/cardsPerPage;
        const columns = 2;
        const rows = cardsPerPage/columns;

        const totalGridWidth = cardWidth * columns;
        const totalGridHeight = cardHeight * rows;
        const leftMargin = (pageWidth - totalGridWidth) / 2;    
        const bottomMargin = (pageHeight - totalGridHeight) / 2; 

        // Define padding so text doesn't touch the edge of the flashcard
        const textPadding = 0.25 * inch; 
        const maxTextWidth = cardWidth - (textPadding * 2);

        var maxPages = Math.ceil(cardTextArr.length * 2 / cardsPerPage)
        if(maxPages % 2) {
            /// Always have to have an even number of pages
            maxPages += 1;
        }

        PDFDocument.create()
            .then(function (doc) {
                pdfDoc = doc;
                
                pdfDoc.registerFontkit(fontkit);
                
                // 3. Fetch the .ttf file from your public folder
                // (Make sure the file name matches what you downloaded)
                return fetch("/fonts/" + fontFamily + ".ttf");
            })
            .then(function (res) {
                if (!res.ok) throw new Error("Could not load font file");
                // Convert the fetched font into raw bytes
                return res.arrayBuffer();
            })
            .then(function (fontBytes) {
                // 4. Embed the custom font into the PDF
                return pdfDoc.embedFont(fontBytes);
            })
            .then(function (font) {
                // Line height is typically 1.2x the font size
                const lineHeight = fontSize * 1.2; 
                for(var pageNum = 0; pageNum < maxPages; pageNum++) {
                    page = pdfDoc.addPage([pageWidth, pageHeight]);
                    for (let i = 0; i < cardsPerPage; i++) {
                        const col = i % columns; 
                        const row = Math.floor(i / columns); 

                        const x = leftMargin + (col * cardWidth);
                        const invertedRow = (rows - 1) - row; 
                        const y = bottomMargin + (invertedRow * cardHeight);

                        // Draw the flashcard box
                        page.drawRectangle({
                            x: x,
                            y: y,
                            width: cardWidth,
                            height: cardHeight,
                            borderColor: rgb(0.5, 0.5, 0.5),
                            borderWidth: 1,
                        });
                        
                        // --- TEXT WRAPPING & CENTERING MATH ---
                        // const rawText = flashcardData[i];
                        var pageOffset = Math.floor(pageNum/2);
                        var alternateCardOffset = 0;
                        if(pageNum % 2) {
                            if(i % 2 == 0) {
                                alternateCardOffset = 1
                            } else {
                                alternateCardOffset = -1
                            }
                        }
                        var cardIndex = i + pageOffset * cardsPerPage + alternateCardOffset;
                        if(cardIndex >= cardTextArr.length) {
                            continue;
                        }
                        var rawText = cardTextArr[cardIndex][pageNum % 2];
                        
                        // Get the array of wrapped lines
                        const lines = wrapText(rawText, maxTextWidth, font, fontSize);
                        maxLines = Math.floor(cardHeight * 0.9 / lineHeight)
                        if(lines.length > maxLines) {
                            lines.length = maxLines - 1;
                            lines[lines.length-1] = lines[lines.length-1].substring(0, lines[lines.length-1].length - 3) + "...";
                        }
                        // Calculate total height of the text block to vertically center it
                        const totalTextHeight = lines.length * lineHeight;
                        
                        // Calculate the Y coordinate for the VERY FIRST line
                        let currentY = (y + cardHeight / 2) + (totalTextHeight / 2) - fontSize;

                        // Loop through each line and draw it
                        for (let line of lines) {
                            // Horizontally center this specific line
                            const lineWidth = font.widthOfTextAtSize(line, fontSize);
                            const currentX = x + (cardWidth / 2) - (lineWidth / 2);

                            page.drawText(line, {
                                x: currentX,
                                y: currentY,
                                size: fontSize,
                                font: font,
                                color: rgb(0, 0, 0),
                            });

                            // Move down for the next line
                            currentY -= lineHeight;
                        }
                    }
                }

                return pdfDoc.save();
            })
            .then(function (pdfBytes) {
                const blob = new Blob([pdfBytes], { type: "application/pdf" });
                const pdfUrl = URL.createObjectURL(blob);
                var preview = document.getElementById("pdf-preview");
                preview.src = pdfUrl;
                preview.hidden = false;
            })
            .catch(function (error) {
                console.error("An error occurred while generating the PDF:", error);
            });
    }

    document.getElementById("generate").onclick = function() {
        var data = getValue("data");
        var termDefSep = parseSeparator(getValue("term-def-sep"));
        var cardSep = parseSeparator(getValue("card-sep"));
        var cardsPerPage = parseInt(getValue("cards-per-page"), 10) || 8;
        var fontSize = document.getElementById("font-size").valueAsNumber || 15;
        var fontFamily = getValue("font-family").replaceAll(" ", "");
        if(fontSize < 3) {
            fontSize = 3;
        } else if(fontSize > 50) {
            fontSize = 50;
        }

        var cards = parseData(data, termDefSep, cardSep);
        if (!cards.length) {
            alert("No valid cards found. Please check your input and separators.");
            return;
        }
        localStorage.setItem("lastCards", data);
        
        createFlashcardsPDF(cards, cardsPerPage, fontSize, fontFamily);
    };

    document.getElementById("back").onclick = function() {
        setDisplay("output-section", "none");
        setDisplay("input-section", "block");
    };

    document.getElementById("print").onclick = function() {
        window.print();
    };
    var elsToHoldMemory = ["data", "term-def-sep", "card-sep", "cards-per-page", "font-size", "font-family"];
    elsToHoldMemory.forEach(function(elName) {
        var el = document.getElementById(elName)
        if(false && el.nodeName === "TEXTAREA") {
            console.log(elName);
            el.addEventListener("input", function() {
                localStorage.setItem("last-" + elName, el.textContent);
            });
        } else {
            el.addEventListener("input", function() {
                localStorage.setItem("last-" + elName, el.value);
            });
        }
    });
    try {
        elsToHoldMemory.forEach(function(elName) {
            var el = document.getElementById(elName);
            var val = localStorage.getItem("last-" + elName);
            if(!val) return;

            if(false && el.nodeName === "TEXTAREA") {
                el.textContent = val;
            } else {
                el.value = val;
            }
        });
    } catch {

    }
    function saveMem() {
        elsToHoldMemory.forEach(function(elName) {
            var el = document.getElementById(elName);
            localStorage.setItem("last-" + elName, el.value);
        });
    }

    presetsCont = document.getElementById("presets-cont");
    presetsCont.appendChild(
        cde("button", {t: "Default Export", onclick: function() {
            document.getElementById("term-def-sep").value = "\\t";
            document.getElementById("card-sep").value = "\\n";
            saveMem();
        }})
    );
    presetsCont.appendChild(
        cde("button", {t: "Slide-down", onclick: function() {
            document.getElementById("term-def-sep").value = "\\n";
            document.getElementById("card-sep").value = "\\n\\n\\n+";
            saveMem();
        }})
    );
    presetsCont.appendChild(
        cde("button.green-btn", {t: "What‘s this?", onclick: function() {
            showModal(
                "Exporting from Quizlet", 
                cde("div.modal-content", [
                    cde("p", {t: "I currently know of two good ways to get a Quizlet set off of Quizlet. The first is to use the built-in export tool."}),
                    cde("img", {src: "img/export.webp"}),
                    cde("p", {t: "If you use this tool with the default settings, the “Default Export” option should parse your cards correctly."}),

                    cde("p", {t: "However, this tool seems only to work with sets you've created yourself (or possibly sets you copy from others, but that sometimes doesn't work for me.) Thus, a different method must be found."}),
                    cde("p", {t: "Scroll down on the home page and show all the terms, not just the starred terms."}),
                    cde("img", {src: "img/start.webp"}),
                    cde("p", {t: "Select starting at the top and glide all the way down to the bottom."}),
                    cde("img", {src: "img/end.webp"}),
                    cde("p", {t: "Copy everything you just selected and paste it into the text cards area (making sure to “See More” if needed and erasing the “You've been getting these terms right!” dialogue if it appears.)"}),
                    cde("img", {src: "img/data.webp"}),
                    cde("p", {t: "Click on “Slide-down” (so named because you select at the top and then slide down) and the program should properly parse your cards."}),
                    cde("p", {t: "Note that this method might not work if the card set you select has multi-line terms or definitions. If it's not working, you might just have to type it out yourself."}),



                ])
            )
        }})
    )

    setupAboutButton();
    function setupAboutButton() {
        var aboutBtn = cde("button.about-btn no-print", {t: "About", onclick: function() {
            showModal(
                "Printable Flashcard Generator", 
                cde("div.modal-content", [
                    cde("p", {t: "This is a simple web app to generate printable flashcards."}),
                    cde("p", {t: "It's designed to take Quizlet sets and make printable PDFs from them. I know of two easy ways to extract the cards from Quizlet: hit “What's this?” under “Separator Presets” to learn more."}),
                    cde("p", {t: "Note that “Term/Definition Separator” and “Card Separator” are interpreted as regular expressions. If you're not using the presets and using text in some other format—for example using pipes (|) for your term/def separator—be aware that you have to backslash special characters (so use “\\|” instead of plain “|”.)"}),
                    cde("h1", {t: "Help and support"}),
                    cde("p", ["Please send any bug reports, feature requests, and fan mail to ", cde("a", {href: "mailto:aaron@bibleadventure.com", t: "aaron@bibleadventure.com"}), ". I will happily read any messages but I get very busy during Bible Bee season and may not have time to develop this project any further."]),
                    cde("p", ["Alternatively, make an issue or create a pull request on ", cde("a", {href: "https://github.com/amrugg/bb-printables", t: "Github."})]),
                    cde("p", ["Other tools I have made include ", cde("a", {href: "https://bibleadventure.com/memorySchedule/", t: "Memory Schedule"}), ", ", cde("a", {href: "https://amrugg.github.io/bb-printables/memory-sheets/", t: "Memory Sheets"}), ", and ", cde("a", {href: "https://scriptureleague.org/reference-recall/", t: "Reference Recall"}), " (Lord willing, coming for James at the end of May.)"]),
                    cde("p", ["— Aaron Rugg"]),
                    cde("p", ["1 Corinthians 1:31 (He that glorieth, let him ", cde("b", {t: "glory in the Lord."}), ")"])
                ])
            )
        }});
        page.appendChild(aboutBtn);
        
    }
    function showModal(title, content) {
        var header = cde("div.modal-header", {t: title});
        var closeBtn = cde("button.modal-close", {innerHTML: "&times;", onclick: closeModal});
        var content = content;
        var modal = cde("div.modal", [closeBtn, header, content])
        var overlay = cde("div.modal-overlay", {onclick: function(e) {
            if(e.target === overlay) {
                closeModal();
            }
        }}, [modal]);
        page.appendChild(overlay);
        function closeModal() {
            page.removeChild(overlay);
        }
    }
})();