const fs = require('fs');

module.exports = {
    readFile: function(file) {
        var contents = fs.readFileSync(file, 'utf8');
        return contents;
    }
 }