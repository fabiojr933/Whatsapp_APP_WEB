const express  = require('express');
const app = express();

const flash = require('express-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
const adminAuth = require('./src/middlewares/adminAuth');

const WhatsappController = require('./src/controllers/whatsappController');
const EmpresaController = require('./src/controllers/CompanyController');
const LoginController = require('./src/controllers/LoginController');


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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
    
    res.render('index', {sucesso: sucesso});
});
app.use('/', WhatsappController);
app.use('/', EmpresaController);
app.use('/', LoginController);

app.listen(3000, (req, res) => {
    console.log('Servidor ativo');
})