const multer = require('multer');

module.exports = (multer ({
    storage: multer.diskStorage({
        destination: (req, file, cd) => {
            cd(null, './public/upload');
        }, 
        filename: (req, file, cd) =>{
            cd(null, Date.now() + file.originalname);
        }
    })
}));