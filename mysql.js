const mysql = require('mysql2/promise');

var Singleton = (function() {
    var instance;

    return {
        pool: {
            execute: (sql, values) => {if(instance) return instance.execute(sql, values); else throw "Isn't connected to database.";},
            query: (sql, values) => {if(instance) return instance.query(sql, values); else throw "Isn't connected to database.";},
            escape: (value) => mysql.escape(value),
            format: (sql, values) => mysql.format(sql, values)
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