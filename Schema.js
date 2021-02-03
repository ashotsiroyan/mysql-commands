const dataTypes = require('./assets/dataTypes');

class Schema{
    #mysql = "";
    #options;
    #definition;
    #methods = {}
    constructor(definition = {}, options = {}){
        this.#definition = definition;
        this.#options = options;

        this.#convertToString();
    }
    getParams(){
        return {
            sqlString: this.#mysql,
            definition: Object.keys(this.#definition),
            methods: this.#methods,
            options: this.#options
        }
    }
    pre(method, callBack){
        this.#methods[method] = callBack;
    }
    #convertToString = () =>{
        if(this.#options.id === undefined || this.#options.id)
            this.#definition = {_id: {type: 'VARCHAR', length: 24}, ...this.#definition}

        Object.keys(this.#definition).forEach((field, i)=>{
            let option = this.#definition[field];
            this.#mysql += `${field} `;

            if(typeof option === "object"){
                let size = "";

                if(option.length){
                    if(dataTypes[option.type].min !== null && option.length > dataTypes[option.type].min)
                        size = `(${option.length})`;
                    else if(dataTypes[option.type].min)
                        size = `(${dataTypes[option.type].min})`;

                    if(dataTypes[option.type].max !== null && option.length < dataTypes[option.type].max)
                        size = `(${option.length})`;
                    else if(dataTypes[option.type].max)
                        size = `(${dataTypes[option.type].max})`;

                }else if(dataTypes[option.type].default){
                    size = `(${dataTypes[option.type].default})`;
                }
                
                this.#mysql += `${option.type}${size} `;

                if(option.null === undefined)
                    option.null = false;

                Object.keys(option).forEach((key, j)=>{
                    if(key === 'null')
                        this.#mysql += `${!option[key]?"NOT ":""}${key.toUpperCase()}${j !== Object.keys(option).length - 1?" ":''}`; 
                    else if(key !== 'type' && key !== 'length' && option[key])
                        this.#mysql += `${key.toUpperCase()}${key === 'auto_increment'?" PRIMARY KEY":` ${typeof option[key] === 'string'?"'":""}${option[key]}${typeof option[key] === 'string'?"'":""}`}${j !== Object.keys(option).length - 1?" ":''}`; 
                });
            }else{
                this.#mysql += `${option.type}${dataTypes[option.type].default?"(" + dataTypes[option.type].default + ")":""} NOT NULL`;
            }

            if(i !== Object.keys(this.#definition).length - 1)
                this.#mysql += ", ";
        });
    }
}

module.exports = Schema;