const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const upload = require('../middlewares/upload');
const Read = require('../middlewares/Read');
const online = require('../middlewares/online');
const Process = require('../middlewares/Process');
const database = require('../database/database');
const fs = require('fs');
const axios = require('axios');
const logger = require('../logger/logger');




router.get('/whatsapp/session', adminAuth, online, (req, res) => {
  try {
    var cnpj = req.session.user.cnpj;
    database.select(['apitoken', 'servidor', 'session', 'webhook']).where({ 'cnpj': cnpj }).table('empresa').then(dados_empresa => {
      var apitoken = dados_empresa[0].apitoken;
      var server = dados_empresa[0].servidor;
      var session = dados_empresa[0].session;
      var webhook = dados_empresa[0].webhook;
      res.render('whatsapp/session', { apitoken_empresa: apitoken, server_empresa: server, session_empresa: session, webhook_empresa: webhook });
    });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 25 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/import', adminAuth, online, (req, res) => {
  try {
    var erro = req.flash('erro');
    var sucesso = req.flash('sucesso');
    erro = erro == undefined || erro.length == 0 ? undefined : erro;
    sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;
    res.render('whatsapp/import', { erro: erro, sucesso: sucesso });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 38 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/status', adminAuth, online, (req, res) => {
  try {
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
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 88 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/session/logout', adminAuth, online, (req, res) => {
  try {
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
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 135 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/contact/search', adminAuth, online, (req, res) => {
  try {
    var sucesso = req.flash('sucesso');
    sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;
    database.select('*').table('contato').then(dados => {
      res.render('whatsapp/contact', { sucesso: sucesso, dados: dados });
    }).catch(err => {
      erro = 'Ops! ocorreu algum problema ao importar os contatos \n para mais detelhe mais entre em contato com o suporte tecnico';
      req.flash('erro', erro);
      res.redirect('/whatsapp/contact/search');
    });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 152 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/contact/import', adminAuth, online, (req, res) => {
  try {
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
          logger.error(er);
          console.log(er);
          res.redirect('/');
        });
      }
    }).catch(erro => {
      erro = 'Ops! ocorreu algum problema ao importar os contatos \n para mais detelhe mais entre em contato com o suporte tecnico';
      req.flash('erro', erro);
      logger.error(erro);
      res.redirect('/whatsapp/status_off', { erro: erro });
    });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 218 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/send', adminAuth, online, async (req, res) => {
  try {
    var erro;
    var sucesso;
    var cod_mensagem = parseInt(req.body.codigo_mensagem);
    var cpf_cnpj_empresa = req.session.user.cnpj;
    var cpf_cnpj_empresa_ant = req.body.cpf_cnpj_empresa;
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
                logger.error(err);
                console.log(err);
              });
            }
          }
        }).catch(err => {
          console.log('Ops ocorreu algum erro chame o suporte tecnico ' + err);
          erro = 'Não foi possivel encontrar a mensagem, operação não será concluida \n chame o suporte tecnico para mais detalhe';
          req.flash('erro', erro);
          logger.error(err);
          res.redirect('/whatsapp/import');
        });
      }).catch(err => {
        erro = 'Não foi possivel encontrar a mensagem, operação não será concluida \n chame o suporte tecnico para mais detalhe';
        req.flash('erro', erro);
        logger.error(err);
        res.redirect('/whatsapp/import');
      });
      sucesso = 'Mensagem esta sendo enviada para seu cliente, este processo pode demorar um pouco....';
      req.flash('sucesso', sucesso);
      res.redirect('/whatsapp/import');
    }
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 310 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/import/arquivo', adminAuth, online, upload.single('arquivo'), async (req, res) => {
  try {
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
            console.log(sucesso);
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
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 356 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/contact/edit/:id', adminAuth, online, (req, res) => {
  try {
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
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 378 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/contact/update', adminAuth, online, (req, res) => {
  try {
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
        logger.error(erro);
        res.redirect('/whatsapp/contact/search');
      });
    }
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 406 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/contact/delete', adminAuth, online, (req, res) => {
  try {
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
          logger.error(err);
          res.redirect('/whatsapp/contact/search');
        });
    }
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 433 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/send/contact', adminAuth, online, (req, res) => {
  try {
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
      logger.error(erro);
      res.redirect('/whatsapp/contact/send');
    });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 454 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/send/contact', adminAuth, online, (req, res) => {
  try {
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
            logger.error(err);
            console.log(err);
          })
        } catch (error) {
          erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
          req.flash('erro', erro);
          logger.error(error);
          res.redirect('/');
        }
      });
    }).catch(erro => {
      logger.error(erro);
      console.log(erro);
    });
    sucesso = (sucesso == undefined || sucesso == '' || sucesso.length == 0) ? undefined : sucesso;
    erro = (erro == undefined || erro == '' || erro.length == 0) ? undefined : erro;
    database.select('*').table('contato').then(dados => {
      sucesso = 'Mensagem esta sendo enviada para seu cliente, este processo pode demorar um pouco....';
      req.flash('sucesso', sucesso);
      res.render('whatsapp/contact/send', { erro: erro, sucesso: sucesso, dados: dados });
    }).catch(erro => {
      erro = 'Ops! ocorreu algum problema, para mais detelhe mais entre em contato com o suporte tecnico';
      req.flash('erro', erro);
      logger.error(erro);
      res.redirect('/whatsapp/contact/send');
    });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 521 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/import/archive', adminAuth, online, (req, res) => {
  try {
    var erro = req.flash('erro');
    var sucesso = req.flash('sucesso');
    erro = erro == undefined || erro.length == 0 ? undefined : erro;
    sucesso = sucesso == undefined || sucesso.length == 0 || sucesso == '' ? undefined : sucesso;
    res.render('whatsapp/import_image', { erro: erro, sucesso: sucesso });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 534 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/import/arquivo_archive', adminAuth, online, upload.array('arquivo'), async (req, res) => {
  try {
    var arquivos = req.files;
    var erro;
    var mensagem = req.body.mensagem;
    var codigo_mensagem_ultimo;

    arquivos.forEach(arq => {
      if (arq.mimetype == 'text/csv' || arq.mimetype == 'application/vnd.ms-excel') {
        var rows = [];
        fs.readFile(arq.path, 'utf8', function (err, data) {
          if (err) {
            console.log(err);
            return;
          } else {
            var a = data.split('\r\n');
            a.forEach(row => {
              var arr = row.split(';');
              rows.push(arr);
            });
          }
          var dados_header = rows[0];
          var sms = 'MENSAGEM';
          dados_header.unshift(sms);
          rows.shift();
          rows.pop();
          //  cpf_cnpj_empresa = rows[0][4];
          rows.forEach(element => {
            element.unshift(mensagem);
          });
          var codigo_mensagem = 0;
          database('mensagem').max('codigo_mensagem').then(total => {
            if (total[0].max == '' || total[0].max == undefined || isNaN(total[0].max)) {
              codigo_mensagem = 1;
            } else {
              codigo_mensagem = parseInt(total[0].max + 1);
              codigo_mensagem_ultimo += codigo_mensagem;
            }
            for (const [mensagem, cliente, telefone, empresa, codigo_cliente] of rows) {
              database.insert({ codigo_mensagem: codigo_mensagem, codigo_cliente: codigo_cliente, cliente: cliente, mensagem: mensagem, telefone: telefone, empresa: empresa }).into('mensagem').then(sucesso => {
                database('mensagem').max('codigo_mensagem').then(maxino => {
                  arquivos.forEach(image => {
                    if (image.mimetype == 'image/png' || image.mimetype == 'image/jpg' || image.mimetype == 'image/jpeg') {
                      var image_caminho = image.path;
                      var image_nome = image.filename;
                      var servidor = req.session.user.ip;
                      var caminho = image_caminho = (servidor + '/upload/' + image_nome);
                      //  caminho = caminho.join(',');

                      database.insert({ 'caminho_imagem': caminho, 'codigo_mensagem': maxino[0].max, 'telefone': telefone }).table('imagem').then(dados => {
                      });
                    }
                  });
                })
              }).catch(err => {
                console.error(err);
                erro = 'Erro ao gravar as informações do arquivo .CSV, para o banco de dados \n entre em contato com o suporte para mais informação';
                req.flash('erro', erro);
                logger.error(err);
                res.redirect('/whatsapp/import/arquivo_archive');
              });
            }
          });
        });
      }
    });
    setTimeout(() => {
      database('mensagem').max('codigo_mensagem').then(maxino => {
        database.select('*').table('mensagem').where({ 'codigo_mensagem': maxino[0].max }).then(dados => {
          console.log('image gravado com sucesso');
          res.render('whatsapp/send_archive', { dados: dados, codigo_mensagem: maxino[0].max });
        });
      });
    }, 2000);
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 613 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/send_archive2', adminAuth, online, async (req, res) => {
  try {
    var id_mensagem = req.body.codigo_mensagem;
    var empresa = req.session.user.cnpj;
    database.select(['nome_empresa', 'servidor', 'session', 'senha']).where({ 'cnpj': empresa }).table('empresa').then(dados_empresa => {
      console.log(dados_empresa[0].session);
      database.select('*').where({ 'codigo_mensagem': id_mensagem }).table('imagem').then(dados_mensagem => {


        /**
         * Aqui começa enviar a image
         */
        dados_mensagem.forEach(dado => {
          var data = {
            "session": dados_empresa[0].session,
            "number": "55" + dado.telefone,
            "caption": "",
            "path": dado.caminho_imagem
          }
          try {
            var config = {
              method: "POST",
              url: dados_empresa[0].servidor + "/sendImage",
              headers: {
                "sessionkey": dados_empresa[0].session,
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + dados_empresa[0].apitoken,
              },
              data: JSON.stringify(data)
            };
            axios(config).then(response => {
              console.log('entrou no response');
              if (response.data.result != 200) {
                erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
                req.flash('erro', erro);
                res.redirect('/whatsapp/import');
              }
            }).catch(err => {
              logger.error(err);
              console.log('Erro ----------------------------------------------   ' + err);
            })
          } catch (error) {
            erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', error);
            logger.error(error);
            res.redirect('/');
          }
        });
        /**
       * Fim do envio da image
       */

        //começa a envio da mensagem
        database.select(['mensagem', 'telefone', 'cliente', 'empresa']).where({ 'codigo_mensagem': id_mensagem }).table('mensagem').then(mensagem => {
          mensagem.forEach(dados_mensagem => {
            console.log(dados_mensagem);
            var data = {
              "session": dados_empresa[0].session,
              "number": "55" + dados_mensagem.telefone,
              "text": dados_mensagem.cliente + ' ' + dados_mensagem.mensagem + ' ' + dados_mensagem.empresa
            }
            try {
              var config = {
                method: "POST",
                url: dados_empresa[0].servidor + "/sendText",
                headers: {
                  "sessionkey": dados_empresa[0].session,
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + dados_empresa[0].senha,
                },
                data: JSON.stringify(data)
              };
              axios(config).then(response => {
                if (response.data.result != 200) {
                  erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
                  req.flash('erro', erro);
                  res.redirect('/whatsapp/import/arquivo_archive');
                }
              }).catch(err => {
                logger.error(err);
                console.log('Erro ----------------------------------------------   ' + err);
              })
            } catch (error) {
              erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
              req.flash('erro', erro);
              logger.error(error);
              res.redirect('/whatsapp/import/arquivo_archive');
            }
          });
        });
      });
    });
    sucesso = 'Mensagem esta sendo enviada para seu cliente, este processo pode demorar um pouco....';
    req.flash('sucesso', sucesso);
    res.redirect('/whatsapp/import/archive');
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 710 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/import/charge', adminAuth, online, (req, res) => {
  try {
    var erro = req.flash('erro');
    var sucesso = req.flash('sucesso');
    erro = erro == undefined || erro.length == 0 ? undefined : erro;
    sucesso = sucesso == undefined || sucesso.length == 0 ? undefined : sucesso;
    res.render('whatsapp/cobranca/import', { erro: erro, sucesso: sucesso });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 723 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/charge/import', adminAuth, upload.single('arquivo'), async (req, res) => {
  try {
    var arquivos = req.file;
    var erro;
    var mensagem = req.body.mensagem;
    var codigo_mensagem_ultimo;
    if (arquivos.mimetype == 'text/csv' || arquivos.mimetype == 'application/vnd.ms-excel') {
      var rows = [];
      database('cobranca').max('codigo_cobranca').then(maxino => {
        var codigo_cobranca = parseInt(maxino[0].max);
        if (codigo_cobranca == undefined || codigo_cobranca == '' || isNaN(codigo_cobranca)) {
          codigo_cobranca = parseInt(1);
        } else {
          codigo_cobranca = parseInt(codigo_cobranca + 1);
        }
        console.log(codigo_cobranca);
        fs.readFile(arquivos.path, 'utf8', function (err, data) {
          if (err) {
            console.log(err);
            return;
          } else {
            var a = data.split('\r\n');
            a.shift();
            a.pop();
            a.forEach(row => {
              var arr = row.split(';');
              rows.push(arr);
            });
          }

          rows.forEach(dados => {
            database.insert({ codigo_empresa: dados[0], cliente: dados[1], valor_pendente: dados[2], nome_cliente: dados[3], telefone: dados[4], empresa: dados[5], codigo_cobranca: codigo_cobranca }).into('cobranca').then(sucesso => {

            }).catch(err => {
              console.error(err);
              erro = 'Erro ao gravar as informações do arquivo .CSV, para o banco de dados \n entre em contato com o suporte para mais informação';
              req.flash('erro', erro);
              logger.error(err);
              res.redirect('/whatsapp/import/charge');
            });
          });
        });
        setTimeout(function () {
          database.select('*').where({ codigo_cobranca: codigo_cobranca }).table('cobranca').then(dados => {
            res.render('whatsapp/cobranca/index', { dados: dados, codigo_cobranca: codigo_cobranca });
          });
        }, 1000);
      });

    } else {
      erro = 'Arquivo com fornato invalido tem que esta no formato .CSV \n entre em contato com o suporte para mais informação';
      req.flash('erro', erro);
      res.redirect('/whatsapp/import/charge');
    }
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 781 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/send/charge', adminAuth, online, async (req, res) => {
  try {
    var codigo_cobranca = req.body.codigo_cobranca;
    var empresa = req.session.user.cnpj;
    database.select('*').where({ codigo_cobranca: codigo_cobranca }).table('cobranca').then(dados => {
      database.select(['nome_empresa', 'servidor', 'session']).where({ 'cnpj': empresa }).table('empresa').then(dados_empresa => {
        for (const item of dados.values()) {
          var data = {
            'session': dados_empresa[0].session,
            'number': '55' + item.telefone,
            'text': 'PREZADO SR.(A) ' + item.nome_cliente + ' NOSSO REGISTRO CONSTA O SEGUINTE VALOR EM ABERTO R$ ' + item.valor_pendente + ' SOLICITAMOS QUE ENTRE EM CONTATO CONOSCO ' + dados_empresa[0].nome_empresa
          };
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
                res.redirect('/whatsapp/import/charge');
              }
            });
          } catch (error) {
            logger.error(error);
            erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            res.redirect('/whatsapp/import/charge');
          }
        };
      }).catch(err => {
        erro = 'Não foi possivel buscar dados da empresa \n entre em contato com o suporte para mais informação';
        req.flash('erro', erro);
        logger.error(err);
        res.redirect('/whatsapp/import/charge');
      });

    }).catch(err => {
      erro = 'Erro ao enviar mensagem \n entre em contato com o suporte para mais informação';
      req.flash('erro', erro);
      logger.error(err);
      res.redirect('/whatsapp/import/charge');
    });
    sucesso = 'Mensagem esta sendo enviada para seu cliente, este processo pode demorar um pouco....';
    req.flash('sucesso', sucesso);
    res.redirect('/whatsapp/import/charge');
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 836 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.get('/whatsapp/send/contact2', adminAuth, online, (req, res) => {
  try {
    var erro = req.flash('erro');
    var sucesso = req.flash('sucesso');
    erro = erro == undefined || erro.length == 0 ? undefined : erro;
    sucesso = sucesso == undefined || sucesso.length == 0 ? undefined : sucesso;
    database.select('*').table('contato').then(dados => {
      res.render('whatsapp/contact/index_contact', { erro: erro, sucesso: sucesso, dados: dados })
    });
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 852 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
router.post('/whatsapp/send/contact2', adminAuth, online, upload.array('imagem'), async (req, res) => {
  try {
    var arquivo = req.files;
    console.log(req.body.imagem);
    var erro, sucesso;
    var { contato, mensagem } = req.body;
    console.log(contato);
    JSON.stringify(contato, null, 2);
    var resultado = [];
    contato.forEach(contact => {
      r = contact.split('|');
      resultado.push({ nome: r[0], telefone: r[1], cnpj: r[2] });
    })
    var cnpj = req.session.user.cnpj;
    database.select('*').where({ cnpj: `${cnpj}` }).table('empresa').then(dados_empresa => {
      resultado.forEach(dados => {
        var data = {
          'session': dados_empresa[0].session,
          'number': '55' + dados.telefone,
          'text': dados.nome + ' ' + mensagem + ' ' + dados_empresa[0].nome_empresa
        }
        try {
          var config = {
            method: 'POST',
            url: dados_empresa[0].servidor + '/sendText',
            headers: {
              "sessionkey": dados_empresa[0].session,
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + dados_empresa[0].apitoken
            },
            data: JSON.stringify(data),
          }
          axios(config).then(response => {
            if (response.data.result != 200) {
              erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
              req.flash('erro', erro);
              res.redirect('/whatsapp/send/contact2');
            }
          })
        } catch (error) {
          if (response.data.result != 200) {
            erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
            req.flash('erro', erro);
            logger.error(error);
            res.redirect('/whatsapp/send/contact2');
          }
        }
      });
    });



    // Enviando as imagem 
    database.select('*').where({ cnpj: `${cnpj}` }).table('empresa').then(dados_empresa => {
      arquivo.forEach(image => {

        /**
          * Aqui começa enviar a image
          */
        resultado.forEach(dado => {
          arquivo.forEach(image => {

            console.log(dado);
            var data = {
              "session": dados_empresa[0].session,
              "number": "55" + dado.telefone,
              "caption": "",
              "path": dados_empresa[0].ip + '/upload/' + image.filename
            }
            try {
              var config = {
                method: "POST",
                url: dados_empresa[0].servidor + "/sendImage",
                headers: {
                  "sessionkey": dados_empresa[0].session,
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ' + dados_empresa[0].apitoken,
                },
                data: JSON.stringify(data)
              };
              axios(config).then(response => {
                console.log('entrou no response');
                if (response.data.result != 200 || response.data.result != 500) {
                  erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
                  req.flash('erro', erro);
                  res.redirect('/whatsapp/send/contact2');
                }
              }).catch(err => {
                logger.error(err);
                console.log('Erro ----------------------------------------------   ' + err);
              })
            } catch (error) {
              erro = 'Não foi possivel enviar as mensagem, servidor não esta respondendo \n chame o suporte tecnico para mais detalhe';
              req.flash('erro', error);
              res.redirect('/whatsapp/send/contact2');
            }
          });
        });
      });
    });
    sucesso = 'Mensagem esta sendo enviada para seu cliente, este processo pode demorar um pouco....';
    req.flash('sucesso', sucesso);
    res.redirect('/whatsapp/send/contact2');
  } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 958 whatsappController';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
  }
});
module.exports = router;