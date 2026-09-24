const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'aidpriority.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  }
  db.run('PRAGMA foreign_keys = ON');
});

const nativeGet = db.get.bind(db);
const nativeAll = db.all.bind(db);
const nativeRun = db.run.bind(db);
const nativeExec = db.exec.bind(db);

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    nativeGet(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    nativeAll(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    nativeRun(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    nativeExec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = db;
module.exports.get = get;
module.exports.all = all;
module.exports.run = run;
module.exports.exec = exec;