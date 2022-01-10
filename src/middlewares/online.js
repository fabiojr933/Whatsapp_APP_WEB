const logger = require('../logger/logger');
const database = require('../database/database');
const axios = require('axios');

function online(req, res, next){
    try {       
        var cnpj = req.session.user.cnpj;
        database.select('*').where({ 'cnpj': cnpj }).table('empresa').then(dados => {
          var nome_empresa = dados[0].nome_empresa;
          var cnpj_empresa = dados[0].cnpj;
          var session_empresa = dados[0].session;
          var servidor_empresa = dados[0].servidor;
          if (session_empresa != undefined || session_empresa != '') {
            var data = {
                'session': session_empresa
              }
              var config = {
                method: 'POST',
                url: servidor_empresa + '/SessionState',
                headers: {
                  'sessionkey': session_empresa
                },
                data: data
              }
              axios(config).then(response => {
                if (response.data.status == 'inChat') {
                    next();
                }
              }).catch(erro => {
                var status = 'Off-line';
                erro = 'Atenção sua sessão esta off-line, seu celular não esta conectado';
                logger.info(erro);
                var dias_falta = req.session.user.dias_falta
                res.render('whatsapp/status_off', { erro: erro, nome_empresa: nome_empresa, cnpj_empresa: cnpj_empresa, status: status, dias_falta: dias_falta});
              });
          } else { 
            erro = 'Atenção sua sessão esta off-line, seu celular não esta conectado';
            req.flash('erro', erro);
            res.redirect('/');
          }
        });
      } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 88 whatsappController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
      }
}
module.exports = online;