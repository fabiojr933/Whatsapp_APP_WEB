const express = require('express');
const router = express.Router();
const companyModel = require('../models/CompanyModel');

// Routas www.empresa/(router)/.com
router.get('/company', (req, res) => {
    res.render('company/index');
});
router.get('/company/new', (req, res) => {
    res.render('company/new');
});


// router delete, get, post, put
router.post('/company/new', (req, res) => {
    var {nome_empresa, email, senha, cnpj} =  req.body;  
    var dados = [{
        nome_empresa: nome_empresa,
        email: email,
        senha: senha,
        cnpj: cnpj
    }]; 
    companyModel.create(dados);   
    res.redirect('/company');
});
module.exports = router;