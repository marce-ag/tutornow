// src/controllers/clientesController.js
const Cliente = require('../models/Cliente');

// GET /admin/clientes
exports.listarClientes = (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión a la BD' });

    Cliente.getAll(conn, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al obtener clientes' });
      res.json(rows);
    });
  });
};

// GET /admin/clientes/:id
exports.obtenerCliente = (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión a la BD' });

    Cliente.getById(conn, id, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Error al buscar cliente' });
      if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
      res.json(rows[0]);
    });
  });
};

// POST /admin/clientes
exports.crearCliente = (req, res) => {
  const { usuario_id, nombre_completo, email, telefono } = req.body;

  if (!usuario_id || !nombre_completo || !email) {
    return res.status(400).json({
      error: 'usuario_id, nombre_completo y email son obligatorios',
    });
  }

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión a la BD' });

    Cliente.create(conn, { usuario_id, nombre_completo, email, telefono }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear cliente' });

      res.status(201).json({
        id: result.insertId,
        usuario_id,
        nombre_completo,
        email,
        telefono,
      });
    });
  });
};

// PUT /admin/clientes/:id
exports.actualizarCliente = (req, res) => {
  const { id } = req.params;
  const { nombre_completo, email, telefono } = req.body;

  if (!nombre_completo || !email) {
    return res.status(400).json({
      error: 'nombre_completo y email son obligatorios',
    });
  }

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión a la BD' });

    Cliente.update(conn, id, { nombre_completo, email, telefono }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar cliente' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      res.json({
        id,
        nombre_completo,
        email,
        telefono,
      });
    });
  });
};

// DELETE /admin/clientes/:id
exports.eliminarCliente = (req, res) => {
  const { id } = req.params;

  req.getConnection((err, conn) => {
    if (err) return res.status(500).json({ error: 'Error de conexión a la BD' });

    Cliente.delete(conn, id, (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar cliente' });
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }

      res.json({ message: `Cliente con ID ${id} eliminado correctamente` });
    });
  });
};
