import bodyParser from 'body-parser';
import express from 'express';
import session from 'express-session';
import mysql from 'mysql2';
import path from 'path';
import { authorize } from './controllers/middleware.js';
import nodemailer from 'nodemailer'; 
import crypto from 'crypto'; 
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';


import bcrypt from 'bcrypt';

const saltRounds = 10;





const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(cookieParser());




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
    secret: 'jomitaaz',  // Cambia esto por un secreto seguro
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        expires: false
     } // Usa secure: true si usas HTTPS
}));

app.use(cors({ origin: '*' }));


app.use( express.static(path.join(__dirname, 'public')));


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

const protectedRoutesEmpresa = [
    '/pages/Empresa_menu.html',
    '/pages/empresa_editar.html',
    '/pages/empresa_editarescuela.html',
    '/pages/empresa_registrar.html',
    '/pages/empresa_registrarescuela.html'
]
// Aplicar el middleware de autorización a las rutas protegidas
app.use(protectedRoutesAdmin, authorize(['admin']));
app.use(protectedRoutesPrefecto, authorize(['prefecto']));
app.use(protectedRoutesEmpresa, authorize(['empresa']));

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
// RUTAS EMPRESA
app.get('/pages/Empresa_menu.html',(req, res)=>{
    res.sendFile(path.join(__dirname,'pages','Empresa_menu.html'));
});
app.get('/pages/empresa_registrar.html',(req, res)=>{
    res.sendFile(path.join(__dirname,'pages','empresa_registrar.html'));
});
app.get('/pages/empresa_registrarescuela.html',(req, res)=>{
    res.sendFile(path.join(__dirname,'pages','empresa_registrarescuela.html'));
});
app.get('/pages/empresa_editar.html',(req, res)=>{
    res.sendFile(path.join(__dirname,'pages','empresa_editar.html'));
});
app.get('/pages/empresa_editarescuela.html',(req, res)=>{
    res.sendFile(path.join(__dirname,'pages','empresa_editarescuela.html'));
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
app.get('/pages/confirmacion.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'confirmacion.html'));
}
);
app.get('/pages/login.HTML', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'login.html'));
});
app.get('/pages/perfil.HTML', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'perfil.html'));
});
// --------------------------------  FIN INICIO  -------------------------


