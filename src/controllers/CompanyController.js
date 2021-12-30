const express = require('express');
const flash = require('express-flash');
const database = require('../database/database');
const companyModel = require('../models/CompanyModel');


// router para get e getAll
exports.company_list = async (req, res) => {
    var erro = req.flash('erro');
    var sucesso = req.flash('sucesso');
    erro = (erro == undefined || erro.length == 0) ? undefined : erro;
    sucesso = (sucesso == undefined || sucesso.length == 0) ? undefined : sucesso;
    database.select('*').table('empresa').then(dados => {
        res.render('company/index', { erro: erro, sucesso: sucesso, dados: dados });
    }).catch(erro => {
        console.log(erro);
    });
}

exports.company_new = async (req, res) => {
    res.render('company/new');
};

exports.company_update = async (req, res) => {
    var id = parseInt(req.params.id);
    if(id == undefined || id == '' || isNaN(id)){
        var erro = 'Erro ao buscar empresa, chame o suporte tecnico';
        req.flash('erro', erro);
        res.redirect('/company');
    }
    database.where({id : id}).select('*').table('empresa').then(dados => {       
        console.log(dados[0].nome_empresa);
        res.render('company/edit', {dados: dados});
    }).catch(erro => {
        var erro = 'Erro ao buscar empresa, chame o suporte tecnico';
        req.flash('erro', erro);
        res.redirect('/company');
    }); 
};

exports.company_new2 = async (req, res) => {
    var { nome_empresa, email, senha, cnpj, servidor, apitoken, session, webhook, via_importacao, via_banco_dados } = req.body;
    var erro = 'Ops aconteceu algum erro, ao salvar os dados, chama o suporte tecnico';
    var suscesso = 'Dados salvo com sucesso';
    if (via_importacao == 'on') {
        via_importacao = 'sim';
    }
    if (via_importacao == undefined) {
        via_importacao = 'nao';
    }
    if (via_banco_dados == 'on') {
        via_banco_dados = 'sim';
    }
    if (via_banco_dados == undefined) {
        via_banco_dados = 'nao';
    }
    cnpj = parseInt(cnpj);
    var dados = [{
        nome_empresa: nome_empresa,
        email: email,
        senha: senha,
        cnpj: cnpj,
        servidor: servidor,
        apitoken: apitoken,
        session: session,
        webhook: webhook,
        via_importacao: via_importacao,
        via_banco_dados: via_banco_dados
    }]; 
    try {
        companyModel.create(dados);
        req.flash('sucesso', suscesso);
    } catch (error) {
        req.flash('erro', erro);
    }
    res.redirect('/company');
};

exports.company_delete_id = async (req, res) => {
    var id = parseInt(req.params.id);
    var erro;
    var sucesso;

    if (id == undefined || id == '' || isNaN(id)) {
        erro = 'Selecione uma empresa para deletar ';
        req.flash('erro', erro);
        res.redirect('/company');
    } else {
        companyModel.deleteId(id);
        sucesso = 'Empresa deletado com sucesso';
        req.flash('sucesso', sucesso);
        res.redirect('/company');
    }
};

exports.company_update2 = async (req, res) => {
    var erro = 'Erro ao atualizar empresa, chame o suporte tecnico';
    var sucesso = 'Empresa atualizado com sucesso';
    var { id, nome_empresa, email, senha, cnpj, servidor, apitoken, session, webhook, via_importacao, via_banco_dados } = req.body;   

    if (via_importacao == 'on') {
        via_importacao = 'sim';
    }
    if (via_importacao == undefined) {
        via_importacao = 'nao';
    }
    if (via_banco_dados == 'on') {
        via_banco_dados = 'sim';
    }
    if (via_banco_dados == undefined) {
        via_banco_dados = 'nao';
    }

    var dados = {
        nome_empresa: nome_empresa,
        email: email,
        senha: senha,
        cnpj: cnpj,
        servidor: servidor,
        apitoken: apitoken,
        session: session,
        webhook: webhook,
        via_importacao: via_importacao,
        via_banco_dados: via_banco_dados
    };  
    try {
        companyModel.update(dados, id);
        req.flash('sucesso', sucesso);
        res.redirect('/company');
    } catch (error) {
        req.flash('erro', erro);
        res.redirect('/company');
    }
};