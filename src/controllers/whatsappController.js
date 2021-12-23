const express = require('express');
const router = express.Router();


router.get('/whatsapp/session', (req, res) => {
    res.render('whatsapp/session');
});

module.exports = router;