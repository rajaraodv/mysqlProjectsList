var connection;
exports.setupDBAndTable = function (conn) {

    //save connection
    connection = conn;

    //NOTE: This particular (https://github.com/felixge/node-mysql) Mysql module,
    // queues ALL 'connection.query' calls & runs queries in SEQUENCE so we don't have to nest them!
    //i.e. In the below code,
    //1. create todoDB DB & *its* callback is called FIRST,
    //2. then 'use todoDB' and *its callback* is called
    //3. then show tables query and *its callback* is called
    //4. then 'create' table is called

    //If not on Cloud Foundry, create DB 'todoDB' and then switch to it 'todoDB'
    //Note: Cloud Foundry does these steps automatically.
    if (!process.env.VCAP_SERVICES) {
        connection.query('CREATE DATABASE IF NOT EXISTS todoDB;', function (err) {
            if (err)  return console.log(err);
        });

        //Switch to 'todoDB' database
        connection.query('USE  todoDB;', function (err) {
            if (err)  return console.log(err);
        });
    }

    //setup 'todos' table w/ schema
    connection.query('show tables like "todos";', function (err, rows) {
        if (err) return console.log(err);

        //create table if it's not already setup
        if (rows.length == 0) {
            var sql = "" +
                "create table todos(" +
                " id int unsigned not null auto_increment," +
                " name varchar(50) not null default ''," +
                " site varchar(50) not null default ''," +
                " description varchar(200) not null default ''," +
                " primary key (id)" +
                ");";

            connection.query(sql, function (err) {
                console.log(2);
                if (err) return console.log(err);
            });
        }

    });

};

exports.addTask = function (task, callback) {
    connection.query("insert into todos (name, site, description) values (?, ?, ?)", [task.name, task.site, task.description], callback);
};

exports.updateTask = function (id, task, callback) {
    var sql = "update todos set name='" + task.name
        + "', site='" + task.site
        + "', description='" + task.description
        + "' where id=" + id;

    connection.query(sql, callback);
};

exports.getTasks = function (callback) {
    connection.query("select * from todos", callback);
};

exports.getTask = function (id, callback) {
    connection.query("select * from todos where id=" + id, callback);
};

exports.deleteTask = function (id, callback) {
    connection.query("delete from todos where id=" + id, callback);
};