const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const upload = require('../middlewares/upload');
const Read = require('../middlewares/Read');
const Process = require('../middlewares/Process');
const database = require('../database/database');
var axios = require('axios');

router.get('/whatsapp/session', adminAuth, (req, res) => {
  var cnpj = req.session.user.cnpj;
  database.select(['apitoken', 'servidor', 'session', 'webhook']).where({ 'cnpj': cnpj }).table('empresa').then(dados_empresa => {    
    var apitoken = dados_empresa[0].apitoken;
    var server = dados_empresa[0].servidor;
    var session = dados_empresa[0].session;
    var webhook = dados_empresa[0].webhook;
    
    res.render('whatsapp/session', {apitoken_empresa: apitoken, server_empresa: server, session_empresa: session, webhook_empresa: webhook});
  });
 
});
router.get('/whatsapp/import', adminAuth, (req, res) => {
  var erro = req.flash('erro');
  var sucesso = req.flash('sucesso');
  erro = erro == undefined || erro.length == 0 ? undefined : erro;
  sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;

  res.render('whatsapp/import', { erro: erro, sucesso: sucesso});
});

router.post('/whatsapp/send', adminAuth, (req, res) => {
  var erro;
  var sucesso;
  var cod_mensagem = parseInt(req.body.codigo_mensagem);
  var cpf_cnpj_empresa = req.body.cpf_cnpj_empresa;
  console.log(cod_mensagem);
  database.select('*').where({ 'codigo_mensagem': cod_mensagem }).table('mensagem').then(dados => {
    database.select(['session', 'servidor']).where({ 'cnpj': cpf_cnpj_empresa }).table('empresa').then(empresa_config => {

      for (const item of dados.values()) {

        var data = {
          'session': empresa_config[0].session,
          'number': '55' + item.telefone,
          'text': item.cliente + ' ' + item.mensagem + ' ' + item.empresa
        }

        var config = {
          method: 'POST',
          url: empresa_config[0].servidor + '/sendText',
          headers: {
            'sessionkey': empresa_config[0].session
          },
          data: data
        };
        axios(config).then(response => {
          console.log(response);
        }).catch(err => {
          console.log(err);
        });
      }

    }).catch(err => {
      console.log('Ops ocorreu algum erro chame o suporte tecnico ' + err);
      erro = 'Ops! mensagem não enviada chame o suporte tecnico';
      req.flash('erro', erro);
      res.redirect('/whatsapp/import');
    });
  }).catch(err => {
    console.log('Ops ocorreu algum erro chame o suporte tecnico ' + err);
    erro = 'Ops! mensagem não enviada chame o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/import');
  });
  sucesso = 'Mensagens enviado com sucesso';
  req.flash('sucesso', sucesso);
  res.redirect('/whatsapp/import');
});


router.post('/whatsapp/import/arquivo', upload.single('arquivo'), async (req, res) => {

  var mensagem = req.body.mensagem
  var erro;

  if (req.file.mimetype == 'text/csv') {
    var leitor = new Read();
    var arquivo = req.file.filename;
    var caminho = req.file.destination;
    var dados = await leitor.Read(caminho + '/' + arquivo);
    var dadosProcessados = Process.Process(dados);
    var dados_header = dadosProcessados[0];
    var sms = 'mensagem';
    dados_header.unshift(sms);
    dadosProcessados.shift();
    dadosProcessados.pop();
    cpf_cnpj_empresa = dadosProcessados[0][4];
    dadosProcessados.forEach(row => {
      row.unshift(mensagem);
    });
    codigo_mensagem = 0;
    database('mensagem').max('codigo_mensagem').then(total => {
      if (total[0].max == '' || total[0].max == undefined || isNaN(total[0].max) || total[0].max == 0) {
        codigo_mensagem = 1;
      } else {
        codigo_mensagem = parseInt(total[0].max) + 1;
      }
      for (const [mensagem, cliente, telefone, empresa, codigo_cliente] of dadosProcessados) {

        database.insert({ codigo_mensagem: codigo_mensagem, codigo_cliente: codigo_cliente, cliente: cliente, mensagem: mensagem, telefone: telefone, empresa: empresa }).into('mensagem').then(sucesso => {

        }).catch(erro => {
          console.log(erro);
        });
      }

      res.render('whatsapp/index', { dados_body: dadosProcessados, dados_Header: dados_header, codigo_mensagem: codigo_mensagem, cpf_cnpj_empresa: cpf_cnpj_empresa });

    });
  } else {
    erro = 'O arquivo selecionado esta com um formatado invalido \n o formato valido é .CSV \n entre em contato com o suporte para mais informação';
    req.flash('erro', erro);
    res.redirect('/whatsapp/import');
  }

});
module.exports = router;