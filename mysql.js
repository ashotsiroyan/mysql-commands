const mysql = require('mysql2/promise');

var Singleton = (function() {
    var instance;

    return {
        getInstance: function () {
            return instance;
        },
        connect: function (props) {
            try{
                instance = mysql.createPool(props);

                return true;
            }catch(err){
                throw err;
            }
        }
    };
})();

module.exports = Singleton;