/*
Libraries that i am currently using:
    * CSSTree: https://github.com/csstree/csstree
    * parse-xml: https://github.com/rgrove/parse-xml
    * CSS Tree Validator: https://github.com/csstree/validator
*/

const testFile = './test.css'

String.prototype.format = function()
{
   var content = this;
   for (var i=0; i < arguments.length; i++)
   {
        var replacement = '{' + i + '}';
        content = content.replace(replacement, arguments[i]);  
   }
   return content;
};

function printErrors(errors) {
    errors.forEach( function(value, index, array) {
        var attributes = value["attributes"];
        if (value["name"] == 'error' && attributes["severity"] == 'error') {
            console.log("Error: {0} at column {1}, line {2}."
                .format(attributes["message"], attributes["column"], attributes["line"]));
        }
    });
}

/* 
There is another way to manage errors when parsing the file, but i feel
the way i show the error is simpler and cleaner than the way that is provided
by the library itself.
Link to the doc: https://github.com/csstree/csstree/blob/master/docs/parsing.md
*/
function checkErrorsInCSSFile(file) {
    const validateFile = require('csstree-validator').validateFile;
    const reporter = require('csstree-validator').reporters.checkstyle;
    const parseXml = require('@rgrove/parse-xml');

    var errors = reporter(validateFile(file));
    var parsedErrors = parseXml(errors);
    var errorList = parsedErrors["children"][0]["children"][1]["children"]; 

    /* If there isn't any errors the library puts an empty element in the list, so
    if the file has errors the the size of errorList is > 1 */
    if (errorList.length > 1) {
        printErrors(errorList);
        return true;
    }

    return false;
    console.log(parsedErrors["children"][0]["children"][1]);
}

function readFile(file) {
    var fs = require('fs');
    var contents = fs.readFileSync(file, 'utf8');
    console.log(contents + '\n');
    return contents;
}

console.log("Original CSS:\n");
var cssFile = readFile(testFile);
console.log("AST generated from the CSS:\n")
var errorsDetected = checkErrorsInCSSFile(testFile);
if (!errorsDetected) {
    var csstree = require('css-tree');
    var ast = csstree.parse(cssFile);
    console.log(csstree.generate(ast));
}



