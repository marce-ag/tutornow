CREATE DATABASE IF NOT EXISTS dbtutornow
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_general_ci;

USE dbtutornow;


GRANT ALL PRIVILEGES ON dbtutornow.* TO 'tutornow'@'localhost';

CREATE TABLE subjects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL UNIQUE,
  description   VARCHAR(300),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE tutors (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  bio           TEXT,
  hourly_rate   DECIMAL(10,2) DEFAULT 0.00,
  rating        DECIMAL(3,2)  DEFAULT 0.00,   
  is_active     TINYINT(1)    DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tutor_email (email)
) ENGINE=InnoDB;


CREATE TABLE students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(60)  NOT NULL,
  last_name     VARCHAR(60)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_student_email (email)
) ENGINE=InnoDB;


CREATE TABLE tutor_subjects (
  tutor_id      INT NOT NULL,
  subject_id    INT NOT NULL,
  price_per_hour DECIMAL(10,2) DEFAULT NULL,
  PRIMARY KEY (tutor_id, subject_id),
  CONSTRAINT fk_ts_tutor   FOREIGN KEY (tutor_id)  REFERENCES tutors(id)   ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ts_subject FOREIGN KEY (subject_id)REFERENCES subjects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


CREATE TABLE sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tutor_id      INT NOT NULL,
  student_id    INT NOT NULL,
  subject_id    INT NOT NULL,
  start_time    DATETIME NOT NULL,
  end_time      DATETIME NOT NULL,
  status        ENUM('scheduled','completed','canceled') DEFAULT 'scheduled',
  notes         TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_s_tutor   FOREIGN KEY (tutor_id)   REFERENCES tutors(id)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_s_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_s_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_session_tutor   (tutor_id, start_time),
  INDEX idx_session_student (student_id, start_time),
  INDEX idx_session_subject (subject_id)
) ENGINE=InnoDB;


CREATE TABLE orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  student_id    INT NOT NULL,
  total_amount  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status        ENUM('pending','paid','canceled','refunded') DEFAULT 'pending',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_o_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_order_student (student_id, created_at)
) ENGINE=InnoDB;


CREATE TABLE order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  session_id    INT NOT NULL UNIQUE, 
  unit_price    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT fk_oi_order   FOREIGN KEY (order_id) REFERENCES orders(id)    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_oi_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_order_items_order (order_id)
) ENGINE=InnoDB;


CREATE TABLE payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  amount        DECIMAL(12,2) NOT NULL,
  method        ENUM('card','cash','transfer') DEFAULT 'card',
  status        ENUM('pending','paid','failed') DEFAULT 'pending',
  paid_at       DATETIME NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_payment_order (order_id, status)
) ENGINE=InnoDB;


CREATE TABLE reviews (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_id    INT NOT NULL,
  rating        TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_r_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_review_session (session_id, rating)
) ENGINE=InnoDB;


CREATE OR REPLACE VIEW vw_upcoming_sessions AS
SELECT 
  s.id,
  s.tutor_id,
  CONCAT(t.first_name,' ',t.last_name) AS tutor_name,
  s.student_id,
  CONCAT(st.first_name,' ',st.last_name) AS student_name,
  sub.name AS subject,
  s.start_time,
  s.end_time,
  s.status
FROM sessions s
JOIN tutors t   ON t.id = s.tutor_id
JOIN students st ON st.id = s.student_id
JOIN subjects sub ON sub.id = s.subject_id
WHERE s.status = 'scheduled' AND s.start_time >= NOW();

CREATE OR REPLACE VIEW vw_revenue_by_tutor AS
SELECT 
  t.id AS tutor_id,
  CONCAT(t.first_name,' ',t.last_name) AS tutor_name,
  SUM(oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN sessions s ON s.id = oi.session_id
JOIN tutors t ON t.id = s.tutor_id
JOIN payments p ON p.order_id = o.id AND p.status = 'paid'
GROUP BY t.id, tutor_name;

CREATE USER IF NOT EXISTS 'tutornow'@'localhost' IDENTIFIED BY 'tu_clave';
GRANT ALL PRIVILEGES ON dbtutornow.* TO 'tutornow'@'localhost';
FLUSH PRIVILEGES;

INSERT INTO subjects (name, description) VALUES
('Matemáticas', 'Álgebra, cálculo y estadística'),
('Inglés', 'Gramática y conversación'),
('Programación', 'Lógica, JS y estructuras de datos');

INSERT INTO tutors (first_name, last_name, email, hourly_rate, bio)
VALUES
('Ana', 'López', 'ana.tutor@tutornow.com', 200.00, 'Especialista en matemáticas.'),
('Carlos', 'Méndez', 'carlos.tutor@tutornow.com', 250.00, 'Inglés conversacional.');

INSERT INTO students (first_name, last_name, email)
VALUES
('Marce', 'Ayala', 'marce.estudiante@tutornow.com');

INSERT INTO tutor_subjects (tutor_id, subject_id, price_per_hour)
VALUES
(1, 1, 220.00),
(2, 2, 260.00);
