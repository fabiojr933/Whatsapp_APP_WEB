const express  = require('express');
const app = express();

const flash = require('express-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
const adminAuth = require('./src/middlewares/adminAuth');
const winston = require('winston');
const logger = require('./src/logger/logger');

const Route = require('./src/routes/routes');
const whatsappController = require('./src/controllers/whatsappController');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 3000000}
}));
app.use(flash());

app.get('/', adminAuth, (req, res) => {
    var sucesso = req.flash('sucesso');
    sucesso = (sucesso == undefined || sucesso.length == 0) ? undefined : sucesso; 
    var erro = req.flash('erro');
    erro = (erro == undefined || erro.length == 0) ? undefined : erro; 
    var dias_falta = req.session.user.dias_falta
    res.render('index', {sucesso: sucesso, erro: erro, dias_falta: dias_falta});
});
app.use('/', Route);
app.use('/', whatsappController);


app.listen(3333, (req, res) => {
    logger.info('Servidor inicializado');
})