class Usuario{
    constructor(db){
        this.collection = db.collection('usuarios');
    }

    async crear(userData){
        const nuevoUsuario ={
            ...userData,
            fechaCreacion: new Date(),
            activo: true
        };
        return await this.collection.insertOne(nuevoUsuario);
    }

    async obtenetPorId(id){
        return await this.collection.findOne({ _id: id});
    }

    async obtenerPorEmail(email){
        return await this.collection.findOne({ email});
    }
}

module.exports = Usuario;