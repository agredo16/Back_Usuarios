class Cliente{
    constructor(db){
        this.collection = db.collection('clientes');
    }

    async crear (clienteData){
        const nuevoCliente ={
            ...clienteData,
            fechaRegistro: new Date()
        };
        return await this.collection.insertOne(nuevoCliente);
    }
}

module.exports = Cliente;