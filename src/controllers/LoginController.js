const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const database = require('../database/database');
const moment = require('moment');
const logger = require('../logger/logger');

exports.login = async (req, res) => {
    try {
        var erro = req.flash('erro');
        erro = (erro == undefined || erro.length == 0) ? undefined : erro;
        res.render('login/index', { erro: erro });
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 12 loginController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};

exports.authenticate = async (req, res) => {
    try {
        var email = req.body.email;
        var senha = req.body.senha;
        var erro;
        var sucesso;
        database.where({ email: email, senha: senha }).table('empresa').then(dados => {
            database.where({ id_empresa: dados[0].id }).table('licenca').then(licenca => {
                console.log(licenca);
                var data_licenca_final = licenca[0].data_final.toLocaleDateString('pt-BR', { timeZone: 'UTC' });;
                var liberado = licenca[0].liberado;

                var data = new Date();
                var data_atual = data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                var diff = moment(data_licenca_final, 'DD/MM/YYYY').diff(moment(data_atual, 'DD/MM/YYYY'));
                var dias_falta = moment.duration(diff).asDays();
                dias_falta +=1;
                logger.info('dias para acabar a licença ' + dias_falta);

                if (dias_falta < 0) {
                    database.where({ id_empresa: dados[0].id }).update({ 'liberado': 'NAO' }).table('licenca').then(erro => {
                        erro = 'Atenção sua licença foi expirado, entre em contato com o suporte!';
                        req.flash('erro', erro);
                        res.render('login/index', { erro: erro });
                    });
                } else {
                    database.where({ id_empresa: dados[0].id }).table('licenca').then(liberado => {
                        var liberacao = liberado[0].liberado;                      
                        if(liberacao == 'SIM'){
                            database.where({ id: dados[0].id }).update({ 'dias_falta': dias_falta}).table('empresa').then(() => {
                                if (dados[0].email == email && dados[0].senha == senha) {
                                    sucesso = 'Bem vindo(a) ' + dados[0].nome_empresa;
                                    req.session.user = {
                                        id: dados[0].id,
                                        session: dados[0].session,
                                        nome_empresa: dados[0].nome_empresa,
                                        email: dados[0].email,
                                        token: dados[0].token,
                                        cnpj: dados[0].cnpj,
                                        apitoken: dados[0].apitoken,
                                        servidor: dados[0].servidor,
                                        ip: dados[0].ip,
                                        dias_falta: dados[0].dias_falta
                    
                                    };
                                    logger.info('Usuario autenticado com sucesso ' + dados[0].id + ' | ' + dados[0].nome_empresa + ' | ' + dados[0].cnpj + ' | ' + dados[0].email + ' | ' + dados[0].servidor + ' | ' + dados[0].session + ' | ' + dados[0].ip)
                                    var erro = req.flash('erro');                             
                                    sucesso = (sucesso == undefined || sucesso.length == 0) ? undefined : sucesso; 
                                    erro = (erro == undefined || erro.length == 0) ? undefined : erro; 
                                    res.render('index', {sucesso: sucesso, erro: erro, dias_falta: dias_falta});
                                    
                                } else {
                                    erro = 'Email ou senha incorretos!';
                                    logger.error(erro);
                                    req.flash('erro', erro);
                                    res.redirect('/login');
                                }
                            });                            
                        }else{
                            erro = 'Atenção sua licença foi expirado, entre em contato com o suporte!';
                            logger.error(erro);
                            req.flash('erro', erro);
                            res.render('login/index', { erro: erro });
                        }
                    });                    
                }
            });
            
        }).catch(erro => {
            erro = 'Email ou senha incorretos!';
            req.flash('erro', erro);
            logger.error(erro);
            res.redirect('/login');
        });
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 53 loginController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};

exports.logoof = async (req, res) => {
    try {
        req.session.user = undefined;
        res.redirect('/login');
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 64 loginController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};


