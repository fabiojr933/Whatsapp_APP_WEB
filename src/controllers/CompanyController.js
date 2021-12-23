const express = require('express');
const router = express.Router();


router.get('/company', (req, res) => {
    res.render('company/index');
});
router.get('/company/new', (req, res) => {
    res.render('company/new');
});

module.exports = router;