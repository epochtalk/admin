var mysql = require('mysql');

var Lolipop = module.exports = function Lolipop(config) {
  if (!(this instanceof Lolipop)) {
    return new Lolipop(config);
  }
  this.pool = mysql.createPool(config);
}

Lolipop.prototype.getTables = function (err, callback) {
  if (err) {
    return callback(err);
  }

  var tables = [];

  this.pool.query('SHOW tables', function (err, rows) {
    rows.forEach(function (row) {
      tables.push(row[Object.keys(row)[0]]);
    });
    return callback(null, tables);
  });
}

Lolipop.prototype.getColumns = function (err, table, callback) {
  if (err) {
    return callback(err);
  }

  this.pool.query('SHOW columns FROM ' + mysql.escapeId(table), function (err, rows) {
    if (callback && typeof(callback) === "function") {
      return callback(null, rows);
    }
  });
}

Lolipop.prototype.createRowStream = function (err, table) {
  return this.pool.query('SELECT * FROM ' + mysql.escapeId(table)).stream();
}

Lolipop.prototype.createRowStreamWhere = function (err, table, obj) {
  return this.pool.query('SELECT * FROM ' + mysql.escapeId(table) + ' WHERE ' + mysql.escape(obj)).stream();
}

Lolipop.prototype.end = function (callback) {
  if (callback && typeof(callback) === "function") {
    this.pool.end(callback());
  }
  else {
    this.pool.end();
  }
}
