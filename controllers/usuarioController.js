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
        const { email, password, nombre, tipo, ...datosEspecificos } = req.body;
  
        // Verificar si el usuario ya existe
        const existente = await this.usuarioModel.obtenerPorEmail(email);
        if (existente) {
          return res.status(400).json({ error: 'Email ya registrado' });
        }
  
        // Crear usuario base
        const usuarioResult = await this.usuarioModel.crear({
          email,
          password, // Recuerda hashear la contraseña antes
          nombre,
          tipo
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
              departamento: datosEspecificos.departamento,
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
  }
  
  module.exports = UsuarioController;