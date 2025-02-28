const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 

class UsuarioController {
  constructor(usuarioModel, clienteModel, labModel, adminModel, superAdminModel) {
    this.usuarioModel = usuarioModel;
    this.clienteModel = clienteModel;
    this.labModel = labModel;
    this.adminModel = adminModel;
    this.superAdminModel = superAdminModel;
  }

  async registrar(req, res) {
    try {
      const { email, password, nombre, tipo, documento, telefono, direccion, ...datosEspecificos } = req.body;

      // Verificar si el usuario ya existe
      const existente = await this.usuarioModel.obtenerPorEmail(email);
      if (existente) {
        return res.status(400).json({ error: 'Email ya registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario base
      const usuarioResult = await this.usuarioModel.crear({
        email,
        password: hashedPassword, 
        nombre,
        tipo,
        documento,
        telefono,
        direccion
      });

      // Crear registro específico según el tipo
      let datosAdicionales;
      switch (tipo) {
        case 'cliente':
          datosAdicionales = await this.clienteModel.crear({
            userId: usuarioResult.insertedId,
            ...datosEspecificos
          });
          break;
        case 'laboratorista':
          datosAdicionales = await this.labModel.crear({
            userId: usuarioResult.insertedId,
            ...datosEspecificos
          });
          break;
        case 'administrador':
          datosAdicionales = await this.adminModel.crear({
            userId: usuarioResult.insertedId,
            nivelAcceso: datosEspecificos.nivelAcceso || 1,
            ...datosEspecificos
          });
          break;
        case 'super_admin':
          // Verificar si ya existe un super admin
          const superAdminExistente = await this.superAdminModel.collection.findOne({});
          if (superAdminExistente) {
            await this.usuarioModel.collection.deleteOne({ _id: usuarioResult.insertedId });
            return res.status(400).json({ error: 'Ya existe un Super Administrador' });
          }
          
          datosAdicionales = await this.superAdminModel.crear({
            userId: usuarioResult.insertedId,
            codigoSeguridad: datosEspecificos.codigoSeguridad,
            ...datosEspecificos
          });
          break;
        default:
          return res.status(400).json({ error: 'Tipo de usuario no válido' });
      }

      res.status(201).json({
        mensaje: 'Usuario creado exitosamente',
        usuario: usuarioResult,
        datosAdicionales
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Login de usuario
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar el usuario por email
      const usuario = await this.usuarioModel.obtenerPorEmail(email);
      if (!usuario) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      // Verificar la contraseña
      const contraseñaValida = await bcrypt.compare(password, usuario.password);
      if (!contraseñaValida) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      // Generar un token JWT (opcional)
      const token = jwt.sign({ userId: usuario._id }, 'secreto', { expiresIn: '1h' });

      res.status(200).json({
        mensaje: 'Login exitoso',
        token
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerTodos(req, res) {
    try {
      const usuarios = await this.usuarioModel.collection.find({}).toArray();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const usuario = await this.usuarioModel.obtenerPorId(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Actualizar un usuario
  async actualizar(req, res) {
    try {
      const { password, ...datosActualizados } = req.body;

      // Si se actualiza la contraseña, la hasheamos
      if (password) {
        datosActualizados.password = await bcrypt.hash(password, 10);
      }

      const resultado = await this.usuarioModel.collection.updateOne(
        { _id: req.params.id },
        { $set: datosActualizados }
      );
      if (resultado.matchedCount === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(200).json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Eliminar un usuario
  async eliminar(req, res) {
    try {
      const resultado = await this.usuarioModel.collection.deleteOne({ _id: req.params.id });
      if (resultado.deletedCount === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(200).json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UsuarioController;