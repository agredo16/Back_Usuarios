class Laboratorista {
    constructor(db){
        this.collection = db.collection('laboratoristas');
    }

    async crear(labData){
        const nuevoLab ={
            ...labData,
            fechaRegistro: new Date()
        };
        return await this.collection.insertOne(nuevoLab);
    }
}

module.exports =Laboratorista;