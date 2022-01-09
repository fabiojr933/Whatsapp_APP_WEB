const database = require('../database/database');

module.exports = {
    async deleteId(id) {
       database.where({id: id}).delete().table('empresa').then(sucesso => {
            console.log('deletado com suvesso ' + sucesso);
       }).catch(erro => {
        logger.error(erro);
            console.log(erro);
       });
    },

    async create(dados) {
        database.insert(dados).into('empresa').then(sucesso => {        
        }).catch(err => {
            logger.error(err);
            console.log(err);
        })
    },
    async update(dados, id){
        console.log(dados, id);
        database.where({id: id}).update(dados).table('empresa').then(sucesso => {       
        }).catch(erro => {
            logger.error(erro);
            console.log(erro);
        });
    }
}


