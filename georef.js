const Path = require('path')
const FS = require('fs')
const ChildProcess = require('child_process')
const Express = require('express')
const Multer = require('multer')
const Request = require('request')
const Targz = require('tar.gz')
const Rimraf = require('rimraf')
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
    const format = Config.output === 'tiles' ? 'tar.gz' : 'tiff'
    georeference(request.file.path, points, (e, result) => {
        if (e) response.status(500).send(e.message)
        else if (request.body.id && Config.uploadLocation) {
            upload(request.body.id, result, e => {
                if (e) response.status(500).send(e.message)
                else response.status(200).send({ resultUploaded: true, format, nextLocation: Config.nextLocation })
            })
        }
        else response.status(200).send({ result: result.toString('base64'), resultUploaded: false, format, nextLocation: Config.nextLocation })
    })
})

app.use(Express.static('interface'))

app.use((request, response) => {
    response.status(404).sendFile(Path.join(__dirname, 'interface/404.html'))
})

app.listen(3030)

function georeference(filename, points, callback) {
    const controls = points.map(point => `-gcp ${point.imgLng} ${point.imgLat} ${point.geoLng} ${point.geoLat}`).join(' ')
    const translateName = filename + '-tran'
    const translateCommand = `gdal_translate -of GTiff -a_srs EPSG:4326 ${controls} ${filename} ${translateName}`
    ChildProcess.exec(translateCommand, e => {
        if (e) return callback(e)
        const warpName = translateName + '-warp'
        const warpCommand = `gdalwarp ${translateName} ${warpName}` // -dstalpha
        ChildProcess.exec(warpCommand, e => {
            if (e) return callback(e)
            if (Config.output === 'tiles') tile(warpName, callback)
            else FS.readFile(warpName, (e, data) => {
                if (e) return callback(e)
                callback(null, new Buffer(data))
            })
        })
    })
    tidy()
}

function tile(filename, callback) {
    const tileName = filename + '-tile'
    const tileCommand = `gdal2tiles.py -w none ${filename} ${tileName}`
    ChildProcess.exec(tileCommand, e => {
        if (e) return callback(e)
        const compressName = tileName + '-comp'
        Targz().compress(tileName, compressName, e => {
            if (e) return callback(e)
            FS.readFile(compressName, (e, data) => {
                if (e) return callback(e)
                callback(null, new Buffer(data))
            })
        })
    })
}

function tidy() {
    FS.readdir('data/', (e, files) => {
        if (e) console.error(e.stack)
        files.forEach(filename => {
            FS.stat('data/' + filename, (e, file) => {
                if (e) console.error(e.stack)
                const minutesAgoCreated = (new Date() - new Date(file.birthtime)) / 1000 / 60
                if (minutesAgoCreated > 60) Rimraf('data/' + filename, {}, e => {
                    if (e) console.error(e.stack)
                })
            })
        })
    })
}

function upload(id, data, callback) {
    const request = {
        url: Config.uploadLocation,
        form: {
            id,
            tiles: data
        }
    }
    Request.post(request, (e, response) => {
        if (e) callback(e)
        const body = JSON.parse(response.body)
        if (response.statusCode >= 400) callback(body)
        else callback(null, body)
    })
}

module.exports = app
