
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query('SELECT * FROM clientes ORDER BY id DESC', (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener clientes' });
      res.json(rows);
    });
  });
});


router.post('/', (req, res) => {
  const { nombre_completo, email, telefono } = req.body;

  if (!nombre_completo || !email) {
    return res.status(400).json({ error: 'Nombre completo y email son obligatorios' });
  }

  const nuevo = { nombre_completo, email, telefono: telefono || null };

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query('INSERT INTO clientes SET ?', nuevo, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear cliente' });
      res.status(201).json({ id: result.insertId, ...nuevo });
    });
  });
});


router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
      'UPDATE clientes SET nombre_completo=?, email=?, telefono=? WHERE id=?',
      [nombre_completo, email, telefono || null, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar cliente' });
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ id, nombre_completo, email, telefono });
      }
    );
  });
});


router.delete('/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query('DELETE FROM clientes WHERE id=?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar cliente' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json({ message: `Cliente ${id} eliminado correctamente` });
    });
  });
});

module.exports = router;
