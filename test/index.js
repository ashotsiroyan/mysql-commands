const express = require('express');
const sqltool = require('@ashotsiroyan/sqltool');

const User = require('./models/user');

const app = express();

const port = 5000;

app.get('/users', async (req, res)=>{
    try{
        let users = await User.find().exec();
        res.status(200).json({users: users});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal error.'});
    }
});

app.get('/users/:id', async (req, res)=>{
    User.findById(req.params.id, (err, user)=>{
        if(err){
            console.error(err);
            res.status(500).json({error: 'Internal error.'});
        }else if(!user){
            res.status(404).json({error: 'Incorrect user id.'});
        }else{
            res.status(200).json({user: user});
        }
    })
});

app.post('/users', (req, res)=>{
    const user = User.new(req.body);

    user.save((err)=>{
        if(!err){
            res.status(200).json({success: true})
        }
        else{
            console.error(err);
            res.status(500).json({error: 'Error adding new user.'});
        }
    });
});

app.put('/users/:id', (req, res)=>{
    User.updateOne({_id: req.params.id}, req.body, (err)=>{ //.findByIdAndUpdate(req.params.id, req.body
        if(!err){
            res.status(200).json({success: true})
        }
        else{
            console.error(err);
            res.status(500).json({error: 'Error updating user.'});
        }
    });
});

app.delete('/users/:id', (req, res)=>{
    User.deleteOne({_id: req.params.id}, (err)=>{ //.findByIdAndDelete(req.params.id
        if(!err){
            res.status(200).json({success: true})
        }
        else{
            console.error(err);
            res.status(500).json({error: 'Error deleting user.'});
        }
    });
});

async function start(){
    try{
        await sqltool.connect({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test',
        });
        console.log('DB connected.');
        app.listen(port);
        console.log('Server is running on port:' + port);
    }catch(err){
        console.error(err);
    }
}

start();

