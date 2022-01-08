const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const database = require('../database/database');

exports.login = async (req, res) => {
    try {
        var erro = req.flash('erro');
        erro = (erro == undefined || erro.length == 0) ? undefined : erro;
        res.render('login/index', { erro: erro });
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 12 loginController';
        req.flash('erro', erro);
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
            console.log(email, senha);
            if (dados[0].email == email && dados[0].senha == senha) {
                sucesso = 'Bem vindo(a) ' + dados[0].nome_empresa;
                req.session.user = {
                    id: dados[0].id,
                    nome_empresa: dados[0].nome_empresa,
                    email: dados[0].email,
                    token: dados[0].token,
                    cnpj: dados[0].cnpj,
                    apitoken: dados[0].apitoken,
                    servidor: dados[0].servidor,
                    ip: dados[0].ip

                };
                req.flash('sucesso', sucesso);
                res.redirect('/');
            } else {
                erro = 'Email ou senha incorretos!';
                req.flash('erro', erro);
                res.redirect('/login');
            }
        }).catch(erro => {
            erro = 'Email ou senha incorretos!';
            req.flash('erro', erro);
            res.redirect('/login');
        });
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 53 loginController';
        req.flash('erro', erro);
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
        res.redirect('/');
    }
};


