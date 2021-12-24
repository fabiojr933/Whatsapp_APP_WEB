const { json } = require("body-parser");
const express = require("express");
const router = express.Router();
const database = require('../database/database');

router.get('/login', (req, res) => {
    var erro = req.flash('erro');
    erro = (erro == undefined || erro.length == 0) ? undefined : erro;

    res.render('login/index', { erro: erro });
});
router.post('/authrnticate', (req, res) => {
    var email = req.body.email;
    var senha = req.body.senha;
    var erro;
    var sucesso;

    database.where({ email: email, senha: senha }).table('empresa').then(dados => {
        if (dados[0].email == email && dados[0].senha == senha) {
            sucesso = 'Bem vindo(a) ' + dados[0].nome_empresa;
            req.session.user = {
                id: dados[0].id,
                nome_empresa: dados[0].nome_empresa,
                email: dados[0].email,
                token: dados[0].token,
                cnpj: dados[0].cnpj,
                apitoken: dados[0].apitoken,
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
});
router.get('/logoof', (req, res) => {
    console.log('aqi');
    req.session.user = undefined;
    res.redirect('/login');
});
module.exports = router;