// token recordar sesion esta mal
// --------------------------------  LOGIN  -------------------------
app.post('/login', async (req, res) => {
    console.log("Cuerpo recibido en /login:", req.body); 
    const { userName, userPassword, rememberMe } = req.body;

    if (!userName || !userPassword) {
        return res.json({ success: false, message: 'Nombre de usuario o contraseña no proporcionados.' });
    }

    try {
        // Consultar usuario en la base de datos
        const results = await query('SELECT * FROM usuario WHERE nom_usuario = ?', [userName]);
        const user = results[0];

        if (!user) {
            console.log("Usuario no encontrado en la base de datos.");
            return res.json({ success: false, message: 'Las credenciales que usas no son válidas.' });
        }

        let passwordMatch = false;

        // Determinar si la contraseña ya está encriptada
        if (user.contraseña.startsWith('$2')) {
            // Contraseña ya hasheada
            passwordMatch = await bcrypt.compare(userPassword, user.contraseña);
            console.log("Contraseña hasheada comparada:", passwordMatch);
        } else {
            // Contraseña sin hash
            passwordMatch = userPassword === user.contraseña;
            console.log("Contraseña en texto plano comparada:", passwordMatch);

            if (passwordMatch) {
               
                const hashed = await bcrypt.hash(userPassword, 10);
                await query('UPDATE usuario SET contraseña = ? WHERE ID_usuario = ?', [hashed, user.ID_usuario]);
                console.log(`Contraseña de ${userName} fue hasheada y actualizada en la base de datos.`);
            }
        }

        if (!passwordMatch) {
            console.log("Las credenciales que usas no son válidas.");
            return res.json({ success: false, message: 'Las credenciales que usas no son válidas.' });
        }

        if (!user.cargo) {
            console.log("El usuario no tiene un cargo asignado.");
            return res.json({ success: false, message: 'El usuario no tiene un cargo asignado.' });
        }

        // Generar código OTP de 6 dígitos
        const otpCode = Math.floor(100000 + Math.random() * 900000);
        req.session.otp = otpCode;
        console.log("Código OTP generado en la sesión:", req.session.otp);
        req.session.userId = user.ID_usuario;
        req.session.userName = user.nom_usuario;
        req.session.cargo = user.cargo.trim();
        req.session.id_escuela = user.id_escuela;

        if (rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
            console.log("Sesión configurada para 30 días.");
        } else {
            req.session.cookie.expires = false; // Hasta que cierre el navegador
            console.log("Sesión configurada para durar solo mientras el navegador esté abierto.");
        }

        console.log(`OTP generado para ${userName}:`, otpCode);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.correo,
            subject: "Código de verificación",
            text: `Tu código de verificación es: ${otpCode}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, requiresOTP: true, message: "Se ha enviado un código de verificación a tu correo." });
    } catch (err) {
        console.error('Error en login:', err);
        return res.json({ success: false, message: 'Error al iniciar sesión.' });
    }
});


// ----------------------------- VERIFY OTP -----------------------------
app.post('/verify-otp', async (req, res) => {
    console.log("Sesión en /verify-otp:", req.session);  // Para depuración

    const { otpCode } = req.body;

    console.log("OTP recibido en el servidor:", otpCode);
    console.log("OTP almacenado en la sesión:", req.session.otp);

    if (!req.session.otp || req.session.otp != otpCode) {
        return res.json({ success: false, message: "Código incorrecto." });
    }

    req.session.loggedin = true;
    delete req.session.otp;
    req.session.touch();

    console.log("Usuario autenticado correctamente:", req.session.userName, "Cargo:", req.session.cargo);

    let redirectUrl;
    if (req.session.cargo === 'admin') {
        redirectUrl = '/pages/ADM_menu.html';
    } else if (req.session.cargo === 'prefecto') {
        redirectUrl = '/pages/PRF_menu.html';
    } else if (req.session.cargo === 'empresa'){
        redirectUrl = '/pages/Empresa_menu.html';
    } else {
        return res.json({ success: false, message: "No tienes un cargo asignado." });
    }

    console.log("Redirigiendo a:", redirectUrl);
    return res.json({ success: true, redirectUrl });
});


app.get('/validar-sesion', (req, res) => {
    if (req.session.loggedin) {
        res.json({ success: true, userName: req.session.userName, cargo: req.session.cargo });
    } else {
        res.json({ success: false });
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


//--------------------------------- REGISTRAR ESCUELAS--------------------------
// Nueva ruta para registrar una escuela
app.post('/api/escuelas', async (req, res) => {
    const { nom_escuela, CCT, telefono_escuela } = req.body;
  
    if (!nom_escuela || !CCT || !telefono_escuela) {
      return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
    }
  
    try {
      await conexion.promise().query(
        `INSERT INTO escuela (nom_escuela, CCT, telefono_escuela) VALUES (?, ?, ?)`,
        [nom_escuela, CCT, telefono_escuela]
      );
      res.json({ success: true, message: 'Escuela registrada exitosamente.' });
    } catch (error) {
      console.error('Error registrando escuela:', error);
      res.status(500).json({ success: false, message: 'Error al registrar escuela.' });
    }
  });

//---------------------------------EDITSR ESCUELAS -----------------------------
// Traer escuela por ID (para cargar en el modal de edición)
// Obtener TODAS las escuelas
app.get('/api/escuelas', async (req, res) => {
    try {
      const [rows] = await conexion.promise().query('SELECT ID_escuela, nom_escuela, CCT, telefono_escuela FROM escuela');
      res.json(rows);
    } catch (error) {
      console.error('Error obteniendo escuelas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });
  
  // Obtener una escuela por su ID
  app.get('/api/escuelas/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await conexion.promise().query('SELECT ID_escuela, nom_escuela, CCT, telefono_escuela FROM escuela WHERE ID_escuela = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Escuela no encontrada' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Error obteniendo escuela por ID:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });
  
  // Actualizar una escuela
  app.put('/api/escuelas/:id', async (req, res) => {
    const { id } = req.params;
    const { nom_escuela, CCT, telefono_escuela } = req.body;
    try {
      await conexion.promise().query(
        'UPDATE escuela SET nom_escuela = ?, CCT = ?, telefono_escuela = ? WHERE ID_escuela = ?',
        [nom_escuela, CCT, telefono_escuela, id]
      );
      res.json({ success: true, message: 'Escuela actualizada exitosamente' });
    } catch (error) {
      console.error('Error actualizando escuela:', error);
      res.status(500).json({ success: false, message: 'Error actualizando escuela' });
    }
  });
  
  // Eliminar una escuela
  app.delete('/api/escuelas/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await conexion.promise().query('DELETE FROM escuela WHERE ID_escuela = ?', [id]);
      res.json({ success: true, message: 'Escuela eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminando escuela:', error);
      res.status(500).json({ success: false, message: 'Error eliminando escuela' });
    }
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
    console.log('📩 Datos recibidos en el servidor (registro):', req.body);

    let {
        userName,
        userEmail,
        userCargo,
        userPassword,
        confirmar_contrasena,
        idEscuela
    } = req.body;

    // Si quien registra es un admin, usar su escuela automáticamente
    if (req.session.cargo === 'admin') {
        idEscuela = req.session.id_escuela;
    }

    if (!userName || !userEmail || !userCargo || !userPassword || !confirmar_contrasena || !idEscuela) {
        console.warn('⚠️ Faltan campos en el registro:', { userName, userEmail, userCargo, userPassword, idEscuela });
        return res.json({ success: false, message: 'Todos los campos son obligatorios, incluyendo escuela.' });
    }

    if (userPassword !== confirmar_contrasena) {
        return res.json({ success: false, message: 'Las contraseñas no coinciden.' });
    }

    try {
        const existingUser = await query("SELECT * FROM usuario WHERE correo = ?", [userEmail]);
        if (existingUser.length > 0) {
            return res.json({ success: false, message: 'El correo ya está registrado.' });
        }

        const hashedPassword = await bcrypt.hash(userPassword, saltRounds);
        const confirmationToken = crypto.randomBytes(32).toString("hex");

        tokenStore.set(confirmationToken, {
            userName,
            userEmail,
            userCargo,
            userPassword: hashedPassword,
            idEscuela
        });

        const baseUrl = process.env.NODE_ENV === 'production'
            ? 'https://prefect-app-production.up.railway.app'
            : 'http://localhost:3000';

        const confirmationLink = `${baseUrl}/confirm/${confirmationToken}`;
        console.log("🔗 Link de confirmación generado:", confirmationLink);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Confirma tu registro",
            text: `Hola ${userName}, por favor confirma tu cuenta haciendo clic en el siguiente enlace:\n\n${confirmationLink}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Registro iniciado. Revisa tu email para confirmar la cuenta." });

    } catch (err) {
        console.error("❌ Error en el proceso de registro:", err);
        res.json({ success: false, message: "Error al crear la cuenta." });
    }
});


