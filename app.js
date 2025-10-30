const express = require('express');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const morgan = require('morgan');

const app = express();


app.use(morgan('dev'));


app.use(myConnection(mysql, {
  host: 'localhost',
  user: 'tutornow',     
  password: 'tu_clave',  
  port: 3307,
  database: 'dbtutornow'
}, 'single'));


app.get('/', (req, res) => {
  res.send('Servidor TutorNow activo');
});


app.get('/db-check', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error conectando a la BD');
    conn.query('SHOW TABLES', (err, rows) => {
      if (err) return res.status(500).send('Error ejecutando consulta');
      res.send(`Conexión OK. Tablas encontradas: ${rows.length}`);
    });
  });
});

app.listen(8080, () => {
  console.log('Servidor TutorNow corriendo en http://localhost:8080');
});
