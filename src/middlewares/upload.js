const multer = require('multer');
const logger = require('../logger/logger');

module.exports = (multer ({
    storage: multer.diskStorage({
        destination: (req, file, cd) => {
            cd(null, './public/upload');
        }, 
        filename: (req, file, cd) =>{          
          try {
            cd(null, Date.now() + file.originalname);
          } catch (error) {
            var erro = 'Ocorreu algum erro tempo de execução do codigo linha 12 {middlewares} function multer';
            req.flash('erro', erro);
            logger.error(error);
            res.redirect('/');
          }
        }
    })
}));