// --------------------------------  FIN CERRAR SEISON  -------------------------


// -------------------------------  RUTA DE HORARIOS  --------------------------------
app.get('/api/horarios', async (req, res) => {
    const diaActual = new Date().toLocaleDateString('es-MX', { weekday: 'long' });
    const diaCapitalizado = diaActual.charAt(0).toUpperCase() + diaActual.slice(1);
    const diaPrueba = 'Lunes'; // Puedes cambiar esto a `diaCapitalizado` si deseas usar el día real

    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
    const periodo = mes >= 1 && mes <= 6 ? 1 : 2;
    const idEscuela = req.session.id_escuela;

    try {
        // 1️⃣ Buscar el id_periodo actual
        const [periodoRows] = await conexion.promise().query(
            'SELECT id_periodo FROM periodos WHERE anio = ? AND periodo = ?',
            [anio, periodo]
        );

        if (periodoRows.length === 0) {
            return res.status(404).json({ error: 'No existe el periodo actual.' });
        }

        const idPeriodo = periodoRows[0].id_periodo;

        // 2️⃣ Buscar el contenedor correspondiente
        const [contenedorRows] = await conexion.promise().query(
            'SELECT id_contenedor FROM contenedor WHERE id_periodo = ?',
            [idPeriodo]
        );

        if (contenedorRows.length === 0) {
            return res.status(404).json({ error: 'No existe un contenedor para el periodo actual.' });
        }

        const idContenedor = contenedorRows[0].id_contenedor;

        // 3️⃣ Consulta filtrando por el contenedor actual
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
                g.id_turno,
                t.nom_turno,
                CASE WHEN a.id_asistencia IS NOT NULL THEN '✔' ELSE '' END AS asistencia,
                CASE WHEN r.id_retardo IS NOT NULL THEN '✔' ELSE '' END AS retardo,
                CASE WHEN f.id_falta IS NOT NULL THEN '✔' ELSE '' END AS falta
            FROM
                horario h
            INNER JOIN grupo g ON h.id_grupo = g.id_grupo
            INNER JOIN salon s ON h.id_salon = s.id_salon
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN persona p ON h.id_persona = p.id_persona
            join turno t on g.id_turno = t.id_turno
            LEFT JOIN asistencia a ON h.id_horario = a.id_horario
            LEFT JOIN retardo r ON h.id_horario = r.id_horario
            LEFT JOIN falta f ON h.id_horario = f.id_horario
            WHERE h.dia_horario = ? AND h.id_contenedor = ? AND h.id_escuela = ?;
`;


        const [results] = await conexion.promise().query(queryText, [diaPrueba, idContenedor, idEscuela]);

        res.json(results);
    } catch (err) {
        console.error('Error fetching horarios:', err);
        res.status(500).json({ error: 'Error interno al obtener horarios.' });
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
        WHERE h.id_horario = ?;
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

// Nueva ruta para EMPRESA ver solo administradores
app.get('/api/usuarios', async (req, res) => {
    try {
        const [rows] = await conexion.promise().query(`
            SELECT ID_usuario, nom_usuario, cargo, contraseña 
            FROM usuario 
            WHERE cargo = 'admin'
        `);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No hay administradores registrados.' });
        }

        // Opcionalmente podrías "limpiar" las contraseñas si están hasheadas
        const administradores = rows.map(usuario => {
            if (usuario.contraseña.startsWith('$2')) {
                usuario.contraseña = ''; // No mostrar si está hasheada
            }
            return usuario;
        });

        res.json(administradores);
    } catch (error) {
        console.error('Error obteniendo administradores:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
app.get('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await conexion.promise().query(`
            SELECT ID_usuario, nom_usuario, cargo, contraseña 
            FROM usuario 
            WHERE ID_usuario = ? AND cargo = 'admin'
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Administrador no encontrado.' });
        }

        // Si la contraseña está hasheada, la ocultamos
        const usuario = rows[0];
        if (usuario.contraseña.startsWith('$2')) {
            usuario.contraseña = '(No disponible)';
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error obteniendo administrador:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ruta para actualizar administrador
app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nom_usuario, contrasena } = req.body;

    try {
        // Si no envían contraseña nueva
        if (!contrasena || contrasena.trim() === '') {
            // Solo actualizar nombre de usuario
            await conexion.promise().query(`
                UPDATE usuario
                SET nom_usuario = ?
                WHERE ID_usuario = ? AND cargo = 'admin'
            `, [nom_usuario, id]);
        } else {
            // Si envían nueva contraseña, la encriptamos
            const hashedPassword = await bcrypt.hash(contrasena, 10);

            await conexion.promise().query(`
                UPDATE usuario
                SET nom_usuario = ?, contraseña = ?
                WHERE ID_usuario = ? AND cargo = 'admin'
            `, [nom_usuario, hashedPassword, id]);
        }

        res.json({ message: 'Administrador actualizado exitosamente.' });

    } catch (error) {
        console.error('Error actualizando administrador:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

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
    let idEscuela = req.session.id_escuela;
    const query = `
        SELECT DISTINCT
            p.id_persona,
            CONCAT(p.nom_persona, ' ', p.appat_persona) AS persona,
            g.nom_grupo AS grupo,
            m.nom_materia AS materia,
            h.dia_horario,
            h.hora_inicio,
            h.hora_final,
            DATE_FORMAT(a.fecha_asistencia, '%d/%m/%y') AS fecha_asistencia, 
            a.validacion_asistencia AS asistencia,
            r.validacion_retardo AS retardo,
            f.validacion_falta AS falta,
            per.anio,
            per.periodo
        FROM
            persona AS p
            JOIN horario AS h ON p.id_persona = h.id_persona
            JOIN contenedor AS c ON h.id_contenedor = c.id_contenedor
            JOIN periodos AS per ON c.id_periodo = per.id_periodo
            JOIN grupo AS g ON h.id_grupo = g.id_grupo
            JOIN materia AS m ON h.id_materia = m.id_materia
            JOIN asistencia AS a ON h.id_horario = a.id_horario
            LEFT JOIN retardo r ON h.id_horario = r.id_horario
            LEFT JOIN falta f ON h.id_horario = f.id_horario
        WHERE h.id_escuela = ?
        ORDER BY
            persona,
            dia_horario,
            hora_inicio;
    `;

    try {
        const [results] = await conexion.promise().query(query, [idEscuela]);
        
        // Respuesta estandarizada
        res.status(200).json({
            success: true,
            data: results,
            message: results.length > 0 ? 'Datos obtenidos' : 'No hay registros',
            count: results.length
        });
        
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Error en el servidor',
            error: err.message
        });
    }
});

