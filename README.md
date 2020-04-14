Petrarchan Poem Generator by Max Kim
===========================
1. "npm install"
2. "npm run poem" to see the poem in console 
3. "npm run watch" and navigate to localhost:3000 to see webpage



Features
===========================
1. Rhyming scheme of a petarchan: an octet of ABBAABBA followed by a sestet of CDECDE. (Not 10 syllables per line)
2. Different size/color depending on which rhyming line (A, B, C, D, E)
3. A photo of a random noun found from the text 



Things changed
===========================
1. A modified version of getCouplet(goodKeys, rhymeGroups) function. It now includes an additional parameter, "amount", which specifices the minimum number of fragments needed in a rhyming group. The function will now remove any fragment with duplicate endings instead of removing one specific fragment's ending. 

2. Changed the way that the fragments are selected to filter out numbers and also lengthen the fragments so that they are of decent length, instead of short phrases

3. Formatting of the HTML page is changed to make it more colorful and interesting



Random Facts 
===========================
1. Text is taken from Donald Trump's wikipedia page 



