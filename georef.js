const FS = require('fs')
const ChildProcess = require('child_process')
const Express = require('express')
const Multer = require('multer')

const app = Express()
const upload = Multer({ dest: 'data/' })

app.post('/georeference', upload.single('image'), (request, response) => {
    const points = JSON.parse(request.body.points)
    if (points.length < 3) response.status(400).send('not enough points')
    georeference(request.file.path, points, (e, data) => {
        if (e) response.status(500).send(e.message)
        response.status(200).send(data)
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
