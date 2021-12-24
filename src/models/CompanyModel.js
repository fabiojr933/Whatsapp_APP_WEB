const database = require('../database/database');

module.exports = {
    async index(dados) {
       
    },

    async create(dados) {       
        database.insert(dados).into('empresa').then(sucesso => {
            console.log(sucesso + 'dados inserido com sucesso');
        }).catch(err => {
            console.log(err);
        })       
    },
}