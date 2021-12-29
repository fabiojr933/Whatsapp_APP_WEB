const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');
const companyController = require('../controllers/CompanyController');
const loginController = require('../controllers/LoginController');

// rota company (empresas)
router.get('/company', adminAuth, companyController.company_list);
router.get('/company/new', adminAuth, companyController.company_new);
router.get('/company/edit/:id', adminAuth, companyController.company_update);
router.post('/company/new', adminAuth, companyController.company_new2);
router.post('/company/delete/:id', adminAuth, companyController.company_delete_id);
router.post('/company/update', adminAuth, companyController.company_update2);


//rota login

router.get('/login', loginController.login);
router.post('/authenticate', loginController.authenticate);
router.get('/logoof', loginController.logoof);
module.exports = router;