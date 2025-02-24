class SuperAdmin {
    constructor(db) {
      this.collection = db.collection('super_admins');
    }
  
    async crear(superAdminData) {
      const nuevoSuperAdmin = {
        ...superAdminData,
        fechaRegistro: new Date(),
        permisosGlobales: ['crear_admin', 'eliminar_admin', 'configuracion_sistema'],
        registroAcciones: []
      };
      return await this.collection.insertOne(nuevoSuperAdmin);
    }
  
    async registrarAccion(userId, accion) {
      return await this.collection.updateOne(
        { userId },
        {
          $push: {
            registroAcciones: {
              accion,
              fecha: new Date(),
              detalles: `Acción realizada por super admin: ${accion}`
            }
          }
        }
      );
    }
  }
  
  module.exports = SuperAdmin;