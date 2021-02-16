const CarService = require("../service/carService")

const defaultFactory = () => ({
    carService: new CarService({ cars: './../database/cars.json'})
});

module.exports = defaultFactory;