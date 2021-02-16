const http = require('http');
const defaultFactory = require('./factory/defaultFactory');

class API {
    static DEFAULT_HEADERS = {
        'Content-Type': 'application/json'
    }

    constructor(dependencies = defaultFactory()) {
        this.carService = dependencies.carService;
    }

    getRoutes = () => {
        return {
            '/rent:post': async (request, response) => {
                
                for await (const data of request) {
                    try { 
                        const { customer, carCategory, numberOfDays } = JSON.parse(data);

                        if(!customer || !carCategory || !numberOfDays) {
                            throw new Error('Empty fields: check your inputs');
                        }
    
                        const result = await this.carService.rent(customer, carCategory, numberOfDays);
    
                        response.writeHead(200, API.DEFAULT_HEADERS);
    
                        response.write(JSON.stringify({ result }));

                        response.end();
                    } catch(err) {
                        console.log('error', err);
                        response.writeHead(500, API.DEFAULT_HEADERS);
                        response.write(JSON.stringify({ error: "Something went wrong"}))
                        response.end();
                    }
                }
            },
            '/finalPrice:post': async(request, response) => {
                for await (const data of request) {
                    try { 
                        const { customer, carCategory, numberOfDays } = JSON.parse(data);

                        if(!customer || !carCategory || !numberOfDays) {
                            throw new Error('Empty fields: check your inputs');
                        }
    
                        const result = await this.carService.calculateFinalPrice(customer, carCategory, numberOfDays);
    
                        response.writeHead(200, API.DEFAULT_HEADERS);
    
                        response.write(JSON.stringify({ result }));

                        response.end();
                    } catch(err) {
                        console.log('error', err);
                        response.writeHead(500, API.DEFAULT_HEADERS);
                        response.write(JSON.stringify({ error: "Something went wrong"}))
                        response.end();
                    }
                }
            },
            '/getAvaiableCar:post': async(request, response) => {
                for await (const data of request) {
                    try {
                        const { carCategory } = JSON.parse(data);

                        if(!carCategory) {
                            throw new Error('Empty fields: no carCategory on input');
                        }

                        const result = await this.carService.getAvaiableCar(carCategory);

                        response.writeHead(200, API.DEFAULT_HEADERS);

                        response.write(JSON.stringify({ result }));

                        response.end()

                    } catch (err) {
                        console.log('error', err);
                        response.writeHead(500, API.DEFAULT_HEADERS);
                        response.write(JSON.stringify({ error: "Something went wrong"}))
                        response.end();
                    }
                }
            }
        }
    }

    handler = (request, response) => {
        const { url, method } = request;
        const routeKey = `${url}:${method.toLowerCase()}`;

        const routes = this.getRoutes()
        const chosen = routes[routeKey] || routes.default

        response.writeHead(200, API.DEFAULT_HEADERS)

        return chosen(request, response)
    }

    init = (port = 3000) => {
        const app = http.createServer(this.handler).listen(port, () => {
            console.log("App running at ", port)
        })

        return app;
    }
}

if (process.env.NODE_ENV !== 'test') {
    const api = new API()
    api.init()
}

module.exports = (dependencies) => new API(dependencies);