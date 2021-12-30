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
    res.render('whatsapp/session', { apitoken_empresa: apitoken, server_empresa: server, session_empresa: session, webhook_empresa: webhook });
  });
});

router.get('/whatsapp/import', adminAuth, (req, res) => {
  var erro = req.flash('erro');
  var sucesso = req.flash('sucesso');
  erro = erro == undefined || erro.length == 0 ? undefined : erro;
  sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;
  res.render('whatsapp/import', { erro: erro, sucesso: sucesso });
});
router.get('/whatsapp/status', (req, res) => {
  var erro = req.flash('erro');
  var sucesso = req.flash('sucesso');
  erro = erro == undefined || erro.length == 0 ? undefined : erro;
  sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;
  var cnpj = req.session.user.cnpj;
  database.select('*').where({ 'cnpj': cnpj }).table('empresa').then(dados => {
    var nome_empresa = dados[0].nome_empresa;
    var cnpj_empresa = dados[0].cnpj;
    var session_empresa = dados[0].session;
    var servidor_empresa = dados[0].servidor;
    if (session_empresa == undefined || session_empresa == '') {
      erro = 'Não foi poossivel encontrar a sessão da empresa \n chame o suporte tecnico para mais detalhe';
      req.flash('erro', erro);
      res.redirect('/', { erro: erro });
    } else {
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
          var status = 'On-line';
          res.render('whatsapp/status', { erro: erro, sucesso: sucesso, nome_empresa: nome_empresa, cnpj_empresa: cnpj_empresa, status: status });
        }
      }).catch(erro => {
        var status = 'Off-line';
        erro = 'Atenção sua sessão esta off-line, seu celular não esta conectado';
        res.render('whatsapp/status_off', { erro: erro, nome_empresa: nome_empresa, cnpj_empresa: cnpj_empresa, status: status });
      });
    }
  }).catch(erro => {
    var status = 'Off-line';
    erro = 'Atenção sua sessão esta off-line, seu celular não esta conectado';
    res.render('whatsapp/status_off', { erro: erro, nome_empresa: nome_empresa, cnpj_empresa: cnpj_empresa, status: status });
  });
});
router.get('/whatsapp/session/logout', (req, res) => {
  var cnpj = req.session.user.cnpj;
  database.select('*').where({ 'cnpj': cnpj }).table('empresa').then(dados => {
    var session_empresa = dados[0].session;
    var servidor_empresa = dados[0].servidor;
    if (session_empresa == undefined || session_empresa == '') {
      erro = 'Não foi poossivel encontrar a sessão da empresa \n chame o suporte tecnico para mais detalhe';
      req.flash('erro', erro);
      res.redirect('/', { erro: erro });
    } else {
      var data = {
        'session': session_empresa
      }
      console.log(data);
      var config = {
        method: 'POST',
        url: servidor_empresa + '/logout',
        headers: {
          'sessionkey': session_empresa
        },
        data: data
      }
      console.log(config);
      axios(config).then(response => {
        console.log(response)
        sucesso = 'Sessão finalizado com sucesso';
        req.flash('sucesso', sucesso);
        res.redirect('/');
      }).catch(erro => {
        erro = 'Não foi poossivel encerrar a sessão da empresa \n chame o suporte tecnico para mais detalhe';
        req.flash('erro', erro);
        console.log(erro);
        res.redirect('/');
      });
    }
  }).catch(erro => {
    erro = 'Não foi poossivel encontrar a sessão da empresa \n chame o suporte tecnico para mais detalhe';
    req.flash('erro', erro);
    res.redirect('/whatsapp/status_off', { erro: erro });
  });
});
router.get('/whatsapp/contact/search', (req, res) => {
  var sucesso = req.flash('sucesso');
  sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;
  database.select('*').table('contato').then(dados => {
    res.render('whatsapp/contact', { sucesso: sucesso, dados: dados });
  }).catch(err => {
    erro = 'Ops! ocorreu algum problema ao importar os contatos \n para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/contact/search');
  });
});
router.get('/whatsapp/contact/import', (req, res) => {
  var cnpj = req.session.user.cnpj;
  database.select('*').where({ 'cnpj': cnpj }).table('empresa').then(dados => {
    var session_empresa = dados[0].session;
    var servidor_empresa = dados[0].servidor;
    if (session_empresa == undefined || session_empresa == '') {
      erro = 'Não foi poossivel encontrar a sessão da empresa \n chame o suporte tecnico para mais detalhe';
      req.flash('erro', erro);
      res.redirect('/', { erro: erro });
    } else {
      var data = {
        'session': session_empresa
      }
      console.log(data);
      var config = {
        method: 'POST',
        url: servidor_empresa + '/getAllContacts',
        headers: {
          'sessionkey': session_empresa
        },
        data: data
      }
      console.log(config);
      axios(config).then(response => {
        response.data.contacts.forEach(dados => {
          var nome = dados.name;
          var telefone = dados.phone.substr(2, 10);
          if (nome != '' || nome == undefined) {
            database.count('telefone').where({ 'telefone': telefone }).table('contato').then(contato => {
              //  console.log(contato[0].count);
              if (contato[0].count == 0) {
                console.log(contato[0].count);
                database.insert({ 'nome': nome, 'telefone': telefone, 'empresa_cnpj': cnpj }).into('contato').then(res => {
                }).catch(err => {
                  erro = 'Ops! ocorreu algum problema ao importar os contatos \n para mais detelhe mais entre em contato com o suporte tecnico';
                  req.flash('erro', erro);
                  console.log(err);
                  res.redirect('/whatsapp/contact/search');
                });
              }
            });
          }
        });
        sucesso = 'Todos os contatos importados com sucesso';
        req.flash('sucesso', sucesso);
        res.redirect('/whatsapp/contact/search');

      }).catch(er => {
        erro = 'Ops! ocorreu algum problema ao importar os contatos \n para mais detelhe mais entre em contato com o suporte tecnico';
        req.flash('erro', erro);
        console.log(er);
        res.redirect('/');
      });
    }
  }).catch(erro => {
    erro = 'Ops! ocorreu algum problema ao importar os contatos \n para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/status_off', { erro: erro });
  });
});
router.post('/whatsapp/send', adminAuth, async (req, res) => {
  var erro;
  var sucesso;
  var cod_mensagem = parseInt(req.body.codigo_mensagem);
  var cpf_cnpj_empresa = req.body.cpf_cnpj_empresa;
  if (cod_mensagem == '' || cod_mensagem == undefined) {
    erro = 'Não foi poossivel encontrar o codigo da mensagem, gerado pelo banco de dados \n chame o suporte tecnico para mais detalhe';
    req.flash('erro', erro);
    res.redirect('/whatsapp/import', { erro: erro });
  }
  if (cpf_cnpj_empresa == '' || cpf_cnpj_empresa == undefined) {
    erro = 'O cnpj ou cpf cadastrado na empresa esta diferente da importação do relatorio \n chame o suporte tecnico para mais detalhe';
    req.flash('erro', erro);
    res.redirect('/whatsapp/import', { erro: erro });
  } else {
    database.select('*').where({ 'codigo_mensagem': cod_mensagem }).table('mensagem').then(dados => {
      database.select(['session', 'servidor']).where({ 'cnpj': cpf_cnpj_empresa }).table('empresa').then(empresa_config => {
        for (const item of dados.values()) {
          var data = {
            'session': empresa_config[0].session,
            'number': '55' + item.telefone,
            'text': item.cliente + ' ' + item.mensagem + ' ' + item.empresa
          }
          if (empresa_config[0].session == undefined || empresa_config[0].session == '') {
            erro = 'Não foi possivel encontrar a sessão, \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import', { erro: erro });
          } if (item.telefone == undefined || item.telefone == '') {
            erro = 'Telefone esta em banco, não foi possivel enviar as mensagem \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import', { erro: erro });
          }
          if (item.cliente == undefined || item.cliente == '') {
            erro = 'Nome do cliente esta em banco, não foi possivel enviar as mensagem \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import', { erro: erro });
          }
          if (item.mensagem == undefined || item.mensagem == '') {
            erro = 'Mensagem esta em banco, não foi possivel enviar as mensagem \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import', { erro: erro });
          }
          if (item.empresa == undefined || item.empresa == '') {
            erro = 'Nome da empresa esta em banco, não foi possivel enviar as mensagem \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import', { erro: erro });
          } else {
            var config = {
              method: 'POST',
              url: empresa_config[0].servidor + '/sendText',
              headers: {
                'sessionkey': empresa_config[0].session
              },
              data: data
            };
            axios(config).then(response => {
              if (response.data.result != 200) {
                erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
                req.flash('erro', erro);
                res.redirect('/whatsapp/import', { erro: erro });
              }
            }).catch(err => {
              console.log(err);
            });
          }
        }
      }).catch(err => {
        console.log('Ops ocorreu algum erro chame o suporte tecnico ' + err);
        erro = 'Não foi possivel encontrar a mensagem, operação não será concluida \n chame o suporte tecnico para mais detalhe';
        req.flash('erro', erro);
        res.redirect('/whatsapp/import');
      });
    }).catch(err => {
      erro = 'Não foi possivel encontrar a mensagem, operação não será concluida \n chame o suporte tecnico para mais detalhe';
      req.flash('erro', erro);
      res.redirect('/whatsapp/import');
    });
    sucesso = 'Mensagens enviado com sucesso';
    req.flash('sucesso', sucesso);
    res.redirect('/whatsapp/import');
  }
});
router.post('/whatsapp/import/arquivo', upload.single('arquivo'), async (req, res) => {
  var mensagem = req.body.mensagem
  var erro;
  if (req.file.mimetype == 'text/csv' || req.file.mimetype == 'application/vnd.ms-excel') {
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
          erro = 'Erro ao gravar as informações do arquivo .CSV, para o banco de dados \n entre em contato com o suporte para mais informação';
          req.flash('erro', erro);
          res.redirect('/whatsapp/import');
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
router.get('/whatsapp/contact/edit/:id', (req, res) => {
  var id = parseInt(req.params.id);
  if (id) {
    database.select('*').table('contato').where({ 'id': id }).then(dados => {
      res.render('whatsapp/contact/edit', { dados: dados });
    }).catch(erro => {
      erro = 'Ops! ocorreu algum problema \n para mais detelhe mais entre em contato com o suporte tecnico';
      req.flash('erro', erro);
      res.redirect('/whatsapp/contact/search');
    });
  } else {
    erro = 'Ops! ocorreu algum problema, para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/contact/search');
  }
});
router.post('/whatsapp/contact/update', (req, res) => {
  var nome = req.body.nome_contato
  var telefone = req.body.telefone;
  var cnpj = req.body.empresa_cnpj;
  var id = req.body.id;

  if (!cnpj || !id) {
    erro = 'Ops! ocorreu algum problema, faltou passar o paramentro cnpj da empresa e id do contato \n para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/contact/search');
  } else {
    database.where({ 'empresa_cnpj': cnpj, 'id': id }).update({ 'nome': nome, 'telefone': telefone }).table('contato').then(sucesso => {
      sucesso = 'Contato atualizado com sucesso';
      req.flash('sucesso', sucesso);
      res.redirect('/whatsapp/contact/search');
    }).catch(erro => {
      erro = 'Ops! ocorreu algum problema, para mais detelhe mais entre em contato com o suporte tecnico';
      req.flash('erro', erro);
      res.redirect('/whatsapp/contact/search');
    });
  }
});
router.post('/whatsapp/contact/delete', (req, res) => {
  var id = req.body.id;
  var empresa_cnpj = req.body.empresa_cnpj;
  if (!id) {
    erro = 'Ops! ocorreu algum problema, faltou passar o paramentro id, para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/contact/search');
  } else {
    var a = database.where(

      { 'id': id }).delete().table('contato').then(sucesso => {
        sucesso = 'Contato deletado com sucesso';
        req.flash('sucesso', sucesso);
        res.redirect('/whatsapp/contact/search');
      }).catch(err => {
        erro = 'Ops! ocorreu algum problema ao deletar o contato, para mais detelhe mais entre em contato com o suporte tecnico';
        req.flash('erro', err);
        res.redirect('/whatsapp/contact/search');
      });
  }
});
router.get('/whatsapp/send/contact', (req, res) => {
  var sucesso;
  var erro;
  sucesso = (sucesso == undefined || sucesso == '' || sucesso.length == 0) ? undefined : sucesso;
  erro = (erro == undefined || erro == '' || erro.length == 0) ? undefined : erro;
  database.select('*').table('contato').then(dados => {
    sucesso = 'Contatos importado com sucesso';
    req.flash('sucesso', sucesso);
    res.render('whatsapp/contact/send', { erro: erro, sucesso: sucesso, dados: dados });
  }).catch(erro => {
    erro = 'Ops! ocorreu algum problema, para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/contact/send');
  });
});
router.post('/whatsapp/send/contact', (req, res) => {
  var erro;
  var sucesso;
  var contato = (req.body.contato);
  var mensagem = req.body.mensagem; 
  JSON.stringify(contato);
  var resultado = [];
  contato.forEach(c => {
    r = c.split('|');
    resultado.push({ nome: r[0], telefone: r[1], cnpj: r[2] });
  });
  var cnpj = req.session.user.cnpj;


  database.select('*').where({ 'cnpj': `${cnpj}` }).table('empresa').then(dados_empresa => { 
    resultado.forEach(dado => {
      var data = {
        'session': dados_empresa[0].session,
        'number': '55' + dado.telefone,
        'text': dado.nome + ' ' + mensagem + ' ' + dados_empresa[0].nome_empresa
      }
      try {
        var config = {
          method: 'POST',
          url: dados_empresa[0].servidor + '/sendText',
          headers: {
            'sessionkey': dados_empresa[0].session
          },
          data: data
        };
        axios(config).then(response => {

          if (response.data.result != 200) {
            erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import');
          }
        }).catch(err => {
          console.log(err);
        })
      } catch (error) {
        erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
        req.flash('erro', erro);
        res.redirect('/');
      }
    });
  }).catch(erro => {
    console.log(erro);
  });
  sucesso = (sucesso == undefined || sucesso == '' || sucesso.length == 0) ? undefined : sucesso;
  erro = (erro == undefined || erro == '' || erro.length == 0) ? undefined : erro;
  database.select('*').table('contato').then(dados => {
    sucesso = 'Mensagem enviada com sucesso';
    req.flash('sucesso', sucesso);
    res.render('whatsapp/contact/send', { erro: erro, sucesso: sucesso, dados: dados });
  }).catch(erro => {
    erro = 'Ops! ocorreu algum problema, para mais detelhe mais entre em contato com o suporte tecnico';
    req.flash('erro', erro);
    res.redirect('/whatsapp/contact/send');
  });
});
module.exports = router;