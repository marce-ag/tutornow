
const mysql = require('mysql');
const myConnection = require('express-myconnection');


const dbOptions = {
  host: 'localhost',
  port: 3307,
  user: 'tutornow',
  password: 'tu_clave',
  database: 'dbtutornow',
};


function dbMiddleware(app) {
  app.use(myConnection(mysql, dbOptions, 'single'));
}

module.exports = {
  dbOptions,
  dbMiddleware,
};
