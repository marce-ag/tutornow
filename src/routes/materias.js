
const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query('SELECT * FROM materias ORDER BY id DESC', (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener materias' });
      res.json(rows);
    });
  });
});



router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre de la materia es obligatorio' });
  }

  const nueva = { nombre, descripcion: descripcion || null };

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query('INSERT INTO materias SET ?', nueva, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear materia' });
      res.status(201).json({ id: result.insertId, ...nueva });
    });
  });
});



router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query(
      'UPDATE materias SET nombre=?, descripcion=? WHERE id=?',
      [nombre, descripcion || null, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar materia' });
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Materia no encontrada' });
        }
        res.json({ id, nombre, descripcion });
      }
    );
  });
});


router.delete('/:id', (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión' });

    conn.query('DELETE FROM materias WHERE id=?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar materia' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Materia no encontrada' });
      }
      res.json({ message: `Materia ${id} eliminada correctamente` });
    });
  });
});

module.exports = router;
