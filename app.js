const express = require('express');
const { connectDB } = require('./config/bdClient');
const usuarioRoutes = require('./routers/usuarioRoutes');
const Usuario = require('./models/Usuario');
const Cliente = require('./models/Cliente');
const Laboratorista = require('./models/Laboratorista');
const Administrador = require('./models/Administrador');
const SuperAdmin = require('./models/SuperAdmin');
const UsuarioController = require('./controllers/usuarioController');


const cors = require('cors');
const app = express();
app.use(express.json());

app.use(cors());
async function iniciarServidor() {
  const db = await connectDB();
  
  // Inicializar todos los modelos
  const usuarioModel = new Usuario(db);
  const clienteModel = new Cliente(db);
  const labModel = new Laboratorista(db);
  const adminModel = new Administrador(db);
  const superAdminModel = new SuperAdmin(db);
  
  // Inicializar controlador con todos los modelos
  const usuarioController = new UsuarioController(
    usuarioModel,
    clienteModel,
    labModel,
    adminModel,
    superAdminModel
  );
  
  // Configurar rutas
  app.use('/api/usuarios', usuarioRoutes(usuarioController));
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
}

iniciarServidor().catch(console.error);