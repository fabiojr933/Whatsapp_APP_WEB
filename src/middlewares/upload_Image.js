const multer_image = require('multer');
const logger = require('../logger/logger');

module.exports = (multer_image ({
    storage: multer_image.diskStorage({
        destination: (req, file, cd) => {
            cd(null, './public/upload/image');
        }, 
        filename: (req, file, cd) =>{
            cd(null, Date.now() + file.originalname);
        }
    })
}));