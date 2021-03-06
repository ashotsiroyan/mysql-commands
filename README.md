# SQLtool
SQLtool is a MySQL object modeling tool designed to work in an asynchronous environment. SQLtool supports both promises and callbacks.

## Installation
```
$ npm install sqltool2
```

## Importing
```js
// Using Node.js `require()`
const sqltool = require('sqltool2');

// Using ES6 imports
import sqltool from 'sqltool2';
```

## Overview

### Connecting to MySQL
```js
await sqltool.connect({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_name'
});
```

Once connected, the `open` event is fired on the `Connection` instance. If you're using `sqltool.connect`, the `Connection` is `sqltool.connection`. Otherwise, `sqltool.createConnection` return value is a `Connection`.

**Important!** SQLtool buffers all the commands until it's connected to the database. This means that you don't have to wait until it connects to MySQL in order to define models.

### Defining a Model
Models are defined through the Schema interface.

```js
const Schema = sqltool.Schema;

const BlogPost = new Schema({
  author: 'VARCHAR',
  title: 'VARCHAR',
  body: 'TEXT',
  date: 'DATE'
});
```
The following example with some features.

```js
const Comment = new Schema({
  name: { type: 'VARCHAR', size: 32, default: 'hahaha' },
  age: { type: 'INT', unsigned: true },
  bio: { type: 'VARCHAR' },
  date: { type: 'DATE', default: new Date() }
});

// create index
Comment.index({name: 'text', bio: 'text'});

// middleware
Comment.pre('save', function (next) {
  console.log(this.name);
  next();
});
```

**Important!** We define table structure through model and table is created automatically.

### Accessing a Model
Once we define a model through `sqltool.model('ModelName', mySchema)`, we can access it through the same function

```js
const MyModel = sqltool.model('ModelName');
```

Or just do it all at once
```js
const MyModel = sqltool.model('ModelName', mySchema);
```

The first argument is the singular name of the table your model is for. 

Once we have our model, we can then instantiate it, and save it:
```js
const instance = MyModel.new();
instance.name = 'karen';
instance.save(function (err) {
  //
});
```

or

```js
const instance = MyModel.new({ name: 'karen' });
instance.save(function (err) {
  //
});
```

We can find documents from the same table
```js
// find all documents
MyModel.find({ }).exec(function (err, docs) {
  // docs.forEach
});

// find all documents named karen and at least 19
await MyModel.find({ name: 'karen', age: { $gte: 19 } }).exec();

// executes, passing results to callback
MyModel.find({ name: 'karen', age: { $gte: 19 } }).exec(function (err, docs) {
  // docs.forEach
});

// executes, name LIKE karen and only selecting the "name" and "age" fields
await MyModel.find({ name: { $in: 'karen' } }, ['name', 'age']).exec();

// find 3 documents and sort name in DESC order
await MyModel.find({ }).limit(3).sort({ name: -1 }).exec();

// find 3 documents skipping 4
await MyModel.find({ }).limit(3).skip(4).exec();
```

You can also `findOne`, `findById`, `updateOne`, etc.
```js
const instance = await MyModel.findOne({ ... }).exec();
console.log(instance.name);  // 'karen'
```

**Important!** If you opened a separate connection using `sqltool.createConnection()` but attempt to access the model through `sqltool.model('ModelName')` it will not work as expected since it is not hooked up to an active db connection. In this case access your model through the connection you created:
```js
const conn = await sqltool.createConnection({ conn_params });
const MyModel = conn.model('ModelName', schema);
const m = MyModel.new();
m.save(); // works
```

vs

```js
const conn = await sqltool.createConnection({ conn_params });
const MyModel = sqltool.model('ModelName', schema);
const m = MyModel.new();
m.save(); // does not work b/c the default connection object was never connected
```