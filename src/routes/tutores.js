
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {
      console.error('[TUTORES] Error de conexión:', err);
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }

    conn.query('SELECT * FROM tutores', (err, rows) => {
      if (err) {
        console.error('[TUTORES] Error al consultar:', err);
        return res.status(500).json({ error: 'Error al obtener tutores' });
      }
      res.json(rows);
    });
  });
});


router.post('/', (req, res) => {
  const { nombre_completo, email, telefono, precio_hora, descripcion } = req.body;

  if (!nombre_completo || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

 
  const USUARIO_ADMIN_ID = 1; 

  const nuevoTutor = {
    usuario_id: USUARIO_ADMIN_ID,
    nombre_completo,
    email,
    telefono: telefono || null,
    descripcion: descripcion || null,
    precio_hora: precio_hora || 0.0
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('[TUTORES] Error de conexión:', err);
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }

    conn.query('INSERT INTO tutores SET ?', nuevoTutor, (err, result) => {
      if (err) {
        console.error('[TUTORES] Error al insertar:', err);
        return res.status(500).json({ error: 'Error al crear tutor' });
      }
      res.status(201).json({ id: result.insertId, ...nuevoTutor });
    });
  });
});


router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono, precio_hora, descripcion } = req.body;

  if (!nombre_completo || !email) {
    return res.status(400).json({ error: 'Nombre y email son obligatorios' });
  }

  const datosActualizados = {
    nombre_completo,
    email,
    telefono: telefono || null,
    precio_hora: precio_hora || null,
    descripcion: descripcion || null
  };

  req.getConnection((err, conn) => {
    if (err) {
      console.error('[TUTORES] Error de conexión:', err);
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }

    conn.query(
      'UPDATE tutores SET ? WHERE id = ?',
      [datosActualizados, id],
      (err, result) => {
        if (err) {
          console.error('[TUTORES] Error al actualizar:', err);
          return res.status(500).json({ error: 'Error al actualizar tutor' });
        }
        res.json({ message: 'Tutor actualizado', id, ...datosActualizados });
      }
    );
  });
});


router.delete('/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('[TUTORES] Error de conexión:', err);
      return res.status(500).json({ error: 'Error de conexión a la base de datos' });
    }

    conn.query('DELETE FROM tutores WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('[TUTORES] Error al eliminar:', err);
        return res.status(500).json({ error: 'Error al eliminar tutor' });
      }
      res.json({ message: 'Tutor eliminado', id });
    });
  });
});

module.exports = router;
