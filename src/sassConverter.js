const postcss = require('postcss');
const fs = require('fs');
const treeManager = require('./treeManager.js');

module.exports = {
    unSASS: function(file, allVariables) {
        try {
            let cssFile = fs.readFileSync(file, 'utf8');
            let parsedCSS = postcss.parse(cssFile);
            return treeManager.getSASSTree(parsedCSS, allVariables);
        } catch (error) {
            return { 
                variables: null, 
                superClasses: null, 
                tree: null, 
                toString: null, 
                error 
            };
        }
    }
};
