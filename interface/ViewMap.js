var ViewMap = React.createClass({

    getInitialState: function () {
        return {
            geoAdding: false,
            geoPoints: [],
            imgAdding: false,
            imgPoints: []
        }
    },

    componentWillMount: function () {
        this.setState({ loading: true })
        var reader = new FileReader()
        reader.addEventListener('load', function () {
            var image = new Image()
            image.src = reader.result
            image.addEventListener('load', function () {
                this.setState({
                    loading: false,
                    imageSource: reader.result,
                    imageW: image.width,
                    imageH: image.height
                })
            }.bind(this))
        }.bind(this))
        reader.readAsDataURL(this.props.image)
    },

    points: function() {
        var length = this.state.imgPoints.length < this.state.geoPoints.length
            ? this.state.imgPoints.length
            : this.state.geoPoints.length
        return this.state.imgPoints.slice(0, length).map(function (point, i) {
            return {
                imgLng: point.lng,
                imgLat: point.lat,
                geoLng: this.state.geoPoints[i].lng,
                geoLat: this.state.geoPoints[i].lat
            }
        }.bind(this))
    },

    run: function () {
        if (this.state.imgAdding || this.state.geoAdding) return this.setState({ error: 'Finish adding points first' })
        var points = this.points()
        if (points.length < 3) return this.setState({ error: 'You must select at least 3 points' })
        this.setState({ loading: true })
        const querystring = document.location.href.split('?')[1]
        const query = querystring ? Qs.parse(querystring) : {}
        var http = new XMLHttpRequest()
        http.open('POST', '/georeference', true)
        var data = new FormData()
        data.append('image', this.props.image)
        data.append('points', JSON.stringify(points))
        if (query.id) data.append('id', query.id)
        http.addEventListener('load', function () {
            this.setState({ loading: false })
            if (http.status >= 400) this.setState({ error: http.responseText })
            else {
                const response = JSON.parse(http.response)
                this.props.setOutput(response.result || true, response.format, response.resultUploaded, response.nextLocation)
            }
        }.bind(this))
        http.send(data)
    },

    addPoint: function () {
        this.setState({ imgAdding: true, geoAdding: true })
    },

    removePoint: function (number) {
        return function () {
            var geoPointsNew = this.state.geoPoints.filter(function (_, i) { return i !== number })
            var imgPointsNew = this.state.imgPoints.filter(function (_, i) { return i !== number })
            this.setState({ geoPoints: geoPointsNew, imgPoints: imgPointsNew })
        }.bind(this)
    },

    render: function () {
        if (this.state.loading) {
            var loading = React.DOM.span({ className: 'loading' }, 'Loading...')
            return React.DOM.div({ className: 'view-map' }, loading)
        }
        else {
            var mapImg = React.createElement(Map, {
                className: 'img map',
                imageSource: this.state.imageSource,
                imageW: this.state.imageW,
                imageH: this.state.imageH,
                points: this.state.imgPoints,
                isAdding: function () { return this.state.imgAdding }.bind(this),
                addPoint: function (point) { this.setState({ imgPoints: this.state.imgPoints.concat(point), imgAdding: false }) }.bind(this)
            })
            var mapGeo = React.createElement(Map, {
                className: 'geo map',
                location: this.props.location,
                points: this.state.geoPoints,
                isAdding: function () { return this.state.geoAdding }.bind(this),
                addPoint: function (point) { this.setState({ geoPoints: this.state.geoPoints.concat(point), geoAdding: false }) }.bind(this)
            })
            var error = this.state.error ? React.DOM.span({ className: 'error' }, this.state.error) : ''
            var isAdding = this.state.geoAdding || this.state.imgAdding
            var addPointButton = React.DOM.button({ onClick: this.addPoint, disabled: isAdding }, 'Add point')
            var runButton = React.DOM.button({ onClick: this.run }, 'Run')
            var top = React.DOM.div({ className: 'top' }, error, addPointButton, runButton)
            var points = this.points().map(function (point, i) {
                var number = React.DOM.span({ className: 'number' }, '#' + (i + 1))
                var coordsLat = 'Lat: ' + Math.round(point.geoLat * 10000) / 10000
                var coordsLng = 'Lng: ' + Math.round(point.geoLng * 10000) / 10000
                var coords = React.DOM.span({ className: 'coords' }, coordsLat, React.DOM.br(), coordsLng)
                var remove = React.DOM.span({ className: 'remove', onClick: this.removePoint(i) }, '×')
                return React.DOM.li({ className: 'number-' + (i + 1) }, number, coords, remove)
            }.bind(this))
            var bottom = React.DOM.ol({ className: 'bottom' }, points)
            return React.DOM.div({ className: 'view-map' }, top, mapImg, mapGeo, bottom)
        }
    }

})
