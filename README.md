# MySQL commands
MySQL commands is a MySQL object modeling tool designed to work in an asynchronous environment. MySQL commands supports both promises and callbacks.

## Installation
```
$ npm install @ashotsiroyan/mysql-commands
```

## Importing
```js
// Using Node.js `require()`
const mysql = require('@ashotsiroyan/mysql-commands');

// Using ES6 imports
import mysql from '@ashotsiroyan/mysql-commands';
```

## Overview

### Connecting to MySQL

```js
await mysql.connect({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_name'
});
```

Once connected, the `open` event is fired on the `Connection` instance. If you're using `mysql.connect`, the `Connection` is `mysql.connection`. Otherwise, `mysql.createConnection` return value is a `Connection`.

Important! MySQL commands buffers all the commands until it's connected to the database. This means that you don't have to wait until it connects to MySQL in order to define models.

### Defining a Model
Models are defined through the Schema interface.

```js
const Schema = mysql.Schema;

const BlogPost = new Schema({
  author: 'VARCHAR',
  title: 'VARCHAR',
  body: 'TEXT',
  date: 'DATE'
});
```
or

```js
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

```js
const MyModel = mysql.model('ModelName');
```

Or just do it all at once

```js
const MyModel = mysql.model('ModelName', mySchema);
```
The first argument is the singular name of the table your model is for. 


Once we have our model, we can then instantiate it, and save it:
```js
const instance = new MyModel();
instance.key = 'hello';
instance.save(function (err) {
  //
});
```

We can find documents from the same table
```js
MyModel.find({}).exec(function (err, docs) {
  // docs.forEach
});
```

You can also findOne, findById, update, etc.
```js
const instance = await MyModel.findOne({ ... }).exec();
console.log(instance.key);  // 'hello'
```

Important! If you opened a separate connection using mysql.createConnection() but attempt to access the model through mysql.model('ModelName') it will not work as expected since it is not hooked up to an active db connection. In this case access your model through the connection you created:
```js
const conn = mysql.createConnection({connection params});
const MyModel = conn.model('ModelName', schema);
const m = new MyModel;
m.save(); // works
```

vs

```js
const conn = mysql.createConnection({connection params});
const MyModel = mysql.model('ModelName', schema);
const m = new MyModel;
m.save(); // does not work b/c the default connection object was never connected
```