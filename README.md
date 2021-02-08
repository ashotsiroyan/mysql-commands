### MySQL commands
MySQL commands is a MySQL object modeling tool designed to work in an asynchronous environment. MySQL commands supports both promises and callbacks.

### Installation
`$ npm install @ashotsiroyan/mysql-commands`

### Importing
```
// Using Node.js `require()`
const mysql = require('@ashotsiroyan/mysql-commands');

// Using ES6 imports
import mysql from '@ashotsiroyan/mysql-commands';
```

### Overview
Connecting to MySQL

```
await mysql.connect({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_name'
});
```

### Defining a Model
Models are defined through the Schema interface.

```
const Schema = mysql.Schema;

const BlogPost = new Schema({
  author: 'VARCHAR',
  title: 'VARCHAR',
  body: 'TEXT',
  date: 'DATE'
});
```

```
const Comment = new Schema({
  name: { type: 'VARCHAR', default: 'hahaha', size: 32 },
  age: { type: 'INT', index: true },
  bio: { type: 'VARCHAR' },
  date: { type: 'DATE', default: new Date() }
});

// middleware
Comment.pre('save', function (params, next) {
  notify('params.name'));
  next();
});
```
Take a look at the example in examples/schema/schema.js for an end-to-end example of a typical setup.

### Accessing a Model
Once we define a model through mysql.model('ModelName', mySchema), we can access it through the same function

`const MyModel = mysql.model('ModelName');`
Or just do it all at once

`const MyModel = mysql.model('ModelName', mySchema);`
The first argument is the singular name of the table your model is for. 

We can find documents from the same table

```
MyModel.find({}).exec(function (err, docs) {
  // docs.forEach
});
```
You can also findOne, findById, update, etc.

```
const instance = await MyModel.findOne({ ... }).exec();
console.log(instance.my.key);  // 'hello'
```

Important! If you opened a separate connection using mongoose.createConnection() but attempt to access the model through mongoose.model('ModelName') it will not work as expected since it is not hooked up to an active db connection. In this case access your model through the connection you created.

```
// retrieve my model
const BlogPost = mysql.model('BlogPost');

// create a blog post
const post = BlogPost.new();

post.save(function (err) {
  if (!err) console.log('Success!');
});
```
The same goes for removing them:

```
BlogPost.findById(myId, function (err, post) {
  if (!err) {
    post.comments[0].remove();
    post.save(function (err) {
      // do something
    });
  }
});
```
Embedded documents enjoy all the same features as your models. Defaults, validators, middleware. Whenever an error occurs, it's bubbled to the save() error callback, so error handling is a snap!
