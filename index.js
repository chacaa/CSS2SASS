const testFile = './test.css';
const postcss = require('postcss');
const fileManager = require('./utils/fileManager.js');
const errorManager = require('./utils/errorManager.js');

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

function generateSASSFile(parsedCSS, allValuesAsVariables) {
    var variables = generateVariables(parsedCSS, allValuesAsVariables);
    for (var k=0; k < variables.length; k++) {
        console.log(variables[k][0] + ' = ' + variables[k][1]);
    }

    var nodes = parsedCSS.nodes;
    for (var i=0; i < nodes.length; i++) {
        if (nodes[i].type === 'comment') {
            console.log('/* ' + nodes[i].text + ' */');
        } else {
            console.log(nodes[i].selector);
            var attributes = nodes[i].nodes;
            for (var j=0; j< attributes.length; j++) {
                if (attributes[j].type === 'decl') {
                    var next = j + 1;
                    // if (next < attributes.length)
                    var replaced = false;
                    for(var m=0; m<variables.length; m++) {
                        if (variables[m][1] == attributes[j].value) {
                            console.log('\t' + attributes[j].prop + ': ' + variables[m][0]);
                            replaced = true;
                            break;
                        }
                    }

                    if (!replaced) {
                        console.log('\t' + attributes[j].prop + ': ' + attributes[j].value);
                    }
                }
            }
        }
    }
}

var cssFile = fileManager.readFile(testFile);
var errorsDetected = errorManager.checkErrorsInCSSFile(testFile);
if (!errorsDetected) {
    var parsedCSS = postcss.parse(cssFile);
    generateSASSFile(parsedCSS, true);
}
