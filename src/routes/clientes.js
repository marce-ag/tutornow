const express = require('express');
const router = express.Router();

/*
  Rutas CRUD para la tabla "clientes" de TutorNow.
  Campos: id, nombre_completo, email, telefono, created_at
*/

// 1. Obtener todos los clientes
router.get('/', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la BD:', err);
      return res.status(500).send('Error de conexión a la BD');
    }

    conn.query('SELECT * FROM clientes', (err, rows) => {
      if (err) {
        console.error('Error al obtener clientes:', err);
        return res.status(500).send('Error al obtener clientes');
      }

      res.json(rows);
    });
  });
});

// 2. Obtener un cliente por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la BD:', err);
      return res.status(500).send('Error de conexión a la BD');
    }

    conn.query('SELECT * FROM clientes WHERE id = ?', [id], (err, rows) => {
      if (err) {
        console.error('Error al buscar cliente:', err);
        return res.status(500).send('Error al buscar cliente');
      }

      if (rows.length === 0) {
        return res.status(404).send('Cliente no encontrado');
      }

      res.json(rows[0]);
    });
  });
});

// 3. Crear nuevo cliente
router.post('/', (req, res) => {
  const { nombre_completo, email, telefono } = req.body;

  if (!nombre_completo || !email) {
    return res.status(400).send('Nombre completo y email son obligatorios');
  }

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la BD:', err);
      return res.status(500).send('Error de conexión a la BD');
    }

    const nuevoCliente = {
      nombre_completo,
      email,
      telefono: telefono || null
    };

    conn.query('INSERT INTO clientes SET ?', nuevoCliente, (err, result) => {
      if (err) {
        console.error('Error al insertar cliente:', err);
        return res.status(500).send('Error al insertar cliente');
      }

      res.status(201).json({
        id: result.insertId,
        ...nuevoCliente
      });
    });
  });
});

// 4. Actualizar cliente
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono } = req.body;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la BD:', err);
      return res.status(500).send('Error de conexión a la BD');
    }

    const datosActualizados = {
      nombre_completo,
      email,
      telefono
    };

    conn.query(
      'UPDATE clientes SET ? WHERE id = ?',
      [datosActualizados, id],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar cliente:', err);
          return res.status(500).send('Error al actualizar cliente');
        }

        if (result.affectedRows === 0) {
          return res.status(404).send('Cliente no encontrado');
        }

        res.json({
          id,
          ...datosActualizados
        });
      }
    );
  });
});

// 5. Eliminar cliente
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión a la BD:', err);
      return res.status(500).send('Error de conexión a la BD');
    }

    conn.query('DELETE FROM clientes WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error al eliminar cliente:', err);
        return res.status(500).send('Error al eliminar cliente');
      }

      if (result.affectedRows === 0) {
        return res.status(404).send('Cliente no encontrado');
      }

      res.send(`Cliente con ID ${id} eliminado correctamente`);
    });
  });
});

module.exports = router;
