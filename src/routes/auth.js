
const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/register', (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  const role = rol || 'cliente';

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error conexión BD:', err);
      return res.status(500).json({ message: 'Error de conexión a la BD' });
    }


    conn.query(
      'SELECT id FROM usuarios WHERE username = ?',
      [email],
      (err, rows) => {
        if (err) {
          console.error('Error SELECT usuarios:', err);
          return res
            .status(500)
            .json({ message: 'Error consultando usuario existente' });
        }

        if (rows.length > 0) {
          return res
            .status(409)
            .json({ message: 'Ya existe un usuario con ese correo' });
        }

        
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
          if (err) {
            console.error('Error bcrypt.hash:', err);
            return res
              .status(500)
              .json({ message: 'Error al encriptar contraseña' });
          }

          const usuario = {
            username: email,
            password: hash,
            rol: role,
            status: 'active',
          };

       
          conn.query('INSERT INTO usuarios SET ?', usuario, (err, result) => {
            if (err) {
              console.error('Error INSERT usuarios:', err);
              return res
                .status(500)
                .json({ message: 'Error al crear usuario' });
            }

            const usuarioId = result.insertId;

            
            conn.query(
              'INSERT INTO clientes (usuario_id, nombre_completo, email) VALUES (?,?,?)',
              [usuarioId, nombre || email, email],
              (err2) => {
                if (err2) {
                  console.error('Error INSERT clientes:', err2);
                  
                }

                return res.json({
                  message:
                    'Cuenta creada correctamente. Ya puedes iniciar sesión.',
                });
              }
            );
          });
        });
      }
    );
  });
});

/**
 * POST /api/auth/login
 * Valida credenciales (email + password)
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error conexión BD:', err);
      return res
        .status(500)
        .json({ message: 'Error de conexión a la base de datos' });
    }

    conn.query(
      'SELECT * FROM usuarios WHERE username = ?',
      [email],
      (err, rows) => {
        if (err) {
          console.error('Error SELECT usuarios:', err);
          return res
            .status(500)
            .json({ message: 'Error al buscar usuario' });
        }

        if (rows.length === 0) {
          return res
            .status(401)
            .json({ message: 'Usuario o contraseña incorrectos' });
        }

        const user = rows[0];

        bcrypt.compare(password, user.password, (err, ok) => {
          if (err) {
            console.error('Error bcrypt.compare:', err);
            return res
              .status(500)
              .json({ message: 'Error al validar contraseña' });
          }

          if (!ok) {
            return res
              .status(401)
              .json({ message: 'Usuario o contraseña incorrectos' });
          }

          const redirectUrl = '/?user=' + encodeURIComponent(email);

          return res.json({
            message: 'Login correcto',
            redirect: redirectUrl,
          });
        });
      }
    );
  });
});

module.exports = router;
