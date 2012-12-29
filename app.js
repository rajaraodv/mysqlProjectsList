var express = require('express'),
    http = require('http'),
    path = require('path'),
    mysql = require('mysql'),
    lib = require('./db.js');

//This config will be auto-swapped by CF w/ proper conf. (PS: auto-reconfiguration)
var connection = mysql.createConnection({
    host:'localhost',
    user:'raja',
    password:'test'
});

connection.connect(function (err) {
    if (err) return console.log(err);

    lib.setupDBAndTable(connection);
});

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

//Create
app.post('/todo', function (req, res) {
    var b = req.body;
    var task = {name:b.name, site:b.site, description:b.description};

    lib.addTask(task, function (err, info) {
        if (err) {
            return res.json({"error":"something went wrong" + err});
        }
        task.id = info.insertId;
        res.json(task);
    });
});

//Read
app.get('/todo', function (req, res) {
    //if id is passed, return that task
    if (req.query.id) {
        lib.getTask(req.query.id, function (err, rows) {
            return err ? res.json(err) : res.json(rows && rows[0]);
        });
    } else { //return all tasks
        lib.getTasks(function (err, rows) {
            return err ? res.json(err) : res.json(rows);
        });
    }
});

//Update
app.put('/todo', function (req, res) {
    var b = req.body;
    var task = {name:b.name, site:b.site, description:b.description};

    lib.updateTask(req.query.id, task, function (err, info) {
        if (err) {
            return res.json({"error":"something went wrong" + err});
        }
        res.json(task);
    });
});


//Delete
app.delete('/todo', function (req, res) {
    lib.deleteTask(req.query.id, function (err, info) {
        res.json({"Error":err});
    });
});


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});