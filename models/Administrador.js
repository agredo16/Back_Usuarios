class Administrador {
    constructor(db) {
      this.collection = db.collection('administradores');
    }
  
    async crear(adminData) {
      const nuevoAdmin = {
        ...adminData,
        fechaRegistro: new Date(),
        permisos: adminData.permisos || ['ver_usuarios', 'editar_usuarios']
      };
      return await this.collection.insertOne(nuevoAdmin);
    }
  
    async obtenerPorId(userId) {
      return await this.collection.findOne({ userId });
    }
  }
  
  module.exports = Administrador;