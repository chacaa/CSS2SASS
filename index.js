const testFile = './test.css';
const postcss = require('postcss');
const fileManager = require('./utils/fileManager.js');
const errorManager = require('./utils/errorManager.js');
const treeManager = require('./treeManager.js');

var cssFile = fileManager.readFile(testFile);
console.log("Archivo CSS:");
console.log("============\n");
console.log(cssFile);
console.log("\n==================================================\n");
console.log("Archivo SASS:")
console.log("=============\n");
var errorsDetected = errorManager.checkErrorsInCSSFile(testFile);
if (!errorsDetected) {
    var parsedCSS = postcss.parse(cssFile);
    treeManager.generateSASSTree(parsedCSS, false);
}
