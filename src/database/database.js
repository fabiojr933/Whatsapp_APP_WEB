const knex = require('knex')({
  client: 'pg',
  version: '9.5',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'postgres',
    database : 'whatsapp'
  }
});
module.exports = knex;