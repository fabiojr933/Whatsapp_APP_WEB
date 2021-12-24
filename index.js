const express  = require('express');
const app = express();

const flash = require('express-flash');
const bodyParser = require('body-parser');
const session = require('express-session');

const WhatsappController = require('./src/controllers/whatsappController');
const EmpresaController = require('./src/controllers/CompanyController');
const LoginController = require('./src/controllers/LoginController');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 30000}
}));
app.use(flash());

app.get('/', (req, res) => {
    res.render('index');
});
app.use('/', WhatsappController);
app.use('/', EmpresaController);
app.use('/', LoginController);

app.listen(3000, (req, res) => {
    console.log('Servidor ativo');
})