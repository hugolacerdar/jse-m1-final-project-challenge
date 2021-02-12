const Base = require('./base/base');

class Car extends Base {
    constructor({ id, name, releaseYear, avaiable, gasAvailable }) {
        super({ id, name });
        
        this.releaseYear = releaseYear;
        this.avaiable = avaiable;
        this.gasAvailable = gasAvailable;
    }
}

module.exports = Car;