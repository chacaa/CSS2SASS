const testFile = './test.css';
const postcss = require('postcss');
const fileManager = require('./utils/fileManager.js');
const errorManager = require('./utils/errorManager.js');
const treeManager = require('./treeManager.js');

function generateVariables(parsedCSS, allValuesAsVariables) {
    var valuesArray = [];
    var repeatedValues = [];
    var variables = [];

    var nodes = parsedCSS.nodes;
    for (var i=0; i < nodes.length; i++) {
        if (nodes[i].type != 'comment') {
            var attributes = nodes[i].nodes;
            for (var j=0; j< attributes.length; j++) {
                if (attributes[j].type === 'decl') {
                    var value = attributes[j].value;
                    if (valuesArray.includes(value)) {
                        if (!repeatedValues.includes(value)) {
                            repeatedValues.push(value);
                        }
                    } else {
                        valuesArray.push(value);
                    }
                }
            }
        }
    }

    var index = 0;
    var variable = [];
    if (allValuesAsVariables) {
        for (var k=0; k < valuesArray.length; k++) {
            variable = ['$var' + index, valuesArray[k]];
            variables.push(variable);
            index ++;
        }
    } else {
        for (var k=0; k < repeatedValues.length; k++) {
            variable = ['$var' + index, repeatedValues[k]];
            variables.push(variable);
            index ++;
        }
    }

    return variables;
}

function iterateOverTheAttributes(attributes, variables, numOfIndentation) {
    var indentation = generateIndentation(numOfIndentation);
    for (var j=0; j< attributes.length; j++) {
        if (attributes[j].type === 'decl') {
            var replaced = false;
            for(var m=0; m<variables.length; m++) {
                if (variables[m][1] == attributes[j].value) {
                    console.log(indentation + attributes[j].prop + ': ' + variables[m][0]);
                    replaced = true;
                    break;
                }
            }

            if (!replaced) {
                console.log(indentation + attributes[j].prop + ': ' + attributes[j].value);
            }
        }
    }
}

function generateIndentation(number) {
    var indentation = '';
    for (var i=0; i<number; i++) {
        indentation += '\t';
    }
    return indentation;
}

function generateSASSFile(parsedCSS, allValuesAsVariables) {
    var variables = generateVariables(parsedCSS, allValuesAsVariables);
    var numOfIndentation = 1;
    for (var k=0; k < variables.length; k++) {
        console.log(variables[k][0] + ' = ' + variables[k][1]);
    }

    var nodes = parsedCSS.nodes;
    for (var i=0; i < nodes.length; i++) {
        if (nodes[i].type === 'comment') {
            console.log('/* ' + nodes[i].text + ' */');
        } else {
            var selector = nodes[i].selector;
            var splitBySpace = selector.split(" ");
            var splitByComma = selector.split(",");
            if (splitBySpace.length > 1 || splitByComma > 1) {
                if (splitBySpace.length > 1) {
                    console.log(splitBySpace[0]);
                    for (var j=1; j < splitBySpace.length; j++) {
                        numOfIndentation ++;
                        var indentation = generateIndentation(j);
                        console.log(indentation+splitBySpace[j]);
                    }
                    var attributes = nodes[i].nodes;
                    iterateOverTheAttributes(attributes, variables, numOfIndentation);
                } else {
                    //TODO
                }
            } else {
                console.log(nodes[i].selector);
                var attributes = nodes[i].nodes;
                iterateOverTheAttributes(attributes, variables, numOfIndentation);
            }
        }
    }
}

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
