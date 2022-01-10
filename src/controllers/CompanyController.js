const express = require('express');
const flash = require('express-flash');
const database = require('../database/database');
const companyModel = require('../models/CompanyModel');


// router para get e getAll
exports.company_list = async (req, res) => {
    try {
        var erro = req.flash('erro');
        var sucesso = req.flash('sucesso');
        erro = (erro == undefined || erro.length == 0) ? undefined : erro;
        sucesso = (sucesso == undefined || sucesso.length == 0) ? undefined : sucesso;
        database.select('*').table('empresa').then(dados => {
            var dias_falta = req.session.user.dias_falta
            res.render('company/index', { erro: erro, sucesso: sucesso, dados: dados, dias_falta: dias_falta});
        }).catch(erro => {
            logger.error(erro);
            console.log(erro);
        });
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 20 companyController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
}

exports.company_new = async (req, res) => {
    try {
        var dias_falta = req.session.user.dias_falta
        res.render('company/new', {dias_falta: dias_falta});
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 30 companyController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};

exports.company_update = async (req, res) => {
    try {
        var id = parseInt(req.params.id);
        if (id == undefined || id == '' || isNaN(id)) {
            var erro = 'Erro ao buscar empresa, chame o suporte tecnico';
            req.flash('erro', erro);
            res.redirect('/company');
        }
        database.where({ id: id }).select('*').table('empresa').then(dados => {
            console.log(dados[0].nome_empresa);
            var dias_falta = req.session.user.dias_falta
            res.render('company/edit', { dados: dados, dias_falta: dias_falta});
        }).catch(erro => {
            var erro = 'Erro ao buscar empresa, chame o suporte tecnico';
            req.flash('erro', erro);
            logger.error(erro);
            res.redirect('/company');
        });
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 53 companyController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};

exports.company_new2 = async (req, res) => {
    try {
        var { nome_empresa, email, senha, cnpj, servidor, apitoken, session, webhook, via_importacao, via_banco_dados, ip } = req.body;
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
            via_banco_dados: via_banco_dados,
            ip: ip
        }];
        try {
            companyModel.create(dados);
            req.flash('sucesso', suscesso);
        } catch (error) {
            logger.error(error);
            req.flash('erro', erro);
        }
        res.redirect('/company');
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 98 companyController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};

exports.company_delete_id = async (req, res) => {
    try {
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
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 121 companyController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};

exports.company_update2 = async (req, res) => {
    try {
        var erro = 'Erro ao atualizar empresa, chame o suporte tecnico';
        var sucesso = 'Empresa atualizado com sucesso';
        var { id, nome_empresa, email, senha, cnpj, servidor, apitoken, session, webhook, via_importacao, via_banco_dados, ip } = req.body;

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
            via_banco_dados: via_banco_dados,
            ip: ip
        };
        try {
            companyModel.update(dados, id);
            req.flash('sucesso', sucesso);
            res.redirect('/company');
        } catch (error) {
            req.flash('erro', erro);
            logger.error(error);
            res.redirect('/company');
        }
    } catch (error) {
        var erro = 'Ocorreu algum erro tempo de execução do codigo linha 168 companyController';
        req.flash('erro', erro);
        logger.error(error);
        res.redirect('/');
    }
};