// ------------------------------- FIN RUTA DE CONSULTAR TODOS LOS REGISTROS --------------------------------


// ------------------------------- RUTA DE CONSULTAR REGISTROS POR ID --------------------------------

app.get('/api/consulta/:id', async (req, res) => {
    const id_persona = req.params.id;
    const query = `
    SELECT DISTINCT
    p.id_persona,
    CONCAT(p.nom_persona, ' ', p.appat_persona) AS persona,
    g.nom_grupo AS grupo,
    m.nom_materia AS materia,
    h.dia_horario,
    h.hora_inicio,
    h.hora_final,
    DATE_FORMAT(a.fecha_asistencia, '%d/%m/%y') AS fecha_asistencia, 
    a.validacion_asistencia AS asistencia,
    r.validacion_retardo AS retardo,
    f.validacion_falta AS falta,
    per.anio,
    per.periodo
FROM
    persona AS p
    JOIN horario AS h ON p.id_persona = h.id_persona
    JOIN contenedor AS c ON h.id_contenedor = c.id_contenedor
    JOIN periodos AS per ON c.id_periodo = per.id_periodo
    JOIN grupo AS g ON h.id_grupo = g.id_grupo
    JOIN materia AS m ON h.id_materia = m.id_materia
    JOIN asistencia AS a ON h.id_horario = a.id_horario
    LEFT JOIN retardo r ON h.id_horario = r.id_horario
    LEFT JOIN falta f ON h.id_horario = f.id_horario
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
    const ID_usuario = req.session.userId;  
    const nom_usuario = req.session.userName; 
    let idEscuela = req.session.id_escuela;

    console.log('Datos recibidos en /agregarReporte:', { id_tiporeporte, descripcion, ID_usuario, nom_usuario, idEscuela });

    if (!id_tiporeporte || !descripcion || !ID_usuario || !nom_usuario || !idEscuela) {
        console.error(' ERROR: Datos incompletos:', { id_tiporeporte, descripcion, ID_usuario, nom_usuario });
        return res.status(400).json({ success: false, message: 'Faltan datos para registrar el reporte.' });
    }


    const query = `
        INSERT INTO reportes (id_tiporeporte, descripcion, ID_usuario, fecha_reporte, id_escuela)
        VALUES (?, ?, ?, NOW(), ?)
    `;

    conexion.execute(query, [id_tiporeporte, descripcion, ID_usuario, idEscuela], (err, result) => {
        if (err) {
            console.error(' ERROR en la consulta SQL:', err);
            return res.status(500).json({ success: false, message: 'Hubo un error al agregar el reporte.' });
        }

        return res.status(200).json({ success: true, message: 'Reporte agregado exitosamente.', reporteId: result.insertId });
    });
});

app.get('/obtenerUsuario', (req, res) => {
    if (!req.session.userId) {
        return res.json({ success: false, message: "Usuario no autenticado" });
    }

    res.json({ 
        success: true, 
        ID_usuario: req.session.userId, 
        nom_usuario: req.session.userName, 
        idEscuela: req.session.id_escuela
    });
});



// Ruta para obtener todos los reportes con el nombre del usuario
app.get('/obtenerReportes', (req, res) => {
    let idEscuela = req.session.id_escuela;
    const query = `
        SELECT 
            r.id_reporte, 
            r.descripcion, 
            r.id_tiporeporte, 
            r.fecha_reporte,
            u.nom_usuario, 
            t.tipo AS tipo_reporte
        FROM reportes r
        JOIN tiporeportes t ON r.id_tiporeporte = t.id_tiporeporte
        JOIN usuario u ON r.id_usuario = u.id_usuario
        WHERE r.id_escuela = ?
        ORDER BY r.fecha_reporte DESC
    `;

    conexion.query(query, idEscuela, (err, results) => {
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
          SELECT DISTINCT g.id_grupo, g.nom_grupo, g.id_turno 
            FROM grupo h 
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
            FROM salon h 
            JOIN salon s ON h.id_salon = s.id_salon
        `);

        const [materias] = await conexion.promise().query(`
           SELECT DISTINCT m.id_materia, m.nom_materia 
            FROM materia h 
            JOIN materia m ON h.id_materia = m.id_materia;
        `);

        const [profesores] = await conexion.promise().query(`
            SELECT DISTINCT p.id_persona, 
                CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS nombre_completo
            FROM persona h 
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
    let idEscuela = req.session.id_escuela;
    const id_Escuela = req.session.id_escuela;
    console.log('Datos recibidos en /agregar-horario:', { dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona });
    console.log('ID Escuela:', idEscuela);


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
            if (!hora_inicio[i] || !hora_final[i] || !id_salon[i] || !id_persona[i] || !id_materia[i]) { 
                return res.status(400).json({ success: false, message: 'Todos los campos deben estar completos.' });
            }

            const [horarioExistente] = await conexion.promise().query(
                `SELECT * FROM horario 
                 WHERE hora_inicio = ? 
                 AND hora_final = ? 
                 AND id_salon = ? 
                 AND id_grupo = ? 
                 AND id_persona = ?
                 
                `,


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
                idContenedor,
                idEscuela
            ]);
        }

        // Insertar todos los horarios a la vez
        await conexion.promise().query(
            `INSERT INTO horario (dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona, id_contenedor, id_escuela)
            VALUES ?`,
            [horarios]
        );

        res.json({ success: true, message: 'Horarios agregados correctamente' });
    } catch (error) {
        console.error('Error al insertar horarios:', error);
        res.status(500).json({ error: 'Error al insertar horarios' });
    }
});

//--------------------Ruta de editar horarios-------------------------------------------
app.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
});

app.get('/obtener-horarios/:dia/:idGrupo/:idContenedor', async (req, res) => {
    const { dia, idGrupo, idContenedor } = req.params;

    try {
        const [horarios] = await conexion.promise().query(`
            SELECT h.id_horario, h.dia_horario, h.hora_inicio, h.hora_final,
                   h.id_salon, m.nom_materia, g.nom_grupo,
                   CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS nombre_completo
            FROM horario h
            INNER JOIN grupo g ON h.id_grupo = g.id_grupo
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN persona p ON h.id_persona = p.id_persona
            WHERE h.id_grupo = ? AND h.dia_horario = ? AND h.id_contenedor = ?`,
            [idGrupo, dia, idContenedor]
        );

        if (horarios.length === 0) {
            return res.status(404).json({ error: 'No hay horarios disponibles para este día y grupo.' });
        }

        res.json(horarios);
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.put('/editar-horario/:id', async (req, res) => {
    const { id } = req.params;
    const { id_salon, id_materia, id_persona } = req.body;

    try {
        const [horarioExistente] = await conexion.promise().query(
            'SELECT * FROM horario WHERE id_horario = ?',
            [id]
        );

        if (horarioExistente.length === 0) {
            return res.status(404).json({ success: false, message: 'Horario no encontrado.' });
        }

        // Solo actualizar materia, profesor y salón
        await conexion.promise().query(
            `UPDATE horario 
             SET id_salon = ?, id_materia = ?, id_persona = ?
             WHERE id_horario = ?`,
            [id_salon, id_materia, id_persona, id]
        );

        res.json({ success: true, message: 'Horario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar horario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// --------------------------------- FIN RUTA EDITAR HORARIO ------------------------------------


// ----------------------------------- RUTA FILTROS HORARIOS ---------------------------------------------

app.get('/api/filtros', async (req, res) => {
    try {
        const [horarios] = await conexion.promise().query(`
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
    a.fecha_asistencia AS fecha_asistencia,
    a.validacion_asistencia AS asistencia,
    r.validacion_retardo AS retardo,
    f.validacion_falta AS falta,
    per.anio,
    per.periodo
FROM
    horario h
    INNER JOIN grupo g ON h.id_grupo = g.id_grupo
    INNER JOIN salon s ON h.id_salon = s.id_salon
    JOIN materia m ON h.id_materia = m.id_materia
    JOIN persona p ON h.id_persona = p.id_persona
    LEFT JOIN asistencia a ON h.id_horario = a.id_horario
    LEFT JOIN retardo r ON h.id_horario = r.id_horario
    LEFT JOIN falta f ON h.id_horario = f.id_horario
    JOIN contenedor c ON h.id_contenedor = c.id_contenedor
    JOIN periodos per ON c.id_periodo = per.id_periodo
        `);

        
        const salones = [...new Set(horarios.map(h => h.id_salon))];
        const dias = [...new Set(horarios.map(h => h.dia_horario))];
        const grupos = [...new Set(horarios.map(h => `${h.nom_grupo}`))];
        const profesores = [...new Set(horarios.map(h => h.nombre_persona))];
        const materias = [...new Set(horarios.map(h => h.nom_materia))];
        const horasInicio = [...new Set(horarios.map(h => h.hora_inicio))].sort();
        const horasFin = [...new Set(horarios.map(h => h.hora_final))].sort();
        const anios = [...new Set(horarios.map(h => h.anio))];
        const periodos = [...new Set(horarios.map(h => h.periodo))];


        res.json({ salones, dias, grupos, profesores, materias, horasInicio, horasFin, anios, periodos });

    } catch (error) {
        console.error('Error al obtener filtros:', error);
        res.status(500).json({ error: error.message });
    }
});
  

// ----------------------------------- FIN RUTA FILTROS ---------------------------------------------


// ----------------------------------- RUTA FILTROS CONSULTAS ---------------------------------------------

app.get('/api/filtrar-consulta', async (req, res) => {
    try {
        const [horarios] = await conexion.promise().query(`
            SELECT DISTINCT
        p.id_persona,
        CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS nombre_persona,
        g.nom_grupo,
        m.nom_materia,
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
        `);

        
        const grupos = [...new Set(horarios.map(h => `${h.nom_grupo}`))];
        const profesores = [...new Set(horarios.map(h => h.nombre_persona))];
        const materias = [...new Set(horarios.map(h => h.nom_materia))];
        const dia = [...new Set(horarios.map(h => h.dia_horario))];
        const asistencia = [...new Set(horarios.map(h => h.asistencia))];
        const retardo = [...new Set(horarios.map(h => h.retardo))];
        const falta = [...new Set(horarios.map(h => h.falta))];
        const horasInicio = [...new Set(horarios.map(h => h.hora_inicio))].sort();
        const horasFin = [...new Set(horarios.map(h => h.hora_final))].sort();


        res.json({ dia, grupos, profesores, materias, asistencia, retardo, falta, horasInicio, horasFin});

    } catch (error) {
        console.error('Error al obtener filtros:', error);
        res.status(500).json({ error: error.message });
    }
});
  

// ----------------------------------- FIN RUTA FILTROS ---------------------------------------------

// ----------------------------------- RUTA FILTRO VER REPORTES ---------------------------------------------


app.get('/api/filtrar-reportes', async (req, res) => {
    try {
        const [reportes] = await conexion.promise().query(`
            SELECT 
            r.id_reporte, 
            r.descripcion, 
            r.id_tiporeporte, 
            r.fecha_reporte,
            u.nom_usuario, 
            t.tipo AS tipo_reporte
        FROM reportes r
        JOIN tiporeportes t ON r.id_tiporeporte = t.id_tiporeporte
        JOIN usuario u ON r.id_usuario = u.id_usuario
        `);

        
        const tipo_reporte = [...new Set(reportes.map(r => `${r.tipo_reporte}`))];
        const nom_usuario = [...new Set(reportes.map(r => r.nom_usuario))];

        res.json({ tipo_reporte, nom_usuario });

    } catch (error) {
        console.error('Error al obtener filtros:', error);
        res.status(500).json({ error: error.message });
    }
});
  

// -----------------------------------  FIN RUTA FILTRO VER REPORTES ---------------------------------------------

// -------------------------------- RUTA ASIS POR PROFESOR --------------------------------

app.get('/api/profes/:id_persona', async (req, res) => {
    const id_persona = req.params.id_persona;
    const query = `
    SELECT
        p.id_persona,
        CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS persona,
        g.nom_grupo AS grupo,
        m.nom_materia AS materia,
        h.dia_horario,
        h.hora_inicio,
        h.hora_final,
        a.fecha_asistencia AS fecha_asistencia,
        a.validacion_asistencia AS asistencia,
        r.validacion_retardo AS retardo,
        f.validacion_falta AS falta
    FROM
        persona AS p
        JOIN horario AS h ON p.id_persona = h.id_persona
        JOIN grupo AS g ON h.id_grupo = g.id_grupo
        JOIN materia AS m ON h.id_materia = m.id_materia
        JOIN asistencia AS a ON h.id_horario = a.id_horario
        LEFT JOIN retardo r ON h.id_horario = r.id_horario
        LEFT JOIN falta f ON h.id_horario = f.id_horario
    WHERE h.id_persona = ?
    ORDER BY
        persona,
        dia_horario,
        hora_inicio;`;

    try {
        const [results] = await conexion.promise().query(query, [id_persona]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No records found for this professor' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching records by ID:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// -------------------------------- FIN RUTA ASIS POR PROFESOR --------------------------------



// -------------------------------- RUTA PROFES --------------------------------

app.get('/api/profesores', async (req, res) => {
    const query = `
    SELECT id_persona, CONCAT(nom_persona, ' ', appat_persona, ' ', apmat_persona) AS nombre
    FROM persona
    WHERE id_rol = '1';
    `;

    try {
        const [results] = await conexion.promise().query(query);
        res.json(results);
    } catch (err) {
        console.error('Error fetching professors:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// -------------------------------- FIN RUTA PROFES --------------------------------





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