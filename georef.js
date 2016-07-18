const FS = require('fs')
const ChildProcess = require('child_process')
const Express = require('express')
const Multer = require('multer')
const Request = require('request')
const FormData = require('form-data')
const Config = require('./config.json')

const app = Express()
const recieve = Multer({
    dest: 'data/',
    fileFilter: (_, file, callback) => callback(null, file.mimetype.startsWith('image/')),
    limits: { fileSize: 25000000 }
})

app.post('/georeference', recieve.single('image'), (request, response) => {
    const points = JSON.parse(request.body.points)
    if (points.length < 3) response.status(400).send('not enough points')
    georeference(request.file.path, points, (e, result) => {
        if (e) response.status(500).send(e.message)
        else if (request.body.id && Config.uploadLocation) {
            upload(request.body.id, result, e => {
                if (e) response.status(500).send(e.message)
                else response.status(200).send({ result, resultUploaded: true, nextLocation: Config.nextLocation })
            })
        }
        else response.status(200).send({ result, resultUploaded: false, nextLocation: Config.nextLocation })
    })
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
            const filename = filepath + '-geo-warped'
            const filedata = new Buffer(FS.readFileSync(filename)).toString('base64')
            callback(null, filedata)
        })
    })
    tidy()
}

function tidy() {
    FS.readdir('data/', (e, files) => {
        if (e) console.error(e.stack)
        files.forEach(filename => {
            FS.stat('data/' + filename, (e, file) => {
                if (e) console.error(e.stack)
                const minutesAgoCreated = (new Date() - new Date(file.birthtime)) / 1000 / 60
                if (minutesAgoCreated > 60) FS.unlink('data/' + filename)
            })
        })
    })
}

function upload(id, data, callback) {
    const url = Config.uploadLocation + id
    const form = new FormData()
    form.append('image', data)
    Request.post({ url, form }, (e, response) => {
        if (e) callback(e)
        else callback(null, response)
    })
}
