const express = require('express');
const mysql = require('mysql');
const myConnection = require('express-myconnection');
const morgan = require('morgan');
const path = require('path');


const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const tutoresRoutes = require('./routes/tutores');
const materiasRoutes = require('./routes/materias');

const app = express();
const PORT = process.env.PORT || 8080;


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(
  myConnection(
    mysql,
    {
      host: 'localhost',
      port: 3307,
      user: 'tutornow',
      password: 'tu_clave',
      database: 'dbtutornow'
    },
    'single'
  )
);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/admin', (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); 
});


app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/materias', materiasRoutes); 
app.use('/api/tutores', tutoresRoutes); 



app.get('/db-check', (req, res) => {
   
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('Error conectando a la BD');
    conn.query('SHOW TABLES', (err, rows) => {
      if (err) return res.status(500).send('Error ejecutando consulta');
      res.send(`Conexión OK. Tablas encontradas: ${rows.length}`);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor TutorNow corriendo en http://localhost:${PORT}`);
});