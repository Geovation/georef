// example usage:
//
// curl -v \
//      -F 'image=@test.tiff' \
//      -F 'points=[{ "imgLng": 83, "imgLat": 754, "geoLng": -0.11243820190429688, "geoLat": 51.52178189877856 },{ "imgLng": 262, "imgLat": 261, "geoLng": -0.11057138442993164, "geoLat": 51.525052857123434 },{ "imgLng": 594, "imgLat": 685, "geoLng": -0.10698795318603516, "geoLat": 51.522182436913845 }]' \
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

app.use(Express.static('interface'))

app.listen(3030)

function georeference(filepath, points, callback) {
    const control = points.map(point => `-gcp ${point.imgLng} ${point.imgLat} ${point.geoLng} ${point.geoLat}`).join(' ')
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
