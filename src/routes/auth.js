const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', (req, res) => {
    const { email, password, rol, nombreCompleto } = req.body; 

    if (!email || !password || !nombreCompleto) {
        return res.status(400).json({ message: 'Email, contraseña y nombre completo son obligatorios' });
    }

    const finalRol = rol || 'cliente';

    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear contraseña:', err);
            return res.status(500).json({ message: 'Error interno' });
        }

        req.getConnection((err, conn) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error de conexión a la BD' });
            }

            const nuevoUsuario = {
                username: email,
                password: hashedPassword,
                rol: finalRol,
                status: 'active'
            };

            
            conn.beginTransaction(transactionErr => {
                if (transactionErr) {
                    return res.status(500).json({ message: 'Error al iniciar transacción' });
                }

              
                conn.query('INSERT INTO usuarios SET ?', nuevoUsuario, (err, userResult) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return conn.rollback(() => res.status(409).json({ message: 'Ese correo ya está registrado' }));
                        }
                        return conn.rollback(() => res.status(500).json({ message: 'Error al crear usuario' }));
                    }

                    const usuarioId = userResult.insertId;

                    
                    if (finalRol === 'cliente') {
                        const nuevoCliente = {
                            usuario_id: usuarioId,
                            nombre_completo: nombreCompleto,
                            email: email,
                        };
                        conn.query('INSERT INTO clientes SET ?', nuevoCliente, (err, clientResult) => {
                            if (err) {
                                return conn.rollback(() => res.status(500).json({ message: 'Error al crear perfil de cliente' }));
                            }
                            conn.commit(commitErr => {
                                if (commitErr) {
                                    return conn.rollback(() => res.status(500).json({ message: 'Error al confirmar registro' }));
                                }
                                return res.status(201).json({
                                    message: 'Cuenta de cliente creada correctamente',
                                    id: usuarioId,
                                    clienteId: clientResult.insertId
                                });
                            });
                        });
                    } else if (finalRol === 'tutor') {
                        const nuevoTutor = {
                            usuario_id: usuarioId,
                            nombre_completo: nombreCompleto,
                            email: email,
                            descripcion: 'Tutor recién registrado',
                        };
                        conn.query('INSERT INTO tutores SET ?', nuevoTutor, (err, tutorResult) => {
                            if (err) {
                                return conn.rollback(() => res.status(500).json({ message: 'Error al crear perfil de tutor' }));
                            }
                            conn.commit(commitErr => {
                                if (commitErr) {
                                    return conn.rollback(() => res.status(500).json({ message: 'Error al confirmar registro' }));
                                }
                                return res.status(201).json({
                                    message: 'Cuenta de tutor creada correctamente',
                                    id: usuarioId,
                                    tutorId: tutorResult.insertId
                                });
                            });
                        });
                    } else {
                        conn.commit(commitErr => {
                            if (commitErr) {
                                return conn.rollback(() => res.status(500).json({ message: 'Error al confirmar registro' }));
                            }
                            return res.status(201).json({
                                message: 'Cuenta de administrador creada correctamente',
                                id: usuarioId
                            });
                        });
                    }
                });
            });
        });
    });
});


router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Faltan datos' });
    }

    req.getConnection((err, conn) => {
        if (err) {
            return res.status(500).json({ message: 'Error de conexión a la BD' });
        }

        conn.query('SELECT * FROM usuarios WHERE username = ?', [email], (err, rows) => {
            if (err) {
                return res.status(500).json({ message: 'Error al consultar usuario' });
            }

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
            }

            const user = rows[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ message: 'Error en la validación' });
                }

                if (!isMatch) {
                    return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
                }

                
                return res.json({
                    message: 'Login correcto',
                    username: user.username,
                    rol: user.rol
                });
            });
        });
    });
});

module.exports = router;