import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import mysql from 'mysql2';
import path from 'path';
import { authorize } from './controllers/middleware.js';
import nodemailer from 'nodemailer'; 
import crypto from 'crypto'; 
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());


// Conexión a la base de datos
/*
const conexion = mysql.createPool({
    host: 'localhost',
    database: 'hojaprefectos',
    user: 'root',
    password: 'jomita32'
    //password: 'n0m3l0'
    
});
*/
import dotenv from 'dotenv';

dotenv.config();

const conexion = mysql.createPool(process.env.MYSQL_URL);

conexion.getConnection(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conectado a MySQL en Railway');
  }
});


// Convertir la función de consulta a una que devuelva promesas
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params, (err, rows) => {
            if (err)
                return reject(err);
            resolve(rows);
        });
    });
};

// Middlewares
app.set("port", 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('Ruta solicitada:', req.path); // Verifica qué ruta se está solicitando
    next();
});
// Middleware de autorización
const protectedRoutesAdmin = [
    '/pages/ADM_menu.html',
    '/pages/ADM_1ER_PISO.html',
    '/pages/ADM_2DO_PISO.html',
    '/pages/ADM_3ER_PISO.html',
    '/pages/ADM_Consulta.html',
    '/pages/ADM_Reportes.html',
    '/pages/ADM_Editar_Usuarios.html',
    '/pages/ADM_AgregarHorario.html',
    '/pages/ADM_EditarHorario.html',
    '/pages/registrar.html'
];

const protectedRoutesPrefecto = [
    '/pages/PRF_menu.html',
    '/pages/PRF_1ER_PISO.html',
    '/pages/PRF_2DO_PISO.html',
    '/pages/PRF_3ER_PISO.html',
    '/pages/PRF_Reportes.html'
];

// Aplicar el middleware de autorización a las rutas protegidas
app.use(protectedRoutesAdmin, authorize(['admin']));
app.use(protectedRoutesPrefecto, authorize(['prefecto']));



// -------------------------------- RUTAS -----------------------------

// Rutas ADMIN
app.get('/pages/ADM_menu.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_menu.html'));
});

app.get('/pages/ADM_1ER_PISO.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_1ER_PISO.html'));
});

app.get('/pages/ADM_2DO_PISO.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_2DO_PISO.html'));
});

app.get('/pages/ADM_3ER_PISO.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_3ER_PISO.html'));
});

app.get('/pages/ADM_Consulta.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_Consulta.html'));
});

app.get('/pages/ADM_Reportes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_Reportes.html'));
});

app.get('/pages/ADM_Editar_Usuarios.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_Editar_Usuarios.html'));
});

app.get('/pages/ADM_AgregarHorario.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_AgregarHorario.html'));
});

app.get('/pages/ADM_EditarHorario.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_EditarHorario.html'));
});

app.get('/pages/registrar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'registrar.html'));
});

// Rutas PREFECTO
app.get('/pages/PRF_menu.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_menu.html'));
});

app.get('/pages/PRF_1ER_PISO.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_1ER_PISO.html'));
});

app.get('/pages/PRF_2DO_PISO.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_2DO_PISO.html'));
});

app.get('/pages/PRF_3ER_PISO.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_3ER_PISO.html'));
});

app.get('/pages/PRF_Reportes.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_Reportes.html'));
});

// Ruta de prueba para sesión
app.get('/session-test', (req, res) => {
    res.json(req.session);
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send('Algo salió mal.');
});

// -------------------------------- FIN RUTAS --------------------------


// --------------------------------  INICIO  -------------------------
// Rutas públicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'inicio.html'));
});
app.get('/pages/login.HTML', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});
app.get('/pages/perfil.HTML', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'perfil.html'));
});
// --------------------------------  FIN INICIO  -------------------------



