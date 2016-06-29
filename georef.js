// example usage:
//
// curl -v \
//      -F 'image=@test.tiff' \
//      -F 'points=[{ "imgX": 83, "imgY": 754, "geoX": -0.11243820190429688, "geoY": 51.52178189877856 },{ "imgX": 262, "imgY": 261, "geoX": -0.11057138442993164, "geoY": 51.525052857123434 },{ "imgX": 594, "imgY": 685, "geoX": -0.10698795318603516, "geoY": 51.522182436913845 }]' \
// localhost:3000/georeference

const FS = require('fs')
const ChildProcess = require('child_process')
const Express = require('express')
const Multer = require('multer')

const app = Express()
const upload = Multer({ dest: 'data/' })

app.post('/georeference', upload.single('image'), function (request, response) {
    try {
        const points = JSON.parse(request.body.points)
        if (points.length < 3) throw new Error('not enough points')
        georeference(request.file.path, points, (e, filepath) => {
            if (e) throw e
            const filedata = new Buffer(FS.readFileSync(filepath)).toString('base64')
            response.status(200).send(filedata)
        })
    }
    catch (e) {
        response.status(500).send(e.message)
    }
})

app.listen(3030)

function georeference(filepath, points, callback) {
    const control = points.map(point => `-gcp ${point.imgX} ${point.imgY} ${point.geoX} ${point.geoY}`).join(' ')
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
