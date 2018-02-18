const testFile = './test.css';
const postcss = require('postcss');
const fileManager = require('./utils/fileManager.js');
const errorManager = require('./utils/errorManager.js');

console.log("Original CSS:\n");
var cssFile = fileManager.readFile(testFile);
var errorsDetected = errorManager.checkErrorsInCSSFile(testFile);
if (!errorsDetected) {
    console.log("AST generated from the CSS:\n");
    var parsedCSS = postcss.parse(cssFile);
    console.log(parsedCSS.nodes[0].nodes);
}
