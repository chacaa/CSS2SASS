const sassConverter = require('./src/sassConverter');

module.exports = {
    unSASS: function(file, allVariables) {
        return sassConverter.unSASS(file, allVariables);
    }
};
