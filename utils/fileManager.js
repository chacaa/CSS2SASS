const fs = require('fs');

module.exports = {
    readFile: function(file) {
        var contents = fs.readFileSync(file, 'utf8');
        console.log(contents + '\n');
        return contents;
    }
 }
 