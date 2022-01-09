const logger = require('../logger/logger');

function adminAuth(req, res, next){
   try {
    if(req.session.user){
        next();
    }else{
        res.redirect('/login');
    }
   } catch (error) {
    var erro = 'Ocorreu algum erro tempo de execução do codigo linha 12 {middlewares} function adminAuth';
    req.flash('erro', erro);
    logger.error(error);
    res.redirect('/');
   }
}
module.exports = adminAuth;