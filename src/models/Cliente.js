

class Cliente {
 
  static getAll(conn, callback) {
    conn.query('SELECT * FROM clientes', callback);
  }


  static getById(conn, id, callback) {
    conn.query('SELECT * FROM clientes WHERE id = ?', [id], callback);
  }

  
  static create(conn, data, callback) {
    const { usuario_id, nombre_completo, email, telefono } = data;
    conn.query(
      'INSERT INTO clientes (usuario_id, nombre_completo, email, telefono) VALUES (?, ?, ?, ?)',
      [usuario_id, nombre_completo, email, telefono || null],
      callback
    );
  }

  
  static update(conn, id, data, callback) {
    const { nombre_completo, email, telefono } = data;
    conn.query(
      'UPDATE clientes SET nombre_completo = ?, email = ?, telefono = ? WHERE id = ?',
      [nombre_completo, email, telefono || null, id],
      callback
    );
  }

  static delete(conn, id, callback) {
    conn.query('DELETE FROM clientes WHERE id = ?', [id], callback);
  }
}

module.exports = Cliente;
