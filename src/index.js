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

import getRawBody from 'raw-body'; 


import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import fs from 'fs';



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
import { isErrored } from 'stream';

dotenv.config();

const conexion = mysql.createPool(process.env.MYSQL_URL);

conexion.getConnection(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conectado a MySQL en Railway');
  } 
});



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Para URLs HTTPS
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configura Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/evidencias');
    fs.mkdir(dir, { recursive: true }, (err) => {
      if (err) {
        console.error('Error al crear directorio uploads:', err);
        return cb(err);
      }
      cb(null, dir);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, etc.)'), false);
  }
};

const uploadMiddleware = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
}).single('evidencia');




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
    secret: 'prefectapp-secret', 
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // true en producción con HTTPS
        httpOnly: true,
        sameSite: 'strict',
        maxAge: null 
        
     } // Usa secure: true si usas HTTPS
}));

app.use(cors({ origin: '*' }));


app.use( express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {
    console.log('Ruta solicitada:', req.path); // Verifica qué ruta se está solicitando
    next();
});

// Ruta pública para registro de jefes (con validación de token)


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
    '/pages/ADM_datos.html',
    '/pages/ADM_consulta-datos.html',
    '/pages/registrar.html',
    '/pages/ADM_jefegrupos.html',
    '/pages/ADM_IA.html'
];

const protectedRoutesPrefecto = [
    '/pages/PRF_menu.html',
    '/pages/PRF_1ER_PISO.html',
    '/pages/PRF_1_piso.html', 
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

app.get('/pages/ADM_datos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_datos.html'));
}
);

app.get('/pages/ADM_consulta-datos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_consulta-datos.html'));
});

app.get('/pages/registrar.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'registrar.html'));
});

app.get('/pages/ADM_jefegrupos.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_jefegrupos.html'));
});

app.get('/pages/ADM_IA.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'ADM_IA.html'));
});

// Rutas PREFECTO
app.get('/pages/PRF_menu.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_menu.html'));
});

app.get('/pages/PRF_1_piso.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'PRF_1_piso.html'));
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




app.use('/api/registrar-jefe', (req, res, next) => {
    if (req.method === 'POST') {
        const { token } = req.body;
        const tokenData = tokenStore.get(token);
        
        if (!tokenData || tokenData.expira < Date.now()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Token inválido o expirado' 
            });
        }
    }
    next();
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

    console.log("Datos de inicio de sesión:", { userName, userPassword, rememberMe });

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

        

        const remember = rememberMe === true || rememberMe === 'true';
    console.log(`Remember Me: ${remember}`);

  
    if (remember) {
        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
        req.session.cookie.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else {
        // Esto es lo más importante para tu caso
        req.session.cookie.expires = false;
        req.session.cookie.maxAge = null;
        
        // Fuerza la cookie de sesión
        req.session.cookie.originalMaxAge = null;
    }

        console.log(`OTP generado para ${userName}:`, otpCode);

        const mailOptions = {
    from: `"Prefec App" <${process.env.EMAIL_USER}>`,
    to: user.correo,
    subject: "Tu código de verificación en dos pasos",
    html: `
    <!DOCTYPE html>
<html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #4c53af;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: white;
          margin: 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .code-container {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f5f7ff;
          border-radius: 8px;
          border: 1px dashed #4c53af;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          color: #4c53af;
          padding: 10px 20px;
          background-color: white;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
        }
        .info-card {
          background-color: #f5f7ff;
          border-left: 4px solid #4c53af;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Prefec App</h1>
      </div>
      
      <div class="content">
        <div class="logo">
          <!-- Reemplaza con tu logo o elimina esta sección -->
          <img src="/images/PREFECT APP LOGO.png" alt="Logo Prefec App">
        </div>
        
        <h2>Verificación en Dos Pasos</h2>
        <p>Hemos recibido una solicitud para acceder a tu cuenta de Prefec App. Utiliza el siguiente código para completar el proceso:</p>
        
        <div class="code-container">
          <p>Tu código de verificación es:</p>
          <div class="verification-code">${otpCode}</div>
          <p>Este código expirará en 10 minutos.</p>
        </div>
        
        <div class="info-card">
          <p><strong>¿No solicitaste este código?</strong></p>
          <p>Si no fuiste tú quien solicitó este código, te recomendamos pedir el cambio de contrase;a inmediatamente.</p>
        </div>
        
        <p>Por razones de seguridad, no compartas este código con nadie. El equipo de Prefec App nunca te pedirá tu código de verificación.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Prefec App. Todos los derechos reservados.</p>
          <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
        </div>
      </div>
    </body>
    </html>
    `,
    text: `Verificación en Dos Pasos\n\nHemos recibido una solicitud para acceder a tu cuenta de Prefec App.\n\nTu código de verificación es: ${otpCode}\n\nEste código expirará en 10 minutos.\n\n¿No solicitaste este código? Si no fuiste tú, te recomendamos cambiar tu contraseña inmediatamente.\n\n© ${new Date().getFullYear()} Prefec App.`
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

     if (!req.session.rememberMeConfigured && req.session.cookie) {
        req.session.cookie.expires = false;
        req.session.cookie.maxAge = null;
        req.session.rememberMeConfigured = true;
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


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
            return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
        }

        // Opcional: limpiar cookies si usas alguna
        res.clearCookie('connect.sid'); // El nombre puede variar según tu config de sesión

        res.status(200).json({ mensaje: 'Sesión cerrada correctamente' });
    });
});



app.get('/obtenerUsuario', (req, res) => {
    console.log('Sesión actual en /obtenerUsuario:', req.session); 

    if (!req.session.loggedin || !req.session.id_usuario || !req.session.nombre) {
        return res.status(401).json({ success: false, message: 'No estás autenticado o faltan datos en la sesión.' });
    }

    res.json({
        success: true,
        id_usuario: req.session.id_usuario,
        nom_usuario: req.session.nombre,
        cargo: req.session.cargo,
        id_escuela: req.session.id_escuela
    });
});


app.get('/datos-usuario', async (req, res) => {
    const ID_usuario = req.session.userId;
    const nom_usuario = req.session.userName;
    const cargo = req.session.cargo;

   
    try {
    const i = req.session.id_escuela;
        const results = await query('SELECT * FROM escuela WHERE id_escuela = ?', [i]);
        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
        }
        const user = results[0];
        res.json({
            success: true,
            userId: ID_usuario,
            nom_usuario: nom_usuario,
            cargo: cargo,
            nom_escuela: user.nom_escuela,
        });
    } catch (err) {
        console.error('Error al obtener datos del usuario:', err);
        res.status(500).json({ success: false, message: 'Error al obtener datos del usuario.' });
    }
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
// Obtener TODAS las escuelas (menos la 2)
app.get('/api/escuelas', async (req, res) => {
  try {
    const [rows] = await conexion.promise().query(
      'SELECT ID_escuela, nom_escuela, CCT, telefono_escuela FROM escuela WHERE ID_escuela != 2'
    );
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener escuelas:", err);
    res.status(500).json({ error: "Error al obtener escuelas" });
  }
});


  
  // Obtener una escuela por su ID
app.get('/api/escuelas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await conexion.promise().query(
      'SELECT ID_escuela, nom_escuela, CCT, telefono_escuela FROM escuela WHERE ID_escuela = ?',
      [id]
    );
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
    },
    dkim: {
        domainName: "http://prefect-app-production.up.railway.app", 
        keySelector: "default",
    }
});

// --------------------------------  RUTA DE REGISTRO  --------------------------------

app.post('/register', async (req, res) => {
  let {
    userName,
    userEmail,
    userCargo,
    userPassword,
    confirmar_contrasena,
    idEscuela
  } = req.body;

  // Determina si es empresa o admin quien está registrando
  const tipoUsuario = req.session?.cargo;
  console.log("👤 Tipo de usuario actual:", tipoUsuario);

  // Si es admin, toma su escuela de la sesión
  if (tipoUsuario === "admin") {
    idEscuela = req.session.id_escuela;
    console.log("🏫 Escuela asignada desde sesión del admin:", idEscuela);
  }

  console.log("📥 Datos recibidos en /register:", { userName, userEmail, userCargo, idEscuela });

  if (!userName || !userEmail || !userCargo || !userPassword || !confirmar_contrasena || !idEscuela) {
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
    console.log("🔗 Link de confirmación:", confirmationLink);

    const mailOptions = {
    from: `"Prefec App" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Confirma tu registro en Prefec App",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #4c53af;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: white;
          margin: 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4c53af;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .info-card {
          background-color: #f5f7ff;
          border-left: 4px solid #4c53af;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Prefec App</h1>
      </div>
      
      <div class="content">
        <div class="logo">
          <!-- Reemplaza con tu logo o elimina esta sección -->
          <img src="/images/PREFECT APP LOGO.png" alt="Logo Prefec App">
        </div>
        
        <h2>¡Bienvenido ${userName}!</h2>
        <p>Has sido registrado en Prefec App. Estás a un solo paso de completar tu registro.</p>

        <div class="info-card">
          <p><strong>Las credenciales de tu cuenta son:</strong></p>
          <p>Usuario:  ${userName}</p>
          <p>Contrase;a: ${userPassword}</p>
        </div>
        
        <p>Para confirmar tu cuenta y comenzar a utilizar nuestros servicios, haz clic en el siguiente botón:</p>

        <p style="text-align: center;">
          <a href="${confirmationLink}" class="button">Confirmar mi cuenta</a>
        </p>
        
        <div class="info-card">
          <p><strong>¿No puedes hacer clic en el botón?</strong></p>
          <p>Copia y pega el siguiente enlace en tu navegador:</p>
          <p><small>${confirmationLink}</small></p>
        </div>

        
        
        <p>Este enlace de confirmación expirará en <strong>24 horas</strong>. Si no confirmas tu cuenta en este tiempo, deberás solicitar un nuevo enlace.</p>
        
        <p>Si no has solicitdado cuenta en Prefec App, por favor ignora este mensaje o contacta con los administradores de tu escuela.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Prefec App. Todos los derechos reservados.</p>
          <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
        </div>
      </div>
    </body>
    </html>
    `,
    text: `¡Bienvenido ${userName}!\n\nGracias por registrarte en Prefec App. Para confirmar tu cuenta, haz clic en el siguiente enlace:\n\n${confirmationLink}\n\nSi no puedes hacer clic, copia y pega la dirección en tu navegador.\n\nEste enlace expirará en 24 horas. Si no solicitaste este registro, por favor ignora este mensaje.\n\n© ${new Date().getFullYear()} Prefec App`
};

await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Registro iniciado. Revisa tu correo para confirmar." });

  } catch (err) {
    console.error("❌ Error en el registro:", err);
    res.json({ success: false, message: "Ocurrió un error al registrar el usuario." });
  }
});


app.get('/confirm/:token', async (req, res) => {
    const { token } = req.params;
    const userData = tokenStore.get(token);

    if (!userData) {
        return res.status(400).send("Token inválido o expirado.");
    }

    res.cookie('confirmationToken', token, { maxAge: 900000, httpOnly: true });
    res.sendFile(path.join(__dirname, 'pages', 'confirmacion.html')); // Envía el HTML con el modal
});

