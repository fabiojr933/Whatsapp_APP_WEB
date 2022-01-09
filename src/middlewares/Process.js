const logger = require('../logger/logger');

class Processor {
    static Process(data) {
        try {
            var a = data.split('\r\n');
            var rows = [];
            a.forEach(row => {
                var arr = row.split(';');
                rows.push(arr);
            });
            return rows;
        } catch (error) {
            var erro = 'Ocorreu algum erro tempo de execução do codigo linha 12 {middlewares} function Processor';
            req.flash('erro', erro);
            logger.error(error);
            res.redirect('/');
        }
    }
}

module.exports = Processor;