/*
Libraries that i am currently using:
    * parse-xml: https://github.com/rgrove/parse-xml
    * CSS Tree Validator: https://github.com/csstree/validator
*/

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

module.exports = {
    checkErrorsInCSSFile : function(file) {
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
}