app.post('/confirm-registration', async (req, res) => {
    const token = req.cookies.confirmationToken;
    const { acceptTerms } = req.body; // true/false

    const userData = tokenStore.get(token);
    if (!userData) {
        return res.json({ success: false, message: "Token inválido o expirado." });
    }

    try {
        if (acceptTerms) {
            // ✅ Insertar usuario en la base de datos
            const queryInsert = `INSERT INTO usuario (nom_usuario, correo, cargo, contraseña, id_escuela) VALUES (?, ?, ?, ?, ?)`;
            await query(queryInsert, [
                userData.userName,
                userData.userEmail,
                userData.userCargo,
                userData.userPassword,
                userData.idEscuela
            ]);
            
            tokenStore.delete(token);
            return res.json({ success: true });
        } else {
            // ❌ Rechazó los términos - eliminamos el token
            tokenStore.delete(token);
            return res.json({ success: false });
        }
    } catch (err) {
        console.error("Error al confirmar usuario:", err);
        res.status(500).json({ success: false, message: "Error al procesar la confirmación." });
    }
});
// --------------------------------  FIN REGISTRAR  -------------------------

// --------------------------------  FIN CERRAR SEISON  -------------------------


// -------------------------------  RUTA DE HORARIOS  --------------------------------
app.get('/api/horarios', async (req, res) => {
    const diaActual = new Date().toLocaleDateString('es-MX', { weekday: 'long' });
    const diaCapitalizado = diaActual.charAt(0).toUpperCase() + diaActual.slice(1);
    const horaDia = new Date().getHours() + ':' + String(new Date().getMinutes()).padStart(2, '0');
    const diaPrueba = diaCapitalizado;

    console.log('Día actual:', diaPrueba, 'Hora actual:', horaDia);

      const turno = req.query.turno;
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = fechaActual.getMonth() + 1;
const periodo = (mes >= 8 || mes <= 1) ? 1 : 2;
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
        let queryText = `
            SELECT DISTINCT
                h.id_horario,
                h.dia_horario,
                h.hora_inicio,
                h.hora_final,
                h.id_grupo,
                m.nom_materia,
                CONCAT(p.nom_persona, ' ', p.appat_persona) AS nombre_persona,
                g.sem_grupo,
                g.nom_grupo,
                s.id_salon,
                g.id_turno,
                t.nom_turno
             
            FROM
                horario h
            INNER JOIN grupo g ON h.id_grupo = g.id_grupo
            INNER JOIN salon s ON h.id_salon = s.id_salon
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN persona p ON h.id_persona = p.id_persona
            join turno t on g.id_turno = t.id_turno
            WHERE h.dia_horario = ? AND h.id_contenedor = ? AND h.id_escuela = ?
`;

 const params = [diaPrueba, idContenedor, idEscuela];

    // Si hay turno, lo agregamos como filtro
    if (turno && turno !== null) {
      queryText += ` AND g.id_turno = ?`;
      params.push(turno);
    }

    const [results] = await conexion.promise().query(queryText, params);

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
          SELECT 
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
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en el servidor:', req.body);

    const { validacion_asistencia, validacion_retardo, validacion_falta, id_horario } = req.body;

    console.log('El id del horario del checkbox es:', req.body);


    try {
        // Insertar datos en la tabla asistencia
        await insertarAsistencia(validacion_asistencia, id_horario, idEscuela);

        // Insertar datos en la tabla retardo
        await insertarRetardo(validacion_retardo, id_horario , idEscuela);

        // Insertar datos en la tabla falta
        await insertarFalta(validacion_falta, id_horario , idEscuela);

        res.send("Datos actualizados correctamente");
    } catch (error) {
        console.error('Error al actualizar los datos:', error);
        res.status(500).send('Error al actualizar los datos');
    }
});


