const fs = require('fs');
const util = require('util');
const logger = require('../logger/logger');

class Read{
    constructor(){
        this.read = util.promisify(fs.readFile);
    }
    
    async Read(file){
      try {
        return await this.read(file, {encoding: 'utf-8'});
      } catch (error) {
        logger.error(error);
          return undefined;
      }
    }
}
module.exports = Read;