// --------------------------------  LOGIN  -------------------------
app.post('/login', async (req, res) => {
    const { userName, userPassword } = req.body;
    console.log('Datos recibidos:', req.body);

    if (!userName || !userPassword) {
        return res.json({ success: false, message: 'Nombre de usuario o contraseña no proporcionados.' });
    }

    try {
        const results = await query('SELECT * FROM usuario WHERE nom_usuario = ? AND contraseña = ?', [userName, userPassword]);
        const user = results[0];

        if (!user) {
            return res.json({ success: false, message: 'Las credenciales que usas no son válidas.' });
        }

        req.session.loggedin = true;
        req.session.id_usuario = user.ID_usuario;  // Guardar el id_usuario en la sesión
        req.session.nombre = userName;
        req.session.nombre = user.nom_usuario; // Guardar el cargo en la sesión
        req.session.cargo = user.cargo; // Guardar el cargo en la sesión

        console.log('Sesión guardada en /login:', req.session);

        if (user.cargo.trim() === 'admin') {
            res.json({ success: true, redirectUrl: '/pages/ADM_menu.html' });
        } else if (user.cargo.trim() === 'prefecto') {
            res.json({ success: true, redirectUrl: '/pages/PRF_menu.html' });
        } else {
            return res.json({ success: false, message: 'No tienes un cargo asignado.' });
        }
    } catch (err) {
        console.error('Error fetching user:', err);
        return res.json({ success: false, message: 'Error al iniciar sesión.' });
    }
});
// --------------------------------  FIN LOGIN  -------------------------

app.get('/obtenerUsuario', (req, res) => {
    console.log('Sesión actual en /obtenerUsuario:', req.session); 

    if (!req.session.loggedin || !req.session.id_usuario || !req.session.nombre) {
        return res.status(401).json({ success: false, message: 'No estás autenticado o faltan datos en la sesión.' });
    }

    res.json({
        success: true,
        id_usuario: req.session.id_usuario,
        nom_usuario: req.session.nombre
    });
});

// --------------------------------  REGISTRAR  --------------------------------
const tokenStore = new Map();

// 📩 Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS
    }
});

// --------------------------------  RUTA DE REGISTRO  --------------------------------

app.post('/register', async (req, res) => {
    console.log('Datos recibidos en el servidor:', req.body);

    const { userName, userEmail, userCargo, userPassword, confirmar_contrasena } = req.body;

    if (!userName || !userEmail || !userCargo || !userPassword || !confirmar_contrasena) {
        return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
    }

    if (userPassword !== confirmar_contrasena) {
        return res.json({ success: false, message: 'Las contraseñas no coinciden.' });
    }

    try {
        // Verificar si el usuario ya existe
        const existingUser = await query("SELECT * FROM usuario WHERE correo = ?", [userEmail]);
        if (existingUser.length > 0) {
            return res.json({ success: false, message: 'El correo ya está registrado.' });
        }

        // 🔑 Generar un token de confirmación
        const confirmationToken = crypto.randomBytes(32).toString("hex");
        tokenStore.set(confirmationToken, { userName, userEmail, userCargo, userPassword });

        // 📩 Enviar correo de confirmación
        const confirmationLink = `http://localhost:3000/confirm/${confirmationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Confirma tu registro",
            text: `Hola ${userName}, por favor confirma tu cuenta haciendo clic en el siguiente enlace: ${confirmationLink}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Registro iniciado. Revisa tu email para confirmar la cuenta." });

    } catch (err) {
        console.error("Error en el registro:", err);
        res.json({ success: false, message: "Error al crear la cuenta." });
    }
});

// --------------------------------  RUTA DE CONFIRMACIÓN  --------------------------------

app.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;

    const userData = tokenStore.get(token);

    if (!userData) {
        return res.status(400).send("Token inválido o expirado.");
    }

    try {
        // ✅ Insertar usuario en la base de datos una vez confirmado
        const queryInsert = "INSERT INTO usuario (nom_usuario, correo, cargo, contraseña) VALUES (?, ?, ?, ?)";
        await query(queryInsert, [userData.userName, userData.userEmail, userData.userCargo, userData.userPassword]);

        // 🔄 Eliminar el token del almacenamiento temporal
        tokenStore.delete(token);

        res.send("Registro confirmado exitosamente. Ahora puedes iniciar sesión.");
    } catch (err) {
        console.error("Error al confirmar usuario:", err);
        res.status(500).send("Error al procesar la confirmación.");
    }
});

// --------------------------------  FIN REGISTRAR  -------------------------

// -------------------------------- CERRAR SESION  --------------------------------
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    });
});
// --------------------------------  FIN CERRAR SEISON  -------------------------


