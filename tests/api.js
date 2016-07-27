const FS = require('fs')
const Path = require('path')
const Chai = require('chai')
const ChaiHTTP = require('chai-http')
const Georef = require('../georef.js')

Chai.use(ChaiHTTP)

describe('The API', () => {

    const points = [
        { imgLng: 260, imgLat: 744, geoLng: -0.11286735534667967, geoLat: 51.526381199650764 },
        { imgLng: 532, imgLat: 868, geoLng: -0.11014223098754881, geoLat: 51.527115442708700 },
        { imgLng: 636, imgLat: 784, geoLng: -0.10885477066040038, geoLat: 51.526594798852486 }
    ]

    it('should produce a georeferenced image', function (done) {
        this.timeout(5000)
        Chai.request(Georef)
            .post('/georeference')
            .attach('image', FS.readFileSync(Path.resolve(__dirname, 'test.png')), 'test.png')
            .field('points', JSON.stringify(points))
            .end((e, response) => {
                Chai.expect(e).to.be.null
                Chai.expect(response).to.have.status(200)
                done()
            })
    })

})
