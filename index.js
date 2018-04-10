const testFile = './test.css';
const postcss = require('postcss');
const fs = require('fs');
const treeManager = require('./treeManager.js');

try {
    let cssFile = fs.readFileSync(testFile, 'utf8');
    let parsedCSS = postcss.parse(cssFile);
    treeManager.generateSASSTree(parsedCSS, false);
} catch (error) {
    // if ( error.name === 'CssSyntaxError' ) {
        console.log(error.toString());
    // } 
}