// -------------------------------  RUTA DE HORARIOS  --------------------------------
app.get('/api/horarios', async (req, res) => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const diaActual = diasSemana[new Date().getDay()]; // Obtener el día actual
    console.log('Día actual:', diaActual);

    const queryText = `
        SELECT DISTINCT
            h.id_horario,
            h.dia_horario,
            h.hora_inicio,
            h.hora_final,
            m.nom_materia,
            CONCAT(p.nom_persona, ' ', p.appat_persona) AS nombre_persona,
            g.sem_grupo,
            g.nom_grupo,
            s.id_salon,
            CASE WHEN a.id_asistencia IS NOT NULL THEN '✔' ELSE '' END AS asistencia,
            CASE WHEN r.id_retardo IS NOT NULL THEN '✔' ELSE '' END AS retardo,
            CASE WHEN f.id_falta IS NOT NULL THEN '✔' ELSE '' END AS falta
        FROM
            horario h
        INNER JOIN grupo g ON h.id_grupo = g.id_grupo
        INNER JOIN salon s ON h.id_salon = s.id_salon
        JOIN materia m ON h.id_materia = m.id_materia
        JOIN persona p ON h.id_persona = p.id_persona
        LEFT JOIN asistencia a ON h.id_horario = a.id_horario
        LEFT JOIN retardo r ON h.id_horario = r.id_horario
        LEFT JOIN falta f ON h.id_horario = f.id_horario
        WHERE h.dia_horario = ?;  
    `;

    try {
        const results = await query(queryText, [diaActual]);
        res.json(results);
    } catch (err) {
        console.error('Error fetching horarios:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --------------------------------  FIN RUTA HORARIOS  -------------------------


// // -------------------------------  RUTA DE HORARIOS POR ID -------------------------------  
app.get('/api/horarios/:id', async (req, res) => {
    const id = req.params.id;
    const queryText = `
        SELECT DISTINCT
            h.id_horario,
            h.dia_horario,
            h.hora_inicio,
            h.hora_final,
            m.nom_materia,
            CONCAT(p.nom_persona, ' ', p.appat_persona) AS nombre_persona,
            g.sem_grupo,
            g.nom_grupo,
            s.id_salon,
            
        FROM
            horario h
        INNER JOIN grupo g ON h.id_grupo = g.id_grupo
        INNER JOIN salon s ON h.id_salon = s.id_salon
        JOIN materia m ON h.id_materia = m.id_materia
        JOIN persona p ON h.id_persona = p.id_persona
        LEFT JOIN asistencia a ON h.id_horario = a.id_horario
        LEFT JOIN retardo r ON h.id_horario = r.id_horario
        LEFT JOIN falta f ON h.id_horario = f.id_horario
        WHERE h.id_horario = ?
    `;

    try {
        const results = await query(queryText, [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Horario not found' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error fetching horario:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --------------------------------  FIN RUTA HORARIOS POR ID  -------------------------


// ------------------------------- RUTA DE ASISTENCIA, RETARDO Y FALTA  --------------------------------
app.post('/actualizarDatos', async function (req, res) {
    console.log('Datos recibidos en el servidor:', req.body);

    const { validacion_asistencia, validacion_retardo, validacion_falta, id_horario } = req.body;

    console.log('El id del horario del checkbox es:', id_horario);

    try {
        // Insertar datos en la tabla asistencia
        await insertarAsistencia(validacion_asistencia, id_horario);

        // Insertar datos en la tabla retardo
        await insertarRetardo(validacion_retardo, id_horario);

        // Insertar datos en la tabla falta
        await insertarFalta(validacion_falta, id_horario);

        res.send("Datos actualizados correctamente");
    } catch (error) {
        console.error('Error al actualizar los datos:', error);
        res.status(500).send('Error al actualizar los datos');
    }
});


async function insertarAsistencia(validacion_asistencia, id_horario) {
    return new Promise((resolve, reject) => {
        conexion.query('INSERT INTO asistencia (validacion_asistencia, fecha_asistencia, id_horario) VALUES (?, NOW(), ?)',
            [validacion_asistencia, id_horario],
            (error, results) => {
                if (error) {
                    console.error('Error insertando asistencia:', error);
                    reject(error);
                } else {
                    console.log('Asistencia insertada correctamente');
                    resolve();
                }
            });
    });
}

async function insertarRetardo(validacion_retardo, id_horario) {
    return new Promise((resolve, reject) => {
        conexion.query('INSERT INTO retardo (validacion_retardo, fecha_retardo, id_horario) VALUES (?, NOW(), ?)',
            [validacion_retardo, id_horario],
            (error, results) => {
                if (error) {
                    console.error('Error insertando retardo:', error);
                    reject(error);
                } else {
                    console.log('Retardo insertado correctamente');
                    resolve();
                }
            });
    });
}

async function insertarFalta(validacion_falta, id_horario) {
    return new Promise((resolve, reject) => {
        conexion.query('INSERT INTO falta (validacion_falta, fecha_falta, id_horario) VALUES (?, NOW(), ?)',
            [validacion_falta, id_horario],
            (error, results) => {
                if (error) {
                    console.error('Error insertando falta:', error);
                    reject(error);
                } else {
                    console.log('Falta insertada correctamente');
                    resolve();
                }
            });
    });
}
// --------------------------------  FIN RUTA ASISTENCIA, RETARDO Y FALTA  -------------------------

// ------------------------------- RUTA DE ACTUALIZACIÓN ADMINISTRADOR --------------------------------
app.post('/actualizarDatosAdmin', async function (req, res) {
    console.log('Datos recibidos en el servidor para admin:', req.body);

    const { validacion_asistencia, validacion_retardo, validacion_falta, id_horario } = req.body;

    console.log('El id del horario del checkbox es:', id_horario);

    try {
        // Actualizar datos en la tabla asistencia
        await actualizarAsistencia(validacion_asistencia, id_horario);

        // Actualizar datos en la tabla retardo
        await actualizarRetardo(validacion_retardo, id_horario);

        // Actualizar datos en la tabla falta
        await actualizarFalta(validacion_falta, id_horario);

        res.send("Datos actualizados correctamente");
    } catch (error) {
        console.error('Error al actualizar los datos:', error);
        res.status(500).send('Error al actualizar los datos');
    }
});

async function actualizarAsistencia(validacion_asistencia, id_horario) {
    return new Promise((resolve, reject) => {
        conexion.query('UPDATE asistencia SET validacion_asistencia = ?, fecha_asistencia = NOW() WHERE id_horario = ?',
            [validacion_asistencia, id_horario],
            (error, results) => {
                if (error) {
                    console.error('Error actualizando asistencia:', error);
                    reject(error);
                } else {
                    console.log('Asistencia actualizada correctamente');
                    resolve();
                }
            });
    });
}

async function actualizarRetardo(validacion_retardo, id_horario) {
    return new Promise((resolve, reject) => {
        conexion.query('UPDATE retardo SET validacion_retardo = ?, fecha_retardo = NOW() WHERE id_horario = ?',
            [validacion_retardo, id_horario],
            (error, results) => {
                if (error) {
                    console.error('Error actualizando retardo:', error);
                    reject(error);
                } else {
                    console.log('Retardo actualizado correctamente');
                    resolve();
                }
            });
    });
}

async function actualizarFalta(validacion_falta, id_horario) {
    return new Promise((resolve, reject) => {
        conexion.query('UPDATE falta SET validacion_falta = ?, fecha_falta = NOW() WHERE id_horario = ?',
            [validacion_falta, id_horario],
            (error, results) => {
                if (error) {
                    console.error('Error actualizando falta:', error);
                    reject(error);
                } else {
                    console.log('Falta actualizada correctamente');
                    resolve();
                }
            });
    });
}
// --------------------------------  FIN RUTA ACTUALIZACIÓN ADMINISTRADOR  -------------------------

// ------------------------------- RUTA DE MOSTRAR USUARIOS  --------------------------------

app.get('/api/editarsur', async (req, res) => {
    const query = `SELECT * FROM usuario`;

    try {
        const [results] = await conexion.promise().query(query);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuarios not found' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching usuarios:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ------------------------------- FIN RUTA DE MOSTRAR USUARIOS  --------------------------------

// ------------------------------- RUTA DE MOSTRAR USUARIOS POR ID  --------------------------------

app.get('/api/editarsur:id', async (req, res) => {
    const id = req.params.id;
    const query = `SELECT * FROM usuario`;

    try {
        const [results] = await conexion.promise().query(query, [id]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuarios not found' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching usuarios:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ------------------------------- FIN RUTA DE MOSTRAR USUARIOS POR ID  --------------------------------

// ------------------------------- RUTA DE BORRAR USUARIOS POR ID  --------------------------------
app.delete('/api/editarsur/:id', async (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM usuario WHERE ID_usuario = ?`;

    try {
        const [results] = await conexion.promise().query(query, [id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.sendStatus(200); // Envía una respuesta exitosa
    } catch (err) {
        console.error('Error al borrar usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});
// ------------------------------- FIN RUTA DE BORRAR USUARIOS POR ID  --------------------------------


// ------------------------------- RUTA DE EDITAR USUARIO ----------------------------------------------

app.put('/api/editarsur/:id', async (req, res) => {
    const id = req.params.id;
    const { userName, userEmail, userCargo, userPassword, confirmar_contrasena } = req.body;

    console.log('Datos recibidos en el servidor:', { userName, userEmail, userCargo, userPassword, confirmar_contrasena });

    if (!userName || !userCargo || !userPassword || !confirmar_contrasena) {
        return res.status(400).json({ error: 'Faltan datos del usuario' });
    }

    if (userPassword !== confirmar_contrasena) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    const query = `UPDATE usuario SET nom_usuario = ?, cargo = ?, contraseña = ? WHERE ID_usuario = ?`;

    try {
        const [results] = await conexion.promise().query(query, [userName, userCargo, userPassword, id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// ------------------------------- FIN RUTA DE EDITAR USUARIO --------------------------------


// ------------------------------- RUTA DE CONSULTAR TODOS LOS REGISTROS --------------------------------

app.get('/api/consulta', async (req, res) => {
    const query = `
    SELECT DISTINCT
        p.id_persona,
        CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS persona,
        g.nom_grupo AS grupo,
        m.nom_materia AS materia,
        h.dia_horario,
        h.hora_inicio,
        h.hora_final,
	a.fecha_asistencia as fecha_asistencia,
        a.validacion_asistencia AS asistencia,
        r.validacion_retardo AS retardo,
        f.validacion_falta AS falta
    FROM
        persona AS p
        JOIN horario AS h ON p.id_persona = h.id_persona
        JOIN grupo AS g ON h.id_grupo = g.id_grupo
        JOIN materia AS m ON h.id_materia = m.id_materia
        JOIN asistencia AS a ON h.id_horario = a.id_horario
        LEFT JOIN
    retardo r ON h.id_horario = r.id_horario
LEFT JOIN
    falta f ON h.id_horario = f.id_horario
    ORDER BY
        persona,
        dia_horario,
        hora_inicio;`;

    try {
        const [results] = await conexion.promise().query(query);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No records found' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ------------------------------- FIN RUTA DE CONSULTAR TODOS LOS REGISTROS --------------------------------


// ------------------------------- RUTA DE CONSULTAR REGISTROS POR ID --------------------------------

app.get('/api/consulta/:id', async (req, res) => {
    const id_persona = req.params.id;
    const query = `
    SELECT
        p.id_persona,
        CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS persona,
        g.nom_grupo AS grupo,
        m.nom_materia AS materia,
        h.dia_horario,
        h.hora_inicio,
        h.hora_final,
	a.fecha_asistencia as fecha_asistencia,
        a.validacion_asistencia AS asistencia,
        r.validacion_retardo AS retardo,
        f.validacion_falta AS falta
    FROM
        persona AS p
        JOIN horario AS h ON p.id_persona = h.id_persona
        JOIN grupo AS g ON h.id_grupo = g.id_grupo
        JOIN materia AS m ON h.id_materia = m.id_materia
        JOIN asistencia AS a ON h.id_horario = a.id_horario
        LEFT JOIN
    retardo r ON h.id_horario = r.id_horario
LEFT JOIN
    falta f ON h.id_horario = f.id_horario
    ORDER BY
        persona,
        dia_horario,
        hora_inicio;`;

    try {
        const [results] = await conexion.promise().query(query, [id_persona]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No records found for this person' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching records by ID:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ------------------------------- FIN RUTA DE CONSULTAR REGISTROS POR ID --------------------------------

// ------------------------------- RUTA DE REPORTES --------------------------------

app.post('/agregarReporte', (req, res) => {
    // Obtener los datos del cuerpo de la solicitud
    const { id_tiporeporte, descripcion } = req.body;
    const id_usuario = req.session.id_usuario;  // ✅ Obtener el id_usuario desde la sesión
    const nom_usuario = req.session.nombre;  // ✅ Obtener el nombre del usuario desde la sesión

    console.log('Datos recibidos en /agregarReporte:', { id_tiporeporte, descripcion, id_usuario, nom_usuario });

    if (!id_tiporeporte || !descripcion || !id_usuario || !nom_usuario) {
        console.error(' ERROR: Datos incompletos:', { id_tiporeporte, descripcion, id_usuario, nom_usuario });
        return res.status(400).json({ success: false, message: 'Faltan datos para registrar el reporte.' });
    }

    // Insertar el reporte en la base de datos
    const query = `
        INSERT INTO reportes (id_tiporeporte, descripcion, id_usuario)
        VALUES (?, ?, ?)
    `;

    conexion.execute(query, [id_tiporeporte, descripcion, id_usuario], (err, result) => {
        if (err) {
            console.error(' ERROR en la consulta SQL:', err);
            return res.status(500).json({ success: false, message: 'Hubo un error al agregar el reporte.' });
        }

        return res.status(200).json({ success: true, message: 'Reporte agregado exitosamente.', reporteId: result.insertId });
    });
});

// Ruta para obtener todos los reportes
// Ruta para obtener todos los reportes con el nombre del usuario
app.get('/obtenerReportes', (req, res) => {
    const query = `
        SELECT 
            r.id_reporte, 
            r.descripcion, 
            r.id_tiporeporte, 
            u.nom_usuario, 
            t.tipo AS tipo_reporte
        FROM reportes r
        JOIN tiporeportes t ON r.id_tiporeporte = t.id_tiporeporte
        JOIN usuario u ON r.id_usuario = u.id_usuario
    `;

    conexion.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener reportes' });
        }
        res.json(results);
    });
});


// Ruta para actualizar un reporte
app.put('/actualizarReporte', (req, res) => {
    const { id_reporte, id_tiporeporte, descripcion } = req.body;

    const query = `
        UPDATE reportes SET id_tiporeporte = ?, descripcion = ?
        WHERE id_reporte = ?
    `;

    conexion.query(query, [id_tiporeporte, descripcion, id_reporte], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar el reporte' });
        }
        res.json({ message: 'Reporte actualizado correctamente' });
    });
});


// ------------------------------- FIN RUTA REPORTES --------------------------------

// ------------------------------- RUTA DE AGREGAR HORARIO --------------------------------

app.get('/obtener-datos-horarios', async (req, res) => {
    try {
        const [grupos] = await conexion.promise().query(`
           SELECT DISTINCT g.id_grupo, g.nom_grupo 
            FROM horario h 
            JOIN grupo g ON h.id_grupo = g.id_grupo;
        `);

        const [dias] = await conexion.promise().query(`
            SELECT DISTINCT dia_horario as dia FROM horario
        `);

        const [hora_inicio] = await conexion.promise().query(`
            SELECT DISTINCT hora_inicio FROM horario
        `);

        const [hora_final] = await conexion.promise().query(`
            SELECT DISTINCT hora_final FROM horario
        `);

        const [salones] = await conexion.promise().query(`
            SELECT DISTINCT s.id_salon
            FROM horario h 
            JOIN salon s ON h.id_salon = s.id_salon
        `);

        const [materias] = await conexion.promise().query(`
           SELECT DISTINCT m.id_materia, m.nom_materia 
            FROM horario h 
            JOIN materia m ON h.id_materia = m.id_materia;
        `);

        const [profesores] = await conexion.promise().query(`
            SELECT DISTINCT p.id_persona, 
                CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS nombre_completo
            FROM horario h 
            JOIN persona p ON h.id_persona = p.id_persona
        `);

        res.json({
            grupos,
            dias,
            hora_inicio,
            hora_final,
            salones,
            materias,
            profesores
        });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------- FIN RUTA DE AGREGAR HORARIO  --------------------------------


app.get('/obtener-periodo/:anio/:periodo', async (req, res) => {
    const { anio, periodo } = req.params;
    
    try {
        const [resultado] = await conexion.promise().query(
            'SELECT id_periodo FROM periodos WHERE anio = ? AND periodo = ?',
            [anio, periodo]
        );

        if (resultado.length === 0) {
            return res.status(404).json({ error: 'Periodo no encontrado' });
        }

        const idPeriodo = resultado[0].id_periodo;

        // Obtener el id_contenedor correspondiente al id_periodo
        const [contenedor] = await conexion.promise().query(
            'SELECT id_contenedor FROM contenedor WHERE id_periodo = ?',
            [idPeriodo]
        );

        if (contenedor.length === 0) {
            return res.status(404).json({ error: 'Contenedor no encontrado' });
        }

        res.json({ idPeriodo, idContenedor: contenedor[0].id_contenedor });
    } catch (error) {
        console.error('Error al obtener periodo y contenedor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para insertar un nuevo horario
app.post('/agregar-horario', async (req, res) => {
    const { dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona } = req.body;

    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
    const periodo = mes >= 1 && mes <= 6 ? 1 : 2; // 1er semestre (Ene-Jun), 2do semestre (Jul-Dic)

    try {
        // 1️⃣ Verificar si ya existe el periodo actual
        let [resultado] = await conexion.promise().query(
            'SELECT id_periodo FROM periodos WHERE anio = ? AND periodo = ?',
            [anio, periodo]
        );

        let idPeriodo;
        if (resultado.length === 0) {
            // Si no existe, lo creamos
            const [insertPeriodo] = await conexion.promise().query(
                'INSERT INTO periodos (anio, periodo) VALUES (?, ?)',
                [anio, periodo]
            );
            idPeriodo = insertPeriodo.insertId;
        } else {
            idPeriodo = resultado[0].id_periodo;
        }

        // 2️⃣ Verificar si ya existe un contenedor para este periodo
        const [contenedorExistente] = await conexion.promise().query(
            'SELECT id_contenedor FROM contenedor WHERE id_periodo = ?',
            [idPeriodo]
        );

        let idContenedor;
        if (contenedorExistente.length === 0) {
            // Si no existe, lo creamos
            const [insertContenedor] = await conexion.promise().query(
                'INSERT INTO contenedor (id_periodo) VALUES (?)',
                [idPeriodo]
            );
            idContenedor = insertContenedor.insertId;
        } else {
            // Si ya existe, usamos el id_contenedor existente
            idContenedor = contenedorExistente[0].id_contenedor;
        }

        // 3️⃣ Verificar si ya existe un horario con los mismos datos
        for (let i = 0; i < hora_inicio.length; i++) {
            if (!hora_inicio[i] || !hora_final[i] || !id_salon[i] || !id_persona[i]) {
                return res.status(400).json({ success: false, message: 'Todos los campos deben estar completos.' });
            }

            const [horarioExistente] = await conexion.promise().query(
                `SELECT * FROM horario 
                 WHERE hora_inicio = ? 
                 AND hora_final = ? 
                 AND id_salon = ? 
                 AND id_grupo = ? 
                 AND id_persona = ?`,
                [hora_inicio[i], hora_final[i], id_salon[i], id_grupo, id_persona[i]]
            );

            if (horarioExistente.length > 0) {
                return res.status(400).json({ success: false, message: 'Ya existe un horario con estos datos.' });
            }
        }

        // 4️⃣ Insertar los horarios con el nuevo id_contenedor
        let horarios = [];
        for (let i = 0; i < hora_inicio.length; i++) {
            // Asignamos el mismo valor para dia_horario y id_grupo en todas las filas
            horarios.push([
                dia_horario,         // Usamos el valor del primer select
                hora_inicio[i],
                hora_final[i],
                id_salon[i],
                id_grupo,            // Usamos el valor del primer select
                id_materia[i],
                id_persona[i],
                idContenedor
            ]);
        }

        // Insertar todos los horarios a la vez
        await conexion.promise().query(
            `INSERT INTO horario (dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona, id_contenedor)
            VALUES ?`,
            [horarios]
        );

        res.json({ success: true, message: 'Horarios agregados correctamente' });
    } catch (error) {
        console.error('Error al insertar horarios:', error);
        res.status(500).json({ error: 'Error al insertar horarios' });
    }
});




// ------------------------------- RUTA DE CADA PERFIL --------------------------------

app.get('/perfil/:userName', (req, res) => {
    const userName = req.params.userName;

    // Consulta a la base de datos para obtener los datos del usuario
    conexion.promise().query('SELECT userName, userEmail, userCargo FROM usuarios WHERE userName = ?', [userName], (error, results) => {
        if (error) {
            console.error('Error al obtener datos del usuario:', error);
            return res.status(500).json({ error: 'Error al obtener los datos del usuario' });
        }

        if (results.length > 0) {
            res.json(results[0]); // Enviar los datos del usuario como respuesta JSON
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    });
});

// ------------------------------- RUTA DE CADA PERFIL --------------------------------


app.listen(app.get("port"), () => {
    console.log(`PUERTO:`, app.get("port"));
    console.log(`Server en http://localhost:${app.get("port")}`);
});
