// example usage:
//
// curl -v \
//      -F 'image=@test.tiff' \
//      -F 'points=[{ "tileX": 83, "tileY": 754, "geoX": -0.11243820190429688, "geoY": 51.52178189877856 },{ "tileX": 262, "tileY": 261, "geoX": -0.11057138442993164, "geoY": 51.525052857123434 },{ "tileX": 594, "tileY": 685, "geoX": -0.10698795318603516, "geoY": 51.522182436913845 }]' \
// localhost:3000/georesolve

const ChildProcess = require('child_process')
const Express = require('express')
const Multer = require('multer')

const app = Express()
const upload = Multer({ dest: 'data/' })

app.post('/georesolve', upload.single('image'), function (request, response) {
    try {
        const points = JSON.parse(request.body.points)
        if (points.length < 3) throw new Error('not enough points')
        georesolve(request.file.path, points, (e, filepath) => {
            if (e) throw e
            else response.download(filepath, request.file.originalname.replace('.tiff', '-georef.tiff'))
        })
    }
    catch (e) {
        response.status(500).send(e.message)
    }
})

app.listen(3000)

function georesolve(filepath, points, callback) {
    const control = points.map(point => `-gcp ${point.tileX} ${point.tileY} ${point.geoX} ${point.geoY}`).join(' ')
    const translateCommand = `gdal_translate -of GTiff -a_srs EPSG:4326 ${control} ${filepath} ${filepath}-geo`
    ChildProcess.exec(translateCommand, e => {
        if (e) callback(e)
        const warpCommand = `gdalwarp ${filepath}-geo ${filepath}-geo-warped` // -dstalpha
        ChildProcess.exec(warpCommand, e => {
            if (e) callback(e)
            else callback(null, filepath + '-geo-warped')
        })
    })
}
