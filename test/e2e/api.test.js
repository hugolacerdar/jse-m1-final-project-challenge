const { describe, it, before } = require("mocha");
const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const CarService = require('./../../src/service/carService');

const mocks = {
    validCar: require('./../mocks/valid-car.json'),
    validCarCategory: require('./../mocks/valid-carCategory.json'),
    validCustomer: require('./../mocks/valid-customer.json')
}

describe('E2E API Test Suite', () => {

    let app = {};
    let sandbox = {};
  
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    before(() => {
        const api = require('./../../src/api');
        const carService = new CarService({ cars: './../../database/cars.json'});

        const instance = api({ carService });

        app = {
            instance,
            server: instance.init(3001)
        };

    });


    describe('/finalPrice:post', () => {
        it('should calculate the final price given car category, customer and number of days', async () => {
            
            const car = { ...mocks.validCar };
            const customer = {
                ...mocks.validCustomer,
                age: 50
            };
            const carCategory = {
                ...mocks.validCarCategory,
                price: 37.60
            };
            const numberOfDays = 5;
            
            const body = {
                customer,
                carCategory,
                numberOfDays
            };

            sandbox.stub(
                app.instance.carService.carRepository,
                app.instance.carService.carRepository.find.name
            ).resolves(car);

            const expected = {
                result: app.instance.carService.currencyFormat.format(244.40)
            };

            const response = await request(app.server)
                .post('/finalPrice')
                .send(body)
                .expect(200);

            expect(response.body).to.be.deep.equal(expected);
        })
    });

    describe('/getAvaiableCar:post', () => {
        it('should return an avaiable car given a car category', async () => {
            
            const car = {
                ...mocks.validCar
            };
            const carCategory = {
                ...mocks.validCarCategory,
                carIds: [car.id]
            };

            sandbox.stub(
                app.instance.carService.carRepository,
                app.instance.carService.carRepository.find.name
            ).resolves(car);

            const expected = {
                result: car
            }

            const response = await request(app.server)
                .post('/getAvaiableCar')
                .send({ carCategory })
                .expect(200);
                
            expect(response.body).to.be.deep.equal(expected);
        })
    });

    describe('/rent:post', () => {
        it('should return a transaction receipt given a customer, a car category and a number of days', async () => {
            const car = {
                ...mocks.validCar
            }
            const customer = {
                ...mocks.validCustomer,
                age: 20
            }
            const carCategory = {
                ...mocks.validCarCategory,
                price: 37.60,
                carIds: [car.id]
            };

            const numberOfDays = 5;

            const expectedPrice = app.instance.carService.currencyFormat.format(206.8);
            const dueDate = '10 de novembro de 2020';

            const body = {
                customer,
                carCategory,
                numberOfDays
            };

            const now = new Date(2020, 10, 5);
            sandbox.useFakeTimers(now.getTime())

            sandbox.stub(
                app.instance.carService.carRepository,
                app.instance.carService.carRepository.find.name
            ).resolves(car);

            const expected = {
                result: {
                    customer, 
                    car,
                    amount: expectedPrice,
                    dueDate
                }
            };

            const response = await request(app.server)
                .post('/rent')
                .send(body)
                .expect(200)

            expect(JSON.stringify(response.body)).to.be.deep.equal(JSON.stringify(expected));
        })
    });
})