async function insertarAsistencia(validacion_asistencia, id_horario, idEscuela) {
    return new Promise((resolve, reject) => {
        conexion.query('INSERT INTO asistencia (validacion_asistencia, fecha_asistencia, id_horario, id_escuela) VALUES (?, NOW(), ?, ?)',
            [validacion_asistencia, id_horario, idEscuela],
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

async function insertarRetardo(validacion_retardo, id_horario, idEscuela) {
    return new Promise((resolve, reject) => {
        conexion.query('INSERT INTO retardo (validacion_retardo, fecha_retardo, id_horario, id_escuela) VALUES (?, NOW(), ?, ?)',
            [validacion_retardo, id_horario, idEscuela],
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

async function insertarFalta(validacion_falta, id_horario, idEscuela) {
    return new Promise((resolve, reject) => {
        conexion.query('INSERT INTO falta (validacion_falta, fecha_falta, id_horario, id_escuela) VALUES (?, NOW(), ?, ?)',
            [validacion_falta, id_horario, idEscuela],
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
        conexion.query('UPDATE asistencia SET validacion_asistencia = ? WHERE id_horario = ?',
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
        conexion.query('UPDATE retardo SET validacion_retardo = ?  WHERE id_horario = ?',
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
        conexion.query('UPDATE falta SET validacion_falta = ? WHERE id_horario = ?',
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
            SELECT usuario.*, escuela.nom_escuela
            FROM usuario
            LEFT JOIN escuela ON usuario.id_escuela = escuela.ID_escuela
            WHERE usuario.cargo = "admin"
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
  const id = req.params.id;
  const { nom_usuario, correo, id_escuela, contrasena } = req.body;

  // ✅ Paso 1: Verificar que el usuario tenga cargo 'admin'
  try {
    const [rows] = await conexion.promise().query(
      'SELECT cargo FROM usuario WHERE ID_usuario = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (rows[0].cargo !== 'admin') {
      return res.status(403).json({ error: 'Solo se pueden editar usuarios con cargo admin.' });
    }
  } catch (err) {
    console.error('Error al verificar el cargo:', err);
    return res.status(500).json({ error: 'Error al verificar el cargo del usuario.' });
  }

  // ✅ Paso 2: Validar que haya al menos un campo para actualizar
  if (!nom_usuario && !correo && !id_escuela && !contrasena) {
    return res.status(400).json({ error: 'No se enviaron datos para actualizar.' });
  }

  // ✅ Paso 3: Armar dinámicamente el query
  const campos = [];
  const valores = [];

  if (nom_usuario) {
    campos.push('nom_usuario = ?');
    valores.push(nom_usuario);
  }

  if (correo) {
    campos.push('correo = ?');
    valores.push(correo);
  }

  if (id_escuela) {
    campos.push('id_escuela = ?');
    valores.push(id_escuela);
  }

  if (contrasena) {
    const hashed = await bcrypt.hash(contrasena, 10);
    campos.push('contraseña = ?');
    valores.push(hashed);
  }

  // ✅ Siempre forzamos que el cargo se mantenga como 'admin'
  campos.push('cargo = ?');
  valores.push('admin');

  valores.push(id); // El ID va al final para el WHERE

  const query = `UPDATE usuario SET ${campos.join(', ')} WHERE ID_usuario = ?`;

  try {
    const [result] = await conexion.promise().query(query, valores);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente.' });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Verificar si el usuario existe y es admin
    const [rows] = await conexion.promise().query(
      'SELECT cargo FROM usuario WHERE ID_usuario = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (rows[0].cargo !== 'admin') {
      return res.status(403).json({ error: 'Solo se pueden eliminar usuarios con cargo admin.' });
    }

    // Eliminar usuario
    const [result] = await conexion.promise().query(
      'DELETE FROM usuario WHERE ID_usuario = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se pudo eliminar el usuario.' });
    }

    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error en el servidor.' });
  }
});


// ------------------------------- RUTA DE MOSTRAR USUARIOS  --------------------------------

app.get('/api/editarsur', async (req, res) => {
    let idEscuela = req.session.id_escuela;
    const query = `SELECT * FROM usuario Where id_escuela = ?`;

    try {
        const [results] = await conexion.promise().query(query, [idEscuela]);
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

    // Validar que al menos un campo fue proporcionado
    if (!userName && !userEmail && !userCargo && !userPassword && !confirmar_contrasena) {
        return res.status(400).json({ error: 'Debe proporcionar al menos un campo para actualizar' });
    }

    // Validar que si se envía contraseña, también venga confirmación
    if ((userPassword && !confirmar_contrasena) || (!userPassword && confirmar_contrasena)) {
        return res.status(400).json({ error: 'Debe proporcionar ambas contraseñas para actualizar' });
    }

    // Validar coincidencia de contraseñas si se proporcionaron
    if (userPassword && confirmar_contrasena && userPassword !== confirmar_contrasena) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Construir la consulta dinámicamente
    let query = 'UPDATE usuario SET ';
    const params = [];
    let updates = [];

    if (userName) {
        updates.push('nom_usuario = ?');
        params.push(userName);
    }

    if (userEmail) {
        updates.push('correo = ?');
        params.push(userEmail);
    }

    if (userCargo) {
        updates.push('cargo = ?');
        params.push(userCargo);
    }

    if (userPassword) {
        updates.push('contraseña = ?');
        params.push(userPassword);
    }

    query += updates.join(', ') + ' WHERE ID_usuario = ?';
    params.push(id);

    try {
        const [results] = await conexion.promise().query(query, params);

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
       SELECT 
            p.id_persona,
            CONCAT(p.nom_persona, ' ', p.appat_persona) AS persona,
            g.nom_grupo AS grupo,
            m.nom_materia AS materia,
            h.dia_horario,
            h.hora_inicio,
            h.hora_final,
           DATE_FORMAT(a.fecha_asistencia, '%Y-%m-%d') AS fecha_asistencia,
DATE_FORMAT(r.fecha_retardo, '%Y-%m-%d') AS fecha_retardo,
DATE_FORMAT(f.fecha_falta, '%Y-%m-%d') AS fecha_falta,

            a.validacion_asistencia AS asistencia,
            r.validacion_retardo AS retardo,
            f.validacion_falta AS falta,
            per.anio,
            per.periodo,
              (a.validacion_asistencia + r.validacion_retardo + f.validacion_falta) AS suma_validaciones
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
        AND date(a.fecha_asistencia) = date(r.fecha_retardo) AND date(a.fecha_asistencia) = date(f.fecha_falta)
        ORDER BY
a.fecha_asistencia DESC,
            persona,
            dia_horario,
            hora_inicio

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
    SELECT 
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

app.post('/agregarReporte', uploadMiddleware, async (req, res) => {
  try {
    const { id_tiporeporte, descripcion } = req.body;
    const ID_usuario = req.session.userId;
    const nom_usuario = req.session.userName;
    const id_escuela = req.session.id_escuela;

    if (!id_tiporeporte || !descripcion || !ID_usuario || !nom_usuario || !id_escuela) {
      // Limpiar archivo temporal si existe
      if (req.file?.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Error al limpiar archivo:', e); }
      }
      return res.status(400).json({ success: false, message: 'Faltan datos para registrar el reporte.' });
    }

    let cloudinaryResult = null;
    let filePath = req.file?.path;
    
    try {
      if (req.file) {
        cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
          folder: `prefect_app/escuela_${id_escuela}/reportes`,
          resource_type: 'auto',
          quality: 'auto:good',
          format: 'webp'
        });
      }

      // Verificar que la conexión a la base de datos está bien
      const query = `
        INSERT INTO reportes (
          id_tiporeporte, 
          descripcion, 
          ID_usuario, 
          id_escuela, 
          fecha_reporte, 
          ruta_imagen,
          cloudinary_public_id
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?)
      `;

      // Usar conexion.query en lugar de conexion.execute si es necesario
      const result = await new Promise((resolve, reject) => {
        conexion.query(query, [
          id_tiporeporte, 
          descripcion, 
          ID_usuario, 
          id_escuela,
          cloudinaryResult?.secure_url || null,
          cloudinaryResult?.public_id || null
        ], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });

      // Eliminar archivo temporal solo si existe y se subió correctamente
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Reporte agregado exitosamente.', 
        reporteId: result.insertId,
        imageUrl: cloudinaryResult?.secure_url || null
      });

    } catch (error) {
      console.error('Error en el proceso:', error);
      
      // Limpiar archivo temporal si existe
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error('Error al limpiar archivo:', e); }
      }
      
      // Limpiar de Cloudinary si hubo error después de subir
      if (cloudinaryResult?.public_id) {
        try {
          await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        } catch (e) {
          console.error('Error al limpiar Cloudinary:', e);
        }
      }

      return res.status(500).json({ 
        success: false, 
        message: 'Hubo un error al agregar el reporte.',
        error: error.message 
      });
    }

  } catch (err) {
    console.error('Error general:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
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


// Ruta para obtener reportes (modificada)
app.get('/obtenerReportes', (req, res) => {
    let idEscuela = req.session.id_escuela;
    const query = `
        SELECT 
            r.id_reporte, 
            r.descripcion, 
            r.id_tiporeporte, 
            r.fecha_reporte,
            r.ruta_imagen,
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

// Nueva ruta para obtener detalles completos de un reporte
app.get('/obtenerReporte/:id', (req, res) => {
    const query = `
        SELECT 
            r.*,
            t.tipo AS tipo_reporte,
            u.nom_usuario
        FROM reportes r
        JOIN tiporeportes t ON r.id_tiporeporte = t.id_tiporeporte
        JOIN usuario u ON r.id_usuario = u.id_usuario
        WHERE r.id_reporte = ?
    `;

    conexion.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener el reporte' });
        }
        res.json(results[0] || null);
    });
});

// Ruta para actualizar un reporte (modificada para manejar imágenes)
app.put('/actualizarReporte', async (req, res) => {
    const { id_reporte, id_tiporeporte, descripcion, public_id } = req.body;

    console.log('Datos recibidos en /actualizarReporte:', { id_reporte, id_tiporeporte, descripcion, public_id });

    try {
        // 1. Actualizar los datos básicos del reporte
        const query = `
            UPDATE reportes 
            SET id_tiporeporte = ?, descripcion = ?
            WHERE id_reporte = ?
        `;

        await conexion.execute(query, [id_tiporeporte, descripcion, id_reporte]);

        res.json({ 
            success: true,
            message: 'Reporte actualizado correctamente' 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false,
            error: 'Error al actualizar el reporte' 
        });
    }
});

// Nueva ruta para eliminar reporte
app.delete('/eliminarReporte/:id', async (req, res) => {
    const { id } = req.params;

    // Validar que el ID sea numérico
    if (isNaN(id)) {
        return res.status(400).json({ 
            success: false,
            error: 'ID de reporte inválido' 
        });
    }

    try {
        // 1. Obtener información del reporte (forma más segura)
        const [rows] = await conexion.promise().query(
            'SELECT cloudinary_public_id FROM reportes WHERE id_reporte = ?', 
            [id]
        );

        // Verificar si se encontró el reporte
        if (!rows || rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Reporte no encontrado' 
            });
        }

        const reporte = rows[0];

        // 2. Eliminar la imagen de Cloudinary si existe
        if (reporte.cloudinary_public_id) {
            try {
                const cloudinaryResult = await cloudinary.uploader.destroy(reporte.cloudinary_public_id);
                if (cloudinaryResult.result !== 'ok') {
                    console.warn('Cloudinary no pudo eliminar la imagen:', cloudinaryResult);
                }
            } catch (cloudinaryError) {
                console.error('Error al eliminar de Cloudinary:', cloudinaryError);
                // Continuamos aunque falle Cloudinary
            }
        }

        // 3. Eliminar el reporte de la base de datos
        const [deleteResult] = await conexion.promise().query(
            'DELETE FROM reportes WHERE id_reporte = ?', 
            [id]
        );

        // Verificar si se eliminó correctamente (depende del driver de MySQL)
        const affectedRows = deleteResult?.affectedRows ?? deleteResult;

        if (affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'No se pudo eliminar el reporte (ninguna fila afectada)' 
            });
        }

        return res.json({ 
            success: true,
            message: 'Reporte eliminado correctamente' 
        });

    } catch (err) {
        console.error('Error en eliminarReporte:', err);
        return res.status(500).json({ 
            success: false,
            error: 'Error interno al eliminar el reporte',
            ...(process.env.NODE_ENV === 'development' && { details: err.message })
        });
    }
});

// ------------------------------- FIN RUTA REPORTES --------------------------------

// ------------------------------- RUTA DE AGREGAR HORARIO --------------------------------

app.get('/obtener-datos-horarios', async (req, res) => {
    let idEscuela = req.session.id_escuela;

    try {
        // Obtener grupos
        const [grupos] = await conexion.promise().query(`
            SELECT g.id_grupo, g.nom_grupo 
            FROM grupo g 
            WHERE g.id_escuela = ?
        `, [idEscuela]);

        // Obtener días únicos
        const [dias] = await conexion.promise().query(`
            SELECT DISTINCT h.dia_horario as dia 
            FROM horario h 
           
            WHERE h.id_escuela = ?
        `, [idEscuela]);

        // Obtener salones completos (con piso si es necesario)
        const [salones] = await conexion.promise().query(`
            SELECT s.id_salon, s.nom_salon, p.nom_piso 
            FROM salon s
            JOIN piso p ON s.piso_salon = p.piso_salon
            WHERE s.id_escuela = ?
        `, [idEscuela]);

        // Obtener materias con tipo
        const [materias] = await conexion.promise().query(`
            SELECT m.id_materia, m.nom_materia, tm.nom_tipomateria 
            FROM materia m
            JOIN tipomateria tm ON m.id_tipomateria = tm.id_tipomateria
            WHERE m.id_escuela = ?
        `, [idEscuela]);

        // Obtener profesores con todos los datos necesarios
        const [profesores] = await conexion.promise().query(`
            SELECT 
                p.id_persona, 
                p.nom_persona, 
                p.appat_persona, 
                p.apmat_persona,
                p.correo,
                CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', IFNULL(p.apmat_persona, '')) AS nombre_completo
            FROM persona p
          
            WHERE p.id_escuela = ? 
        `, [idEscuela]);

        // Obtener turnos (si son necesarios para la edición)
        const [turnos] = await conexion.promise().query(`
            SELECT id_turno, nom_turno 
            FROM turno

        `);
        const [horas] = await conexion.promise().query(`
            SELECT hora_inicio, hora_final 
            FROM horario
        `);

        res.json({
            grupos: grupos.map(g => ({
                id_grupo: g.id_grupo,
                nom_grupo: g.nom_grupo,
                // Agrega más campos si son necesarios
            })),
            dias: dias.map(d => ({
                dia_horario: d.dia
        })),

            salones: salones.map(s => ({
                id_salon: s.id_salon,
                nom_salon: s.nom_salon,
                nom_piso: s.nom_piso,
                texto: `${s.nom_salon} (${s.nom_piso})` // Para mostrar en el select
            })),
            materias: materias.map(m => ({
                id_materia: m.id_materia,
                nom_materia: m.nom_materia,
                tipo: m.nom_tipomateria,
                texto: `${m.nom_materia} (${m.nom_tipomateria})` // Para mostrar en el select
            })),
            profesores: profesores.map(p => ({
                id_persona: p.id_persona,
                nombre_completo: p.nombre_completo.trim(), // Eliminar espacios extras
                correo: p.correo,
                texto: p.nombre_completo.trim() // Para mostrar en el select
            })),
            turnos: turnos.map(t => ({
                id_turno: t.id_turno,
                nom_turno: t.nom_turno
            }))
            ,
            horas: horas.map(h => ({
               
                hora_inicio: h.hora_inicio,
                hora_final: h.hora_final,
                texto: `${h.hora_inicio} - ${h.hora_final}` // Para mostrar en el select
            }))
        });
    } catch (error) {
        console.error('Error al obtener los datos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalles: error.message 
        });
    }
});



app.get('/obtener-datos-horarios-2', async (req, res) => {
    let idEscuela = req.session.id_escuela;

    try {
        const [grupos] = await conexion.promise().query(`
            SELECT DISTINCT g.id_grupo, g.nom_grupo, g.id_turno 
            FROM grupo g 
            WHERE g.id_escuela = ?
        `, [idEscuela]);

        const [dias] = await conexion.promise().query(`
            SELECT DISTINCT h.dia_horario as dia 
            FROM horario h 
            JOIN grupo g ON h.id_grupo = g.id_grupo
            
        `);

        const [hora_inicio] = await conexion.promise().query(`
            SELECT DISTINCT h.hora_inicio 
            FROM horario h
            JOIN grupo g ON h.id_grupo = g.id_grupo
           
        `);

        const [hora_final] = await conexion.promise().query(`
            SELECT DISTINCT h.hora_final 
            FROM horario h
            JOIN grupo g ON h.id_grupo = g.id_grupo
           
        `);

        const [salones] = await conexion.promise().query(`
            SELECT DISTINCT s.id_salon
            FROM salon s
            WHERE s.id_escuela = ?
        `, [idEscuela]);

        const [materias] = await conexion.promise().query(`
            SELECT DISTINCT m.id_materia, m.nom_materia 
            FROM materia m 
            WHERE m.id_escuela = ?
        `, [idEscuela]);

        const [profesores] = await conexion.promise().query(`
            SELECT DISTINCT p.id_persona, 
                CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS nombre_completo
            FROM persona p
            WHERE p.id_escuela = ?
        `, [idEscuela]);

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
const periodo = (mes >= 8 || mes <= 1) ? 1 : 2;
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
    let idEscuela = req.session.id_escuela;

    try {
        const [horarios] = await conexion.promise().query(`
            SELECT h.id_horario, h.dia_horario, h.hora_inicio, h.hora_final,
                   h.id_salon, m.nom_materia, g.nom_grupo,
                   CONCAT(p.nom_persona, ' ', p.appat_persona, ' ', p.apmat_persona) AS nombre_completo,
                   h.id_grupo, h.id_materia, h.id_persona 
            FROM horario h
            INNER JOIN grupo g ON h.id_grupo = g.id_grupo
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN persona p ON h.id_persona = p.id_persona
            WHERE h.id_grupo = ? AND h.dia_horario = ? AND h.id_contenedor = ? AND h.id_escuela = ?`,
            [idGrupo, dia, idContenedor, idEscuela]
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



app.post('/editar-horario', async (req, res) => {
    const { id_horario, dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona } = req.body;
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en /editar-horario:', { id_horario, dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona });
    try {
        // Verificar si el horario existe
        const [horarioExistente] = await conexion.promise().query(
            'SELECT * FROM horario WHERE id_horario = ? AND id_escuela = ?',
            [id_horario, idEscuela]
        );
        if (horarioExistente.length === 0) {
            return res.status(404).json({ success: false, message: 'Horario no encontrado.' });
        }
        // Verificar si ya existe un horario con los mismos datos (excepto el id_horario)
        const [horarioDuplicado] = await conexion.promise().query(
            `SELECT * FROM horario 
             WHERE hora_inicio = ? 
             AND hora_final = ? 
             AND id_salon = ? 
             AND id_grupo = ? 
             AND id_persona = ?
             AND id_horario != ?
            `,
            [hora_inicio, hora_final, id_salon, id_grupo, id_persona, id_horario]
        );
        if (horarioDuplicado.length > 0) {
            return res.status(400).json({ success: false, message: 'Ya existe un horario con estos datos.' });
        }   
        // Actualizar el horario
        await conexion.promise().query(
            `UPDATE horario 
             SET dia_horario = ?, hora_inicio = ?, hora_final = ?, id_salon = ?, id_grupo = ?, id_materia = ?, id_persona = ?
             WHERE id_horario = ? AND id_escuela = ?`,
            [dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona, id_horario, idEscuela]
        );
        res.json({ success: true, message: 'Horario actualizado correctamente.' });
    } catch (error) {
        console.error('Error al editar horario:', error);
        res.status(500).json({ success: false, error: 'Error al editar horario' });
    }
});




// --------------------------------- FIN RUTA EDITAR HORARIO ------------------------------------


// ----------------------------------- RUTA FILTROS HORARIOS ---------------------------------------------

app.get('/api/filtros', async (req, res) => {
    let idEscuela = req.session.id_escuela;
     try {
        // Consulta específica solo para los periodos
        const [periodos] = await conexion.promise().query(`
            SELECT DISTINCT 
                per.periodo AS valor,
                CASE 
                    WHEN per.periodo = 1 THEN 'Agosto-Enero'
                    WHEN per.periodo = 2 THEN 'Febrero-Julio'
                    ELSE 'Desconocido'
                END AS texto
            FROM periodos per
            JOIN contenedor c ON per.id_periodo = c.id_periodo
            JOIN horario h ON c.id_contenedor = h.id_contenedor
            WHERE h.id_escuela = ?
            ORDER BY per.periodo
        `, [idEscuela]);

        // Consulta para los demás filtros (como estaba)
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
                per.anio
            FROM horario h
            INNER JOIN grupo g ON h.id_grupo = g.id_grupo
            INNER JOIN salon s ON h.id_salon = s.id_salon
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN persona p ON h.id_persona = p.id_persona
            JOIN contenedor c ON h.id_contenedor = c.id_contenedor
            JOIN periodos per ON c.id_periodo = per.id_periodo
            WHERE h.id_escuela = ?
        `, [idEscuela]);

        // Procesar los demás filtros como antes
        const salones = [...new Set(horarios.map(h => h.id_salon))];
        const dias = [...new Set(horarios.map(h => h.dia_horario))];
        const grupos = [...new Set(horarios.map(h => `${h.nom_grupo}`))];
        const profesores = [...new Set(horarios.map(h => h.nombre_persona))];
        const materias = [...new Set(horarios.map(h => h.nom_materia))];
        const horasInicio = [...new Set(horarios.map(h => h.hora_inicio))].sort();
        const horasFin = [...new Set(horarios.map(h => h.hora_final))].sort();
        const anios = [...new Set(horarios.map(h => h.anio))];

        res.json({ 
            salones, 
            dias, 
            grupos, 
            profesores, 
            materias, 
            horasInicio, 
            horasFin, 
            anios, 
            periodos: periodos // Usamos los periodos de la consulta específica
        });
    } catch (error) {
        console.error('Error al obtener filtros:', error);
        res.status(500).json({ error: error.message });
    }
});
  

// ----------------------------------- FIN RUTA FILTROS ---------------------------------------------


// ----------------------------------- RUTA FILTROS CONSULTAS ---------------------------------------------

app.get('/api/filtrar-consulta', async (req, res) => {
    let idEscuela = req.session.id_escuela;
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
        `, [idEscuela]);

        
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
    let idEscuela = req.session.id_escuela;
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
        JOIN usuario u ON r.id_usuario = u.id_usuario WHERE r.id_escuela = ?
        ` , [idEscuela]);

        
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
app.post('/agregar-profe', async (req, res) => {
    const { nom_persona, appat_persona, apmat_persona, correo } = req.body;
    
    const id_rol = 1; // Rol fijo para profesores
    let idEscuela = req.session.id_escuela;
    
    console.log('Datos recibidos en /agregar-profesor:', { 
        nom_persona, 
        appat_persona, 
        apmat_persona, 
        correo,
        idEscuela
    });

    try {
        // 1️⃣ Validar campos obligatorios
        if (!nom_persona || !appat_persona || !correo) {
            return res.status(400).json({ 
                success: false, 
                message: 'Nombre, apellido paterno y correo son campos obligatorios.' 
            });
        }

        // 2️⃣ Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({ 
                success: false, 
                message: 'El formato del correo electrónico es inválido.' 
            });
        }

        // 3️⃣ Verificar si el correo ya existe
        const [correoExistente] = await conexion.promise().query(
            'SELECT id_persona FROM persona WHERE correo = ? AND id_escuela = ?',
            [correo, idEscuela]
        );

        if (correoExistente.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'El correo electrónico ya está registrado en esta escuela.' 
            });
        }

        // 4️⃣ Insertar el profesor
        const [resultado] = await conexion.promise().query(
            `INSERT INTO persona 
             (nom_persona, appat_persona, apmat_persona, correo, id_rol, id_escuela) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nom_persona, appat_persona, apmat_persona, correo, id_rol, idEscuela]
        );

       

        res.json({ 
            success: true, 
            message: 'Profesor agregado correctamente',
            id_persona: resultado.insertId 
        });

    } catch (error) {
        console.error('Error al insertar profesor:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al insertar profesor',
            error: error.message 
        });
    }
});

// -------------------------------- FIN RUTA PROFES --------------------------------

// -------------------------------- RUTA PARA OBTENER TIPO MATERIAS --------------------------------

app.get('/api/tipomaterias', async (req, res) => {
    let idEscuela = req.session.id_escuela;
    const query = `
    SELECT id_tipomateria, nom_tipomateria
    FROM tipomateria
    `;
    try {
        const [results] = await conexion.promise().query(query);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron carreras para esta escuela' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching careers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// -------------------------------- FIN RUTA PARA OBTENER TIPO MATERIAS --------------------------------

// -------------------------------- RUTA PARA AGREGAR MATERIAS --------------------------------

app.post('/agregar-materia', async (req, res) => {
    const { nom_materia, id_tipomateria } = req.body;
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en /agregar-materia:', { nom_materia, id_tipomateria });

    try {
        // 1️⃣ Validar campos obligatorios
        if (!nom_materia || !id_tipomateria) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de la materia y tipo de materia son campos obligatorios.'
            });
        }
        // 2️⃣ Verificar si la materia ya existe
        const [materiaExistente] = await conexion.promise().query(
            'SELECT id_materia FROM materia WHERE nom_materia = ? AND id_escuela = ?',
            [nom_materia, idEscuela]
        );  
        if (materiaExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'La materia ya está registrada en esta escuela.'
            });
        }
        // 3️⃣ Insertar la materia
        const [resultado] = await conexion.promise().query(
            `INSERT INTO materia (nom_materia, id_tipomateria, id_escuela   )
             VALUES (?, ?, ?)`,
            [nom_materia, id_tipomateria, idEscuela]
        );
        res.json({
            success: true,
            message: 'Materia agregada correctamente',
            id_materia: resultado.insertId
        });
    } catch (error) {
        console.error('Error al insertar materia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al insertar materia',
            error: error.message
        });
    }
});

// -------------------------------- FIN RUTA PARA AGREGAR MATERIAS --------------------------------

// -------------------------------- RUTA PARA AGREGAR CARREAS  --------------------------------

app.post('/agregar-carrera', async (req, res) => {
    const { nom_carrera } = req.body;
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en /agregar-carrera:', { nom_carrera });   

    try {
        // 1️⃣ Validar campos obligatorios
        if (!nom_carrera) {
            return res.status(400).json({
                success: false,
                message: 'Nombre de la carrera y tipo de carrera son campos obligatorios.'
            });
        }
        // 2️⃣ Verificar si la carrera ya existe
        const [carreraExistente] = await conexion.promise().query(
            'SELECT id_carrera FROM carrera WHERE nom_carrera = ? AND id_escuela = ?',
            [nom_carrera, idEscuela]
        );
        if (carreraExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'La carrera ya está registrada en esta escuela.'   
            });
        }
        // 3️⃣ Insertar la carrera
        const [resultado] = await conexion.promise().query(
            `INSERT INTO carrera (nom_carrera, id_escuela)
             VALUES (?, ?)`,
            [nom_carrera, idEscuela]
        );  
        res.json({
            success: true,
            message: 'Carrera agregada correctamente',
            id_carrera: resultado.insertId
        });
    } catch (error) {
        console.error('Error al insertar carrera:', error);
        res.status(500).json({
            success: false,
            message: 'Error al insertar carrera',
            error: error.message
        });
    }
});

// -------------------------------- FIN RUTA PARA AGREGAR CARRERAS  --------------------------------

// -------------------------------- RUTA PARA OBTENER CARRERAS --------------------------------

app.get('/api/carreras', async (req, res) => {
    let idEscuela = req.session.id_escuela;
    const query = `
    SELECT id_carrera, nom_carrera
    FROM carrera
    WHERE id_escuela = ?;
    `;
    try {
        const [results] = await conexion.promise().query(query, [idEscuela]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron carreras para esta escuela' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching careers:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// -------------------------------- FIN RUTA PARA OBTENER CARRERAS --------------------------------

// -------------------------------- RUTA PARA AGREGAR GRUPOS --------------------------------

app.post('/agregar-grupo', async (req, res) => {
    const { nom_grupo, sem_grupo, id_carrera, id_turno } = req.body;
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en /agregar-grupo:', { nom_grupo, sem_grupo, id_carrera, id_turno });

    try {
        // 1️⃣ Validar campos obligatorios
        if (!nom_grupo || !sem_grupo || !id_carrera || !id_turno) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del grupo, semestre y carrera son campos obligatorios.'
            });
        }
        // 2️⃣ Verificar si el grupo ya existe
        const [grupoExistente] = await conexion.promise().query(
            'SELECT id_grupo FROM grupo WHERE nom_grupo = ? AND sem_grupo = ? AND id_carrera = ? AND id_turno = ? AND id_escuela = ?',
            [nom_grupo, sem_grupo, id_carrera, id_turno, idEscuela]
        );
        if (grupoExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El grupo ya está registrado en esta escuela.'
            });
        }
        // 3️⃣ Insertar el grupo
        const [resultado] = await conexion.promise().query(
            `INSERT INTO grupo (nom_grupo, sem_grupo, id_carrera, id_turno, id_escuela)
             VALUES (?, ?, ?, ?, ?)`,
            [nom_grupo, sem_grupo, id_carrera, id_turno, idEscuela]
        );
        res.json({
            success: true,
            message: 'Grupo agregado correctamente',
            id_grupo: resultado.insertId
        });
    } catch (error) {
        console.error('Error al insertar grupo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al insertar grupo',
            error: error.message
        });
    }
});

// -------------------------------- FIN RUTA PARA AGREGAR GRUPOS --------------------------------

// -------------------------------- RUTA PARA AGREGAR PISOS --------------------------------

app.post('/agregar-piso', async (req, res) => {
    const { nom_piso } = req.body;
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en /agregar-piso:', { nom_piso });

    try {
        // 1️⃣ Validar campos obligatorios
        if (!nom_piso) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del piso es un campo obligatorio.'
            });
        }
        // 2️⃣ Verificar si el piso ya existe
        const [pisoExistente] = await conexion.promise().query(
            'SELECT piso_salon FROM piso WHERE nom_piso = ? AND id_escuela = ?',
            [nom_piso, idEscuela]
        );
        if (pisoExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El piso ya está registrado en esta escuela.'
            });
        }
        // 3️⃣ Insertar el piso
        const [resultado] = await conexion.promise().query(
            `INSERT INTO piso (nom_piso, id_escuela)
             VALUES (?, ?)`,
            [nom_piso, idEscuela]
        );
        res.json({
            success: true,
            message: 'Piso agregado correctamente',
            piso_salon: resultado.insertId
        });
    } catch (error) {
        console.error('Error al insertar piso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al insertar piso',
            error: error.message
        });
    }
});

// -------------------------------- FIN RUTA PARA AGREGAR PISOS --------------------------------

// -------------------------------- RUTA PARA OBTENER PISOS --------------------------------

app.get('/api/pisos', async (req, res) => {
    let idEscuela = req.session.id_escuela;
    const query = `
    SELECT piso_salon, nom_piso
    FROM piso
    WHERE id_escuela = ?;
    `;
    try {
        const [results] = await conexion.promise().query(query, [idEscuela]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'No se encontraron pisos para esta escuela' });
        }
        res.json(results);
    } catch (err) {
        console.error('Error fetching floors:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// -------------------------------- FIN RUTA PARA OBTENER PISOS --------------------------------

// -------------------------------- RUTA PARA AGREGAR SALONES --------------------------------

app.post('/agregar-salon', async (req, res) => {
    const { nom_salon, piso_salon } = req.body;
    let idEscuela = req.session.id_escuela;
    console.log('Datos recibidos en /agregar-salon:', { nom_salon, piso_salon });

    try {
        // 1️⃣ Validar campos obligatorios
        if (!nom_salon || !piso_salon) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del salón y piso son campos obligatorios.'
            });
        }
        // 2️⃣ Verificar si el salón ya existe
        const [salonExistente] = await conexion.promise().query(
            'SELECT id_salon FROM salon WHERE nom_salon = ? AND piso_salon = ? AND id_escuela = ?',
            [nom_salon, piso_salon, idEscuela]
        );
        if (salonExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El salón ya está registrado en esta escuela.'
            });
        }
        // 3️⃣ Insertar el salón
        const [resultado] = await conexion.promise().query(
            `INSERT INTO salon (nom_salon, piso_salon, id_escuela)
             VALUES (?, ?, ?)`,
            [nom_salon, piso_salon, idEscuela]
        );
        res.json({
            success: true,
            message: 'Salón agregado correctamente',
            id_salon: resultado.insertId
        });
    } catch (error) {
        console.error('Error al insertar salón:', error);
        res.status(500).json({
            success: false,
            message: 'Error al insertar salón',
            error: error.message
        });
    }
});

// -------------------------------- FIN RUTA PARA AGREGAR SALONES --------------------------------


// -------------------------------- RUTAS PARA CONSULTA --------------------------------

app.get('/api/consulta-profesor', async (req, res) => {
    try {
        const [profesores] = await conexion.promise().query(`
            SELECT p.id_persona, p.nom_persona, p.appat_persona, p.apmat_persona, p.correo 
            FROM persona p 
            WHERE p.id_rol = 1 AND p.id_escuela = ?
        `, [req.session.id_escuela]);
        
        res.json(profesores);
    } catch (error) {
        console.error('Error al consultar profesores:', error);
        res.status(500).json({ message: 'Error al consultar profesores' });
    }
});

app.get('/api/consulta-materia', async (req, res) => {
    try {
        const [materias] = await conexion.promise().query(`
            SELECT m.id_materia, m.nom_materia, t.nom_tipomateria 
            FROM materia m
            JOIN tipomateria t ON m.id_tipomateria = t.id_tipomateria
            WHERE m.id_escuela = ?
        `, [req.session.id_escuela]);
        
        res.json(materias);
    } catch (error) {
        console.error('Error al consultar materias:', error);
        res.status(500).json({ message: 'Error al consultar materias' });
    }
});

app.get('/api/consulta-carrera', async (req, res) => {
    try {
        const [carreras] = await conexion.promise().query(`
            SELECT id_carrera, nom_carrera 
            FROM carrera 
            WHERE id_escuela = ?
        `, [req.session.id_escuela]);
        
        res.json(carreras);
    } catch (error) {
        console.error('Error al consultar carreras:', error);
        res.status(500).json({ message: 'Error al consultar carreras' });
    }
});

app.get('/api/consulta-grupo', async (req, res) => {
    try {
        const [grupos] = await conexion.promise().query(`
            SELECT g.id_grupo, g.nom_grupo, g.sem_grupo, c.nom_carrera, t.nom_turno 
            FROM grupo g
            JOIN carrera c ON g.id_carrera = c.id_carrera
            join turno t on g.id_turno = t.id_turno
            WHERE g.id_escuela = ?
        `, [req.session.id_escuela]);
        
        res.json(grupos);
    } catch (error) {
        console.error('Error al consultar grupos:', error);
        res.status(500).json({ message: 'Error al consultar grupos' });
    }
});

app.get('/api/consulta-salon', async (req, res) => {
    try {
        const [salones] = await conexion.promise().query(`
            SELECT s.id_salon, s.nom_salon, p.nom_piso
            FROM salon s
            join piso p ON s.piso_salon = p.piso_salon
            WHERE s.id_escuela = ?
        `, [req.session.id_escuela]);
        
        res.json(salones);
    } catch (error) {
        console.error('Error al consultar salones:', error);
        res.status(500).json({ message: 'Error al consultar salones' });
    }
});

// -------------------------------- FIN RUTAS PARA CONSULTA --------------------------------


// -------------------------------- RUTA PARA EDITAR DATOS --------------------------------

// ==================== PROFESORES ====================
app.get('/api/obtener-profesor/:id', async (req, res) => {
    try {
        const [profesor] = await conexion.promise().query(
            'SELECT * FROM persona WHERE id_persona = ? AND id_escuela = ?', 
            [req.params.id, req.session.id_escuela]
        );
        
        if (profesor.length === 0) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        
        res.json(profesor[0]);
    } catch (error) {
        console.error('Error al obtener profesor:', error);
        res.status(500).json({ message: 'Error al obtener profesor' });
    }
});

app.put('/api/actualizar-profesor/:id', async (req, res) => {
    const { nom_persona, appat_persona, apmat_persona, correo } = req.body;
    
    try {
        await conexion.promise().query(
            `UPDATE persona SET 
                nom_persona = ?, 
                appat_persona = ?, 
                apmat_persona = ?, 
                correo = ? 
             WHERE id_persona = ? AND id_escuela = ?`,
            [nom_persona, appat_persona, apmat_persona, correo, req.params.id, req.session.id_escuela]
        );
        
        res.json({ success: true, message: 'Profesor actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar profesor:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar profesor' });
    }
});

// ==================== MATERIAS ====================
app.get('/api/obtener-materia/:id', async (req, res) => {
    try {
        const [materia] = await conexion.promise().query(
            'SELECT * FROM materia WHERE id_materia = ? AND id_escuela = ?', 
            [req.params.id, req.session.id_escuela]
        );
        
        if (materia.length === 0) {
            return res.status(404).json({ message: 'Materia no encontrada' });
        }
        
        res.json(materia[0]);
    } catch (error) {
        console.error('Error al obtener materia:', error);
        res.status(500).json({ message: 'Error al obtener materia' });
    }
});

app.put('/api/actualizar-materia/:id', async (req, res) => {
    const { nom_materia, id_tipomateria } = req.body;
    
    try {
        await conexion.promise().query(
            `UPDATE materia SET 
                nom_materia = ?, 
                id_tipomateria = ? 
             WHERE id_materia = ? AND id_escuela = ?`,
            [nom_materia, id_tipomateria, req.params.id, req.session.id_escuela]
        );
        
        res.json({ success: true, message: 'Materia actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar materia:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar materia' });
    }
});

// ==================== CARRERAS ====================
app.get('/api/obtener-carrera/:id', async (req, res) => {
    try {
        const [carrera] = await conexion.promise().query(
            'SELECT * FROM carrera WHERE id_carrera = ? AND id_escuela = ?', 
            [req.params.id, req.session.id_escuela]
        );
        
        if (carrera.length === 0) {
            return res.status(404).json({ message: 'Carrera no encontrada' });
        }
        
        res.json(carrera[0]);
    } catch (error) {
        console.error('Error al obtener carrera:', error);
        res.status(500).json({ message: 'Error al obtener carrera' });
    }
});

app.put('/api/actualizar-carrera/:id', async (req, res) => {
    const { nom_carrera } = req.body;
    
    try {
        await conexion.promise().query(
            `UPDATE carrera SET 
                nom_carrera = ? 
             WHERE id_carrera = ? AND id_escuela = ?`,
            [nom_carrera, req.params.id, req.session.id_escuela]
        );
        
        res.json({ success: true, message: 'Carrera actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar carrera:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar carrera' });
    }
});

// ==================== GRUPOS ====================
app.get('/api/obtener-grupo/:id', async (req, res) => {
    try {
        const [grupo] = await conexion.promise().query(`
            SELECT g.*, c.nom_carrera, t.nom_turno 
            FROM grupo g
            LEFT JOIN carrera c ON g.id_carrera = c.id_carrera
            LEFT JOIN turno t ON g.id_turno = t.id_turno
            WHERE g.id_grupo = ? AND g.id_escuela = ?
        `, [req.params.id, req.session.id_escuela]);
        
        if (grupo.length === 0) {
            return res.status(404).json({ message: 'Grupo no encontrado' });
        }
        
        res.json(grupo[0]);
    } catch (error) {
        console.error('Error al obtener grupo:', error);
        res.status(500).json({ message: 'Error al obtener grupo' });
    }
});

app.put('/api/actualizar-grupo/:id', async (req, res) => {
    const { nom_grupo, sem_grupo, id_carrera, id_turno } = req.body;
    
    try {
        await conexion.promise().query(
            `UPDATE grupo SET 
                nom_grupo = ?, 
                sem_grupo = ?, 
                id_carrera = ?, 
                id_turno = ? 
             WHERE id_grupo = ? AND id_escuela = ?`,
            [nom_grupo, sem_grupo, id_carrera, id_turno, req.params.id, req.session.id_escuela]
        );
        
        res.json({ success: true, message: 'Grupo actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar grupo:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar grupo' });
    }
});

// ==================== SALONES ====================
app.get('/api/obtener-salon/:id', async (req, res) => {
    try {
        const [salon] = await conexion.promise().query(`
            SELECT s.*, p.nom_piso 
            FROM salon s
            LEFT JOIN piso p ON s.piso_salon = p.piso_salon
            WHERE s.id_salon = ? AND s.id_escuela = ?
        `, [req.params.id, req.session.id_escuela]);
        
        if (salon.length === 0) {
            return res.status(404).json({ message: 'Salón no encontrado' });
        }
        
        res.json(salon[0]);
    } catch (error) {
        console.error('Error al obtener salón:', error);
        res.status(500).json({ message: 'Error al obtener salón' });
    }
});

app.put('/api/actualizar-salon/:id', async (req, res) => {
    const { nom_salon, piso_salon } = req.body;

    console.log('Datos recibidos en /actualizar-salon:', { nom_salon, piso_salon });
    
    try {
        await conexion.promise().query(
            `UPDATE salon SET 
                nom_salon = ?, 
                piso_salon = ? 
             WHERE id_salon = ? AND id_escuela = ?`,
            [nom_salon, piso_salon, req.params.id, req.session.id_escuela]
        );
        
        res.json({ success: true, message: 'Salón actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar salón:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar salón' });
    }
});

// ==================== DATOS PARA SELECTS ====================
app.get('/api/consulta-tipomateria', async (req, res) => {
    try {
        const [tipos] = await conexion.promise().query('SELECT * FROM tipomateria');
        res.json(tipos);
    } catch (error) {
        console.error('Error al obtener tipos de materia:', error);
        res.status(500).json({ message: 'Error al obtener tipos de materia' });
    }
});

app.get('/api/consulta-carrera', async (req, res) => {
    try {
        const [carreras] = await conexion.promise().query(
            'SELECT * FROM carrera WHERE id_escuela = ?',
            [req.session.id_escuela]
        );
        res.json(carreras);
    } catch (error) {
        console.error('Error al obtener carreras:', error);
        res.status(500).json({ message: 'Error al obtener carreras' });
    }
});

app.get('/api/consulta-turno', async (req, res) => {
    try {
        const [turnos] = await conexion.promise().query('SELECT * FROM turno');
        res.json(turnos);
    } catch (error) {
        console.error('Error al obtener turnos:', error);
        res.status(500).json({ message: 'Error al obtener turnos' });
    }
});

app.get('/api/consulta-piso', async (req, res) => {
    try {
        const [pisos] = await conexion.promise().query('SELECT * FROM piso Where id_escuela = ?', [req.session.id_escuela]);
        res.json(pisos);
    } catch (error) {
        console.error('Error al obtener pisos:', error);
        res.status(500).json({ message: 'Error al obtener pisos' });
    }
});

// -------------------------------- FIN RUTA PARA EDITAR DATOS --------------------------------

// -------------------------------- RUTAS DE GRAFICAS --------------------------------

// RUTAS DE GRAFIACAS

app.get('/api/profes', async (req, res) => {
  try {
    const [profesores] = await conexion.promise().query(`
      SELECT id_persona, CONCAT(nom_persona, ' ', appat_persona, ' ', apmat_persona) AS nombre_completo 
      FROM persona 
      WHERE id_escuela = ?
      ORDER BY nom_persona, appat_persona, apmat_persona
    `, [req.session.id_escuela]); // Solo profesores de su escuela
    res.json(profesores);
  } catch (err) {
    console.error('Error al obtener profesores:', err);
    res.status(500).json({ error: 'Error al obtener profesores' });
  }
});


app.get('/api/materias/todas', async (req, res) => {
  try {
    const [materias] = await conexion.promise().query(`
      SELECT id_materia, nom_materia 
      FROM materia 
      WHERE id_escuela = ?
    `, [req.session.id_escuela]); // Solo materias de su escuela

    res.json(materias);
  } catch (err) {
    console.error('Error al obtener todas las materias:', err);
    res.status(500).json({ error: 'Error al obtener materias' });
  }
});
app.get('/api/materias/:id', async (req, res) => {
  const idProfesor = req.params.id;
  try {
    const [materias] = await conexion.promise().query(`
      SELECT m.id_materia, m.nom_materia 
      FROM materia m
      JOIN horario h ON h.id_materia = m.id_materia
      WHERE h.id_persona = ? AND m.id_escuela = ?
      GROUP BY m.id_materia
    `, [idProfesor, req.session.id_escuela]);

    res.json(materias);
  } catch (err) {
    console.error('Error al obtener materias del profesor:', err);
    res.status(500).json({ error: 'Error al obtener materias del profesor' });
  }
});

app.get('/api/reporteGrafica', async (req, res) => {
  const { profesor, materia, periodo, detallado } = req.query;
  const idEscuela = req.session.id_escuela;

  try {
    // Definir el rango de fechas según el período seleccionado
    let rangoFecha = '';
    const periodos = {
      dia: '1 DAY',
      semana: '7 DAY',
      mes: '1 MONTH',
      '6meses': '6 MONTH',
      anio: '1 YEAR'
    };

    if (periodos[periodo]) {
      rangoFecha = `AND fecha >= CURDATE() - INTERVAL ${periodos[periodo]}`;
    }

    // Consulta detallada que incluye información de materias y horarios
    const query = `
      SELECT 
        fecha,
        GROUP_CONCAT(DISTINCT nom_materia SEPARATOR '; ') AS materias,
        GROUP_CONCAT(DISTINCT hora_inicio SEPARATOR '; ') AS horarios,
        SUM(asistencias) AS asistencias,
        SUM(faltas) AS faltas,
        SUM(retardos) AS retardos,
        GROUP_CONCAT(
          CASE 
            WHEN asistencias > 0 THEN CONCAT('Asistencia(', hora_inicio, ')')
            WHEN faltas > 0 THEN CONCAT('Falta(', hora_inicio, ')')
            WHEN retardos > 0 THEN CONCAT('Retardo(', hora_inicio, ')')
            ELSE ''
          END
          SEPARATOR '; '
        ) AS detalles
      FROM (
        -- Asistencias con información de materia y horario
        SELECT 
          DATE(a.fecha_asistencia) AS fecha,
          m.nom_materia,
          h.hora_inicio,
          SUM(a.validacion_asistencia) AS asistencias,
          0 AS faltas,
          0 AS retardos
        FROM asistencia a
        JOIN horario h ON a.id_horario = h.id_horario
        JOIN persona p ON h.id_persona = p.id_persona
        JOIN materia m ON h.id_materia = m.id_materia
        WHERE h.id_escuela = ?
        ${profesor !== 'todos' ? 'AND h.id_persona = ?' : ''}
        ${materia && materia !== 'todas' ? 'AND h.id_materia = ?' : ''}
        ${rangoFecha.replace('fecha', 'a.fecha_asistencia')}
        GROUP BY DATE(a.fecha_asistencia), m.nom_materia, h.hora_inicio
        
        UNION ALL
        
        -- Faltas con información de materia y horario
        SELECT 
          DATE(f.fecha_falta) AS fecha,
          m.nom_materia,
          h.hora_inicio,
          0 AS asistencias,
          SUM(f.validacion_falta) AS faltas,
          0 AS retardos
        FROM falta f
        JOIN horario h ON f.id_horario = h.id_horario
        JOIN persona p ON h.id_persona = p.id_persona
        JOIN materia m ON h.id_materia = m.id_materia
        WHERE h.id_escuela = ?
        ${profesor !== 'todos' ? 'AND h.id_persona = ?' : ''}
        ${materia && materia !== 'todas' ? 'AND h.id_materia = ?' : ''}
        ${rangoFecha.replace('fecha', 'f.fecha_falta')}
        GROUP BY DATE(f.fecha_falta), m.nom_materia, h.hora_inicio
        
        UNION ALL
        
        -- Retardos con información de materia y horario
        SELECT 
          DATE(r.fecha_retardo) AS fecha,
          m.nom_materia,
          h.hora_inicio,
          0 AS asistencias,
          0 AS faltas,
          SUM(r.validacion_retardo) AS retardos
        FROM retardo r
        JOIN horario h ON r.id_horario = h.id_horario
        JOIN persona p ON h.id_persona = p.id_persona
        JOIN materia m ON h.id_materia = m.id_materia
        WHERE h.id_escuela = ?
        ${profesor !== 'todos' ? 'AND h.id_persona = ?' : ''}
        ${materia && materia !== 'todas' ? 'AND h.id_materia = ?' : ''}
        ${rangoFecha.replace('fecha', 'r.fecha_retardo')}
        GROUP BY DATE(r.fecha_retardo), m.nom_materia, h.hora_inicio
      ) AS combined_data
      GROUP BY fecha
      ORDER BY fecha ASC
    `;

    // Preparar parámetros
    const params = [idEscuela];
    if (profesor !== 'todos') params.push(profesor);
    if (materia && materia !== 'todas') params.push(materia);
    
    // Repetir parámetros para cada parte de la consulta UNION
    params.push(...params.slice(0));
    params.push(...params.slice(0));

    const [rows] = await conexion.promise().query(query, params);

    // Formatear la respuesta
    const result = {
      fechas: rows.map(row => row.fecha),
      materias: rows.map(row => row.materias || ''),
      horarios: rows.map(row => row.horarios || ''),
      detalles: rows.map(row => row.detalles || ''),
      asistencias: rows.map(row => row.asistencias),
      faltas: rows.map(row => row.faltas),
      retardos: rows.map(row => row.retardos)
    };

    res.json(result);
  } catch (err) {
    console.error("Error en reporteGrafica:", err);
    res.status(500).json({ 
      error: "Error al consultar el reporte",
      details: err.message 
    });
  }
});

app.get('/api/materias/profesor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [materias] = await conexion.promise().query(`
      SELECT DISTINCT m.id_materia, m.nom_materia
      FROM materia m
      JOIN horario h ON m.id_materia = h.id_materia
      WHERE h.id_persona = ?;
    `, [id]);

    res.json(materias);
  } catch (err) {
    console.error("Error al obtener materias del profesor:", err);
    res.status(500).json({ error: "Error al consultar materias" });
  }
});
app.get("/api/reportes", async (req, res) => {
  const { profesor, materia, periodo } = req.query;
  const id_escuela = req.session.user?.id_escuela;

  if (!id_escuela) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    let query = `
      SELECT 
        DATE(a.fecha) AS fecha,
        SUM(CASE WHEN a.estado = 'asistencia' THEN 1 ELSE 0 END) AS asistencias,
        SUM(CASE WHEN a.estado = 'falta' THEN 1 ELSE 0 END) AS faltas,
        SUM(CASE WHEN a.estado = 'retardo' THEN 1 ELSE 0 END) AS retardos
      FROM asistencia a
      JOIN horario h ON a.id_horario = h.id_horario
      WHERE h.id_escuela = ?
    `;

    const params = [id_escuela];

    if (profesor !== "todos") {
      query += " AND h.id_usuario = ?";
      params.push(profesor);
    }

    if (materia !== "todas") {
      query += " AND h.id_materia = ?";
      params.push(materia);
    }

    const dias = {
      dia: 1,
      semana: 7,
      mes: 30,
      semestre: 182,
      año: 365,
    };

    const diasPeriodo = dias[periodo] || 7;
    query += ` AND a.fecha >= CURDATE() - INTERVAL ? DAY`;
    params.push(diasPeriodo);

    query += " GROUP BY DATE(a.fecha) ORDER BY a.fecha ASC";

    const [rows] = await conexion.promise().query(query, params);

    const fechas = rows.map((r) => r.fecha);
    const asistencias = rows.map((r) => r.asistencias);
    const faltas = rows.map((r) => r.faltas);
    const retardos = rows.map((r) => r.retardos);

    res.json({ fechas, asistencias, faltas, retardos });
  } catch (error) {
    console.error("Error en /api/reportes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



// -------------------------------- FIN RUTAS DE GRAFICAS --------------------------------


app.get('/jefes-filtro', async (req, res) => {
    let idEscuela = req.session.id_escuela;
    try {
        const [jefes] = await conexion.promise().query(`
           SELECT 
    id_jefe, 
    CONCAT(nom_jefe, ' ', appat_jefe, ' ', apmat_jefe) AS nombre_completo, 
    correo, 
    boleta, 
    g.nom_grupo
FROM jefegrupo 
JOIN grupo g ON jefegrupo.id_grupo = g.id_grupo
WHERE jefegrupo.id_escuela = ?
ORDER BY nom_jefe, appat_jefe, apmat_jefe;

        `, [idEscuela]);

        const [grupo_filtro] = await conexion.promise().query(`
            SELECT id_grupo, nom_grupo 
            FROM grupo 
            WHERE id_escuela = ?
            ORDER BY nom_grupo
        `, [idEscuela]);
        
        res.json({
    jefes: jefes,
    grupo_filtro: grupo_filtro
});

    } catch (error) {
        console.error('Error al obtener jefes de escuela:', error);
        res.status(500).json({ error: 'Error al obtener jefes de escuela' });
    }

});

// -------------------------------- RUTA PARA OBTENER JEFES DE GRUPO --------------------------------

app.get('/api/jefes', async (req, res) => {
    let idEscuela = req.session.id_escuela;
    try {
        const [jefes] = await conexion.promise().query(`
           SELECT 
    id_jefe, 
    nom_jefe,
    appat_jefe,
    apmat_jefe,
    jefegrupo.id_grupo,
    CONCAT(nom_jefe, ' ', appat_jefe, ' ', apmat_jefe) AS nombre_completo, 
    correo, 
    boleta, 
    g.nom_grupo
FROM jefegrupo 
JOIN grupo g ON jefegrupo.id_grupo = g.id_grupo
WHERE jefegrupo.id_escuela = ?
ORDER BY nom_jefe, appat_jefe, apmat_jefe;


        `, [idEscuela]);
        res.json(jefes);
    } catch (error) {
        console.error('Error al obtener jefes de escuela:', error);
        res.status(500).json({ error: 'Error al obtener jefes de escuela' });
    }
});

// -------------------------------- FIN RUTA PARA OBTENER JEFES DE GRUPO --------------------------------


// -------------------------------- RUTA PARA Editar JEFES DE GRUPO --------------------------------

app.delete('/api/editarjefe/:id', async (req, res) => {
    const id = req.params.id;
    const query = `DELETE FROM jefegrupo WHERE id_jefe = ?`;

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

app.put('/api/editarjefe/:id', async (req, res) => {
    const id = req.params.id;
    const { userName, userEmail, userAppat, userApmat, userBoleta, userGrupo } = req.body;


    if (!userName || !userEmail || !userAppat || !userApmat || !userBoleta || !userGrupo) {
        return res.status(400).json({ error: 'Faltan datos del usuario' });
    }


    const query = `UPDATE jefegrupo SET nom_jefe = ?, appat_jefe = ?, apmat_jefe = ?, correo = ?, boleta = ?, id_grupo = ? WHERE id_jefe = ?`;

    try {
        const [results] = await conexion.promise().query(query, [userName, userAppat, userApmat, userEmail, userBoleta, userGrupo, id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// -------------------------------- FIN RUTA DE EDITAR USUARIO ----------------------------------------------


// -------------------------------- RUTA PARA AGREGAR JEFES DE GRUPO --------------------------------

app.post('/api/enviar-correo-jefe', async (req, res) => {
  const { correo, grupoId, grupoNombre } = req.body;
  const idEscuela = req.session.id_escuela;

  if (!correo || !grupoId) {
    return res.json({ success: false, message: 'Correo y grupo son obligatorios' });
  }

  const nom_escuela = await query("SELECT nom_escuela FROM escuela WHERE id_escuela = ?", [idEscuela]);
    if (nom_escuela.length === 0) {
      return res.json({ success: false, message: 'Escuela no encontrada' });
    }

    const nombreEscuela = nom_escuela[0].nom_escuela;

  try {

    const jefeExistente = await query("SELECT * FROM jefegrupo WHERE correo = ?", [correo]);
    if (jefeExistente.length > 0) {
      return res.json({ success: false, message: 'Este correo ya está registrado' });
    }

    const confirmationToken = crypto.randomBytes(32).toString("hex");

    

    console.log("Nombre de la escuela:", nom_escuela);

    tokenStore.set(confirmationToken, {
      correo,
      grupoId,
      idEscuela,
      expira: Date.now() + 24 * 60 * 60 * 1000 
    });

    const baseUrl = process.env.NODE_ENV === 'production'
      ?'https://prefect-app-production.up.railway.app'
                :'http://localhost:3000'


    const registroLink = `${baseUrl}/registrarjefe/${confirmationToken}`;

    const mailOptions = {
  from: `"Prefec App" <${process.env.EMAIL_USER}>`,
      to: correo,
      subject: "Registro como Jefe de Grupo",
      html:`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          background-color: #4c53af;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: white;
          margin: 0;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        .logo img {
          max-width: 150px;
        }
        .info-card {
          background-color: #f5f7ff;
          border-left: 4px solid #4c53af;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4c53af;
          color: white !important;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #777;
        }
        .group-info {
          font-size: 18px;
          font-weight: bold;
          color: #4c53af;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Prefec App</h1>
      </div>
      
      <div class="content">
        <div class="logo">
          <!-- Reemplaza con tu logo o elimina esta sección -->
          <img src="/images/PREFECT APP LOGO.png" alt="Logo Prefec App">
        </div>
        
        <h2>Bienvenido</h2>
        <p>Has sido designado como <strong>Jefe de Grupo</strong> en tu escuela: ${nombreEscuela} y en Prefec Ap.</p>
        
        <div class="info-card">
          <div class="group-info">
            Grupo Asignado: ${grupoNombre}
          </div>
          <p>ID del Grupo: ${grupoId}</p>
        </div>
        
        <p>Para completar tu registro y poder validar las faltas de profes en tu grupo, haz clic en el siguiente botón:</p>
        
        <p style="text-align: center;">
          <a href="${registroLink}" class="button">Completar mi Registro</a>
        </p>
        
        <p><strong>Importante:</strong> Este enlace es válido por <strong>24 horas</strong>. Si no completas tu registro en este tiempo o el <strong>grupo<strong/> no es el correcto, deberás solicitar un nuevo enlace.</p>
        
        <p>Si no solicitaste este registro o no reconoces esta actividad, por favor ignora este mensaje.</p>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Prefec App. Todos los derechos reservados. no es cierto jaja se ve bien perro apoco no</p>
          <p><small>Este es un mensaje automático, por favor no respondas a este correo.</small></p>
        </div>
      </div>
    </body>
    </html>
  `
    };

    await transporter.sendMail(mailOptions);

  
    
    res.json({ success: true, message: 'Correo enviado exitosamente' });

  } catch (err) {
    console.error("Error al enviar correo:", err);
    res.json({ success: false, message: 'Error al enviar el correo' });
  }
});

// -------------------------------- FIN RUTA PARA AGREGAR JEFES DE GRUPO --------------------------------


// Agrega esta ruta para servir registrarJefe.html
app.get('/pages/registrarJefe.html', (req, res) => {
    const token = req.query.token;
    
    if (!token) {
        return res.redirect('/pages/login.html');
    }

    // Verificar el token antes de servir la página
    const tokenData = tokenStore.get(token);
    if (!tokenData || tokenData.expira < Date.now()) {
        return res.redirect('/pages/login.html');
    }

    res.sendFile(path.join(__dirname, 'pages', 'registrarJefe.html'));
});






app.get('/registrarjefe/:token', async (req, res) => {
    const { token } = req.params; // ← Ahora sí obtenemos el token de la ruta
    
    if (!token) {
        return res.redirect('/pages/login.html');
    }

    try {
        // Verificamos el token directamente sin hacer fetch
        const tokenData = tokenStore.get(token);
        
        if (!tokenData || tokenData.expira < Date.now()) {
            return res.redirect('/pages/login.html');
        }

        // Verificar que el grupo exista
        const grupo = await query("SELECT * FROM grupo WHERE id_grupo = ? AND id_escuela = ?", [tokenData.grupoId, tokenData.idEscuela]);
        if (grupo.length === 0) {
            return res.redirect('/pages/login.html');
        }

        // Si todo está bien, servir la página con el token en query params
        res.redirect(`/pages/registrarJefe.html?token=${token}`);

    } catch (error) {
        console.error('Error al verificar token:', error);
        res.redirect('/pages/login.html');
    }
});

// Endpoint para verificar el token (ahora más simple)
app.get('/api/verificar-token-jefe/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const tokenData = tokenStore.get(token);
        
        if (!tokenData) {
            return res.json({ 
                success: false, 
                message: 'Token no encontrado o ya fue usado' 
            });
        }

        if (tokenData.expira < Date.now()) {
            tokenStore.delete(token);
            return res.json({ 
                success: false, 
                message: 'Token expirado' 
            });
        }

        // Verificar que el correo no esté ya registrado
        const [jefeExistente] = await query(
            "SELECT * FROM jefegrupo WHERE correo = ?", 
            [tokenData.correo]
        );

        if (jefeExistente) {
            return res.json({ 
                success: false, 
                message: 'Este correo ya está registrado' 
            });
        }

        res.json({
            success: true,
            correo: tokenData.correo,
            grupoId: tokenData.grupoId,
            idEscuela: tokenData.idEscuela
        });

    } catch (err) {
        console.error("Error al verificar token:", err);
        res.status(500).json({ 
            success: false, 
            message: 'Error al verificar token' 
        });
    }
});

app.post('/api/registrar-jefe', async (req, res) => {

  const {
    nombre,
    appat,
    apmat,
    boleta,
    codigo_jefe,
    correo,
    grupoId,
    token,
    idEscuela
  } = req.body;

  // Validar token primero
  const tokenData = tokenStore.get(token);
  if (!tokenData || tokenData.expira < Date.now() || tokenData.correo !== correo) {
    return res.json({ success: false, message: 'Token inválido o expirado' });
  }

  try {
    // Verificar si el grupo existe
    const grupo = await query("SELECT * FROM grupo WHERE id_grupo = ?", [grupoId]);
    if (grupo.length === 0) {
      return res.json({ success: false, message: 'Grupo no encontrado' });
    }


    // Insertar en la base de datos
    await query(
      `INSERT INTO jefegrupo 
      (nom_jefe, appat_jefe, apmat_jefe, boleta, correo, codigo_jefe, id_grupo, id_escuela) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, appat, apmat, boleta, correo, codigo_jefe, grupoId, idEscuela ]
    );

    // Eliminar el token usado
    tokenStore.delete(token);

    res.json({ success: true, message: 'Registro completado exitosamente' });

  } catch (err) {
    console.error("Error al registrar jefe:", err);
    res.json({ success: false, message: 'Error al registrar jefe' });
  }
});


// =================== CARGA MASIVA DESDE CSV (CORREGIDO) ===================

app.post('/csv/profesores', async (req, res) => {
    const profesores = req.body;

    // Verificar que `id_escuela` está disponible en la sesión
    const idEscuela = req.session.id_escuela;
    if (!idEscuela) {
        console.error('id_escuela no está disponible en la sesión');
        return res.status(400).json({ success: false, message: 'id_escuela no está disponible en la sesión' });
    }

    console.log("id_escuela:", idEscuela);  // Para confirmar que la escuela está bien asignada

    try {
        for (let profe of profesores) {
            // Verifica los datos antes de insertarlos
            console.log("Datos del profesor:", profe);

            // Asegúrate de que los campos necesarios no estén vacíos
            if (!profe.nom_persona || !profe.appat_persona || !profe.correo) {
                console.error("Datos incompletos para el profesor:", profe);
                return res.status(400).json({ success: false, message: 'Datos incompletos para el profesor' });
            }

            // Insertar en la base de datos
            await conexion.promise().query(
                'INSERT INTO persona (nom_persona, appat_persona, apmat_persona, correo, id_rol, id_escuela) VALUES (?, ?, ?, ?, 1, ?)',
                [profe.nom_persona, profe.appat_persona, profe.apmat_persona || '', profe.correo, idEscuela]
            );
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error al insertar profesores CSV:', error);
        res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }
});

// ruta empresa para el no de escuelas

app.get('/api/numero-escuelas', async (req, res) => {
    try {
        const [result] = await conexion.promise().query('SELECT COUNT(*) AS total FROM escuela');
        const totalEscuelas = result[0].total;
        res.json({ totalEscuelas });
    } catch (error) {
        console.error('Error al obtener el número de escuelas:', error);
        res.status(500).json({ message: 'Error al obtener el número de escuelas' });
    }
});




app.post('/verificar-codigo-jefe', async (req, res) => {
    let idEscuela = req.session.id_escuela;

    if (!req.session.loggedin) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const { codigo_jefe, id_grupo, id_horario, validacion_falta } = req.body;
    const validacion_asistencia = 0; // Asumimos que la asistencia es válida
    const validacion_retardo = 0; // Asumimos que el retardo es

    console.log("OTP recibido para falta:", codigo_jefe);
    console.log("ID de grupo recibido para falta:", id_grupo);
    console.log("ID de horario recibido para falta:", id_horario);

   const [resultados] = await conexion.promise().query('SELECT codigo_jefe FROM jefegrupo WHERE id_grupo = ?', [id_grupo]);
console.log("Código de jefe encontrado en la base de datos:", resultados);

// Verificar si hay resultados y extraer el código
if (resultados.length === 0 || resultados[0].codigo_jefe !== codigo_jefe) {
    return res.status(404).json({ success: false, message: 'Código de jefe no válido.' });
}

    try {
        // Si el OTP es correcto, procedemos a registrar la falta
        // Insertar datos en la tabla falta
 await insertarAsistencia(validacion_asistencia, id_horario, idEscuela);

        // Insertar datos en la tabla retardo
        await insertarRetardo(validacion_retardo, id_horario , idEscuela);

        // Insertar datos en la tabla falta
        await insertarFalta(validacion_falta, id_horario , idEscuela);        
        res.json({ 
            success: true, 
            message: "Falta registrada correctamente."
        });
    } catch (error) {
        console.error('Error al registrar falta después de OTP:', error);
        return res.status(500).json({ success: false, message: 'Error al registrar la falta.' });
    }
});

// --------------------------------  FIN RUTAS FALTAS CON OTP  -------------------------





// CSV materias
app.post('/csv/materias', async (req, res) => {
    const materias = req.body;
    const idEscuela = req.session.id_escuela;

    if (!idEscuela) {
        return res.status(400).json({ success: false, message: 'id_escuela no está disponible en la sesión' });
    }

    try {
        for (let materia of materias) {
            if (!materia.nom_materia || !materia.id_tipomateria) {
                return res.status(400).json({ success: false, message: 'Datos incompletos para la materia' });
            }

            await conexion.promise().query(
                'INSERT INTO materia (nom_materia, id_tipomateria, id_escuela) VALUES (?, ?, ?)',
                [materia.nom_materia, materia.id_tipomateria, idEscuela]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al insertar materias:', error);
        res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }
});


// CSV carreras
app.post('/csv/carreras', async (req, res) => {
    const carreras = req.body;
    const idEscuela = req.session.id_escuela;

    if (!idEscuela) {
        return res.status(400).json({ success: false, message: 'id_escuela no está disponible en la sesión' });
    }

    try {
        for (let carrera of carreras) {
            if (!carrera.nom_carrera) {
                return res.status(400).json({ success: false, message: 'Nombre de carrera faltante' });
            }

            await conexion.promise().query(
                'INSERT INTO carrera (nom_carrera, id_escuela) VALUES (?, ?)',
                [carrera.nom_carrera, idEscuela]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al insertar carreras:', error);
        res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }
});

// CSV grupos
app.post('/csv/grupos', async (req, res) => {
    const grupos = req.body;
    const idEscuela = req.session.id_escuela;

    if (!idEscuela) {
        return res.status(400).json({ success: false, message: 'id_escuela no está disponible en la sesión' });
    }

    try {
        for (let grupo of grupos) {
            if (!grupo.nom_grupo || !grupo.semestre || !grupo.id_carrera) {
                return res.status(400).json({ success: false, message: 'Datos incompletos para el grupo' });
            }

            await conexion.promise().query(
                'INSERT INTO grupo (nom_grupo, semestre, id_carrera, id_escuela) VALUES (?, ?, ?, ?)',
                [grupo.nom_grupo, grupo.semestre, grupo.id_carrera, idEscuela]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al insertar grupos:', error);
        res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }
});

// csv salones
app.post('/csv/salones', async (req, res) => {
    const salones = req.body;
    const idEscuela = req.session.id_escuela;

    if (!idEscuela) {
        return res.status(400).json({ success: false, message: 'id_escuela no está disponible en la sesión' });
    }

    try {
        for (let salon of salones) {
            if (!salon.nom_salon || !salon.capacidad) {
                return res.status(400).json({ success: false, message: 'Datos incompletos para el salón' });
            }

            await conexion.promise().query(
                'INSERT INTO salon (nom_salon, id_escuela) VALUES (?, ?, ?)',
                [salon.nom_salon, idEscuela]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error al insertar salones:', error);
        res.status(500).json({ success: false, message: 'Error en la base de datos' });
    }
});

app.post('/csv/horarios-nombres', async (req, res) => {
  try {
    const idEscuela = req.session.id_escuela;
    const bodyBuffer = await getRawBody(req);
    const body = bodyBuffer.toString('utf8');

    const lines = body.split('\n').filter(line => line.trim() !== '');
    let erroresFormato = [];
    const rows = [];

    // Detectar separador
    const separadorDetectado = body.includes('\t') ? '\t' : body.includes(',') ? ',' : null;

    if (!separadorDetectado) {
    return res.status(400).json({
        success: false,
        message: "El archivo no tiene un formato válido. No se detectaron separadores (comas o tabulaciones).",
        detalles: []
    });
    }

    lines.slice(1).forEach((line, index) => {
    const filaNum = index + 2;
    const parts = line.split(separadorDetectado).map(p => p.trim().replace(/^"|"$/g, ''));

    if (parts.length === 0 || parts.every(p => p === '')) {
        erroresFormato.push(`Fila ${filaNum}: fila vacía.`);
        return;
    }

    if (parts.length < 7) {
        erroresFormato.push(`Fila ${filaNum}: se esperaban 7 columnas, pero se encontraron solo ${parts.length}.`);
        return;
    }

    if (parts.length > 7) {
        erroresFormato.push(`Fila ${filaNum}: se esperaban 7 columnas, pero se encontraron ${parts.length}.`);
        return;
    }

    rows.push({
        fila: filaNum,
        dia_horario: parts[0],
        grupo: parts[1],
        materia: parts[2],
        profesor: parts[3],
        salon: parts[4],
        hora_inicio: parts[5],
        hora_final: parts[6]
    });
    });

    if (erroresFormato.length > 0) {
    return res.status(400).json({
        success: false,
        message: "El archivo tiene errores de formato. Revisa los detalles para corregirlos.",
        detalles: erroresFormato
    });
    }


// Si hay errores de formato, detener inmediatamente
if (erroresFormato.length > 0) {
  return res.status(400).json({
    success: false,
    message: "El archivo CSV no tiene el formato correcto. Asegúrate de usar comas (,) como separadores y que tenga 7 columnas por fila.",
    detalles: erroresFormato
  });
}


    let registrosInsertados = 0;
    let errores = [];

    for (const r of rows) {
      let errorFila = [];

      const [[grupo]] = await conexion.promise().query(
        'SELECT id_grupo FROM grupo WHERE TRIM(nom_grupo) LIKE ? AND id_escuela = ?',
        [`%${r.grupo}%`, idEscuela]
      );
      if (!grupo) errorFila.push("grupo no encontrado");

      const [[materia]] = await conexion.promise().query(
        'SELECT id_materia FROM materia WHERE TRIM(nom_materia) LIKE ? AND id_escuela = ?',
        [`%${r.materia}%`, idEscuela]
      );
      if (!materia) errorFila.push("materia no encontrada");

      const [[persona]] = await conexion.promise().query(
        `SELECT id_persona FROM persona 
         WHERE TRIM(CONCAT(nom_persona, ' ', appat_persona, ' ', apmat_persona)) LIKE ?
         AND id_escuela = ?`,
        [`%${r.profesor}%`, idEscuela]
      );
      if (!persona) errorFila.push("profesor no encontrado");

      const [[salon]] = await conexion.promise().query(
        'SELECT id_salon FROM salon WHERE TRIM(nom_salon) LIKE ? AND id_escuela = ?',
        [`%${r.salon}%`, idEscuela]
      );
      if (!salon) errorFila.push("salón no encontrado");

      if (errorFila.length > 0) {
        errores.push(`Fila ${r.fila}: ${errorFila.join(', ')}`);
        continue;
      }

      try {
        const [result] = await conexion.promise().query(
          `INSERT INTO horario 
           (dia_horario, hora_inicio, hora_final, id_salon, id_grupo, id_materia, id_persona, id_contenedor, id_escuela)
           VALUES (?, ?, ?, ?, ?, ?, ?, 2, ?)`,
          [
            r.dia_horario,
            r.hora_inicio,
            r.hora_final,
            salon.id_salon,
            grupo.id_grupo,
            materia.id_materia,
            persona.id_persona,
            idEscuela
          ]
        );

        if (result.affectedRows > 0) {
          registrosInsertados++;
        } else {
          errores.push(`Fila ${r.fila}: no se insertó por motivo desconocido`);
        }

      } catch (error) {
        errores.push(`Fila ${r.fila}: error de inserción (${error.message})`);
      }
    }

    if (registrosInsertados === 0) {
      return res.status(400).json({
        success: false,
        message: "No se insertó ningún horario.",
        detalles: errores
      });
    }

    return res.json({
      success: true,
      message: `Carga completa. Se insertaron ${registrosInsertados} horario(s).`,
      errores: errores
    });

  } catch (error) {
    console.error('❌ Error general al procesar CSV:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al procesar el archivo CSV.'
    });
  }
});

// ------Fin de csv



//------ IA ---------

app.get('/api/predicciones', async (req, res) => {
    const idEscuela = req.session.id_escuela;

    const query = `
        SELECT 
            p.id_persona,
            CONCAT(p.nom_persona, ' ', p.appat_persona) AS persona,
            h.dia_horario,
            h.hora_inicio,
            h.hora_final,
           DATE_FORMAT(pr.fecha_prediccion, '%Y-%m-%d') AS fecha_prediccion,
            pr.resultado_prediccion,
            m.nom_materia,
            g.nom_grupo
        FROM 
            predicciones AS pr
            JOIN persona AS p ON pr.id_persona = p.id_persona
            JOIN horario AS h ON pr.id_horario = h.id_horario
            join materia AS m ON h.id_materia = m.id_materia
            JOIN grupo AS g ON h.id_grupo = g.id_grupo
        WHERE 
            pr.id_escuela = ?
            AND DATE(pr.fecha_prediccion) = CURDATE()
        ORDER BY 
            resultado_prediccion DESC, 
            h.dia_horario, 
            h.hora_inicio
    `;

    try {
        const [results] = await conexion.promise().query(query, [idEscuela]);

        res.status(200).json({
            success: true,
            data: results,
            message: results.length > 0 ? 'Predicciones obtenidas correctamente' : 'No hay predicciones para hoy',
            count: results.length
        });

    } catch (err) {
        console.error('Error al obtener predicciones:', err);
        res.status(500).json({
            success: false,
            data: null,
            message: 'Error en el servidor al consultar predicciones',
            error: err.message
        });
    }
});

// ------ Fin IA ---------








app.listen(app.get("port"), () => {
    console.log(`PUERTO:`, app.get("port"));
    console.log(`Server en http://localhost:${app.get("port")}`);
});


