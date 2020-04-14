const osmosis = require("osmosis");
const sbd = require("sbd");
const syllable = require("syllable");
const pos = require("pos");
const tagger = new pos.Tagger(); // We only need one
const lexer = new pos.Lexer(); // Again, only one needed
const rhyme = require("rhyme");



function cleanText(text) {
    let cleanerText = text.replace(/\[[0-9]+\]/g, "");
    return cleanerText;
}

async function getText() {
    return new Promise((resolve, reject) => {
        let contents = [];
        osmosis.get("https://en.wikipedia.org/wiki/Presidency_of_Donald_Trump") // Crawl this webpage
            .find("p") // Get all elements matching this CSS selector
            .set("contents") // Set the text contents of those elements to the "contents" property of an object
            .data(item => contents.push(item.contents)) // Pass that object to this function
            .done(() => resolve(contents)) // Call this when you're done
            .error(e => reject(e));
    });
}

function scramble(array) {
    for (let i = 0; i < array.length; i++) {
        const randomIndex = Math.floor(Math.random() * array.length);
        const tmp = array[randomIndex];
        array[randomIndex] = array[i];
        array[i] = tmp;
    }
}

async function loadRhymingDictionary() {
    return new Promise((resolve) => {
        rhyme(r => resolve(r));
    });
}


async function petrarchan() {
    const paragraphs = await getText();
    const rhymingDictionary = await loadRhymingDictionary();
    const rhymeGroups = {};

    // Assume fragment is an array of words
    function storeFragment(fragment) {
        let lastWord = fragment.slice(-1)[0];
        let pronunciations = rhymingDictionary.pronounce(lastWord);
        if (pronunciations && pronunciations.length > 0) {
            // Assume that the rhyme class is the last three phonemes
            // This isn't really true, but it's a decent approximation
            const rhymeClass = pronunciations[0].slice(-3).join(" ");

            // If we've never encountered a word like this, create a new array
            if (!rhymeGroups[rhymeClass]) rhymeGroups[rhymeClass] = [];

            // Push this fragment into the array
            rhymeGroups[rhymeClass].push(fragment);
        }
    }

    // Go through the paragraphs, chop them into fragments and store them
    paragraphs.forEach(pg =>{
        const cleanParagraph = cleanText(pg);
        const sentences = sbd.sentences(cleanParagraph);
        //filter out sentences with numbers
        sentences.forEach(function(sentence, index, theArray) {
            let pieces = sentence.split(",");
            pieces = pieces.filter(piece => {
                return !(piece.match(/[0-9]+/g));
            });
            theArray[index] = pieces.join(" ");
        });
        sentences.forEach(sentence => {
            let lexes = lexer.lex(sentence); // Use this to get an array of words
            for (let i = 0; i < lexes.length - 7; i++) {
                let fragment = lexes.slice(i, i + 7);
                storeFragment(fragment);
            }
        });
    });

    // A rhyme class isn't useful if it's all the same word
    let goodKeys = Object.keys(rhymeGroups);
    goodKeys = goodKeys.filter(key => {
        const lastWords = rhymeGroups[key].map(fragment => fragment.slice(-1)[0]); // Get the last word of each fragment
        // Make sure that they're not all the same
        return !lastWords.every(word => word.toLowerCase() === lastWords[0].toLowerCase()); 
    });

    function removeDuplicateEndings(rhymingFragments) {
        var uniqueEndings = new Set();
        var fragmentsWithUniqueEndings = [];

        for (var i=0; i<rhymingFragments.length; i++) {
            var ending = rhymingFragments[i].slice(-1)[0].toLowerCase();
            if (!uniqueEndings.has(ending)) {
                fragmentsWithUniqueEndings.push(rhymingFragments[i]);
                uniqueEndings.add(ending);
            }
        }
        return fragmentsWithUniqueEndings;
    }

    function getCouplet(goodKeys, rhymeGroups, amount) {
        //Keep trying to find rhyme groups until you have at least the amount needed
        do {
            scramble(goodKeys);
            var rhymingFragments = rhymeGroups[goodKeys[0]];
            //Reduce the rhyming fragments to only the fragments with unique endings.
            rhymingFragments = removeDuplicateEndings(rhymingFragments);
        } while (rhymingFragments.length < amount);


        scramble(rhymingFragments);

        //put all of the fragments needed into an array
        var fragments = []
        for (var i=0; i<amount; i++) {
            fragments.push(rhymingFragments[i].join(" "));
        }
        return fragments;
    }

    //Generate the petrarchan poem 

    const lines = [];

    const coupletA = getCouplet(goodKeys, rhymeGroups, 4);
    const coupletB = getCouplet(goodKeys, rhymeGroups, 4);
    const coupletC = getCouplet(goodKeys, rhymeGroups, 2);
    const coupletD = getCouplet(goodKeys, rhymeGroups, 2);
    const coupletE = getCouplet(goodKeys, rhymeGroups, 2);

    //use pop() so I dont' have to keep track of index

    //Octet of ABBAABBA
    lines.push(coupletA.pop());
    lines.push(coupletB.pop());
    lines.push(coupletB.pop());
    lines.push(coupletA.pop());
    lines.push(coupletA.pop());
    lines.push(coupletB.pop());
    lines.push(coupletB.pop());
    lines.push(coupletA.pop());

    //sestet of CDECDE
    lines.push(coupletC.pop());
    lines.push(coupletD.pop());
    lines.push(coupletE.pop());
    lines.push(coupletC.pop());
    lines.push(coupletD.pop());
    lines.push(coupletE.pop());

    return lines;
}



async function makePoem() {
    //return await firstWordsPoem();
    return await petrarchan();
}

if (require.main === module) {
    makePoem().then(res => console.log(res));
}

module.exports = {
    makePoem
};
