const express = require('express');
const router = express.Router();
const adminAuth = require('../middlewares/adminAuth');


router.get('/whatsapp/session', adminAuth, (req, res) => {
    res.render('whatsapp/session');
});

module.exports = router;