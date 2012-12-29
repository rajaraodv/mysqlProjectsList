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
    connection.query('SHOW TABLES LIKE "todos";', function (err, rows) {
        if (err) return console.log(err);

        //create table if it's not already setup
        if (rows.length == 0) {
            var sql = "" +
                "CREATE TABLE todos(" +
                " id INT UNSIGNED NOT NULL auto_increment," +
                " name VARCHAR(50) NOT NULL default ''," +
                " site VARCHAR(50) NOT NULL default ''," +
                " description VARCHAR(200) NOT NULL default ''," +
                " PRIMARY KEY (id)" +
                ");";

            connection.query(sql, function (err) {
                console.log(2);
                if (err) return console.log(err);
            });
        }

    });

};

exports.addTask = function (task, callback) {
    connection.query("INSERT INTO todos (name, site, description) VALUES (?, ?, ?)", [task.name, task.site, task.description], callback);
};

exports.updateTask = function (id, task, callback) {
    var sql = "UPDATE todos SET name='" + task.name
        + "', site='" + task.site
        + "', description='" + task.description
        + "' WHERE id=" + id;

    connection.query(sql, callback);
};

exports.getTasks = function (callback) {
    connection.query("SELECT * FROM todos", callback);
};

exports.getTask = function (id, callback) {
    connection.query("SELECT * FROM todos WHERE id=" + id, callback);
};

exports.deleteTask = function (id, callback) {
    connection.query("DELETE FROM todos WHERE id=" + id, callback);
};