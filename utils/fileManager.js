const fs = require('fs');
var file = fs.createWriteStream('test.sass', {
    flags: 'a' // 'a' means appending (old data will be preserved)
});
  

module.exports = {
    readFile: function(file) {
        var contents = fs.readFileSync(file, 'utf8');
        return contents;
    },
    writeFile: function(text) {
        file.write(text);
    }
 }