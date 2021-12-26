const fs = require('fs');
const util = require('util');

class Read{
    constructor(){
        this.read = util.promisify(fs.readFile);
    }
    
    async Read(file){
      try {
        return await this.read(file, {encoding: 'utf-8'});
      } catch (error) {
          return undefined;
      }
    }
}
module.exports = Read;