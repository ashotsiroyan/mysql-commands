const {Schema, model} = require('@ashotsiroyan/sqltool');

const User = new Schema({
    username: {type: 'VARCHAR', size: 32, lowercase: true},
    password: {type: 'VARCHAR', size: 255},
    age: {type: 'INT', unsigned: true}
},
{
    timestamps: true
});

User.pre('save', (params, next)=>{
    console.log(params);
    next();
});

User.index({age: 'age'});

module.exports = model('users', User);