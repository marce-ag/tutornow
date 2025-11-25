CREATE DATABASE IF EXISTS dbtutornow;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','tutor','cliente') DEFAULT 'cliente',
  status ENUM('active','inactive','pending') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

---

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre_completo VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_clientes_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

---

CREATE TABLE tutores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre_completo VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  descripcion TEXT,
  precio_hora DECIMAL(10,2) DEFAULT 0.00,
  activo TINYINT(1) DEFAULT 1,
  CONSTRAINT fk_tutores_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

---

CREATE TABLE materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB;

---

CREATE TABLE tutor_materia (
  tutor_id INT NOT NULL,
  materia_id INT NOT NULL,
  PRIMARY KEY (tutor_id, materia_id),
  CONSTRAINT fk_tm_tutor
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_tm_materia
    FOREIGN KEY (materia_id) REFERENCES materias(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

---

CREATE TABLE sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id INT NOT NULL,
  cliente_id INT NOT NULL,
  materia_id INT NOT NULL,
  fecha_hora DATETIME NOT NULL,
  duracion_min INT NOT NULL,
  estado ENUM('pendiente','confirmada','cancelada','finalizada') DEFAULT 'pendiente',
  notas TEXT,
  costo_total DECIMAL(10,2),
  calificacion_cliente TINYINT(1) CHECK (calificacion_cliente BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finalizada_at DATETIME,
  CONSTRAINT fk_s_tutor
    FOREIGN KEY (tutor_id) REFERENCES tutores(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_s_cliente
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_s_materia
    FOREIGN KEY (materia_id) REFERENCES materias(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_sesion_tutor_fecha (tutor_id, fecha_hora),
  INDEX idx_sesion_cliente_fecha (cliente_id, fecha_hora)
) ENGINE=InnoDB;

---

CREATE TABLE transacciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesion_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  estado_pago ENUM('pagado','pendiente','fallido','reembolsado') DEFAULT 'pendiente',
  fecha_transaccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaccion_sesion
    FOREIGN KEY (sesion_id) REFERENCES sesiones(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

---

CREATE USER IF NOT EXISTS 'tutornow'@'localhost' IDENTIFIED BY 'tu_clave';
GRANT ALL PRIVILEGES ON dbtutornow.* TO 'tutornow'@'localhost';
FLUSH PRIVILEGES;