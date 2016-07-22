var Map = React.createClass({

    componentDidMount: function () {
        var node = ReactDOM.findDOMNode(this).children[0]
        if (this.props.imageSource) {
            var bounds = [[0, this.props.imageW], [this.props.imageH, 0]]
            var mapConfig = {
                crs: L.CRS.Simple,
                layers: [L.imageOverlay(this.props.imageSource, bounds)],
                attributionControl: false,
                maxZoom: 1,
                minZoom: -4,
                zoom: -2,
                center: [0, 0]
            }
            var map = L.map(node, mapConfig)
            map.fitBounds(bounds)
            map.setMaxBounds(bounds)
            map.on('click', this.clicked)
            this.setState({ map: map })
        }
        else {
            var mapConfig = {
                crs: L.CRS.EPSG3857,
                layers: [L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')],
                attributionControl: false,
                maxZoom: 20,
                minZoom: 2,
                zoom: 14,
                center: this.props.location
            }
            var map = L.map(node, mapConfig)
            map.on('click', this.clicked)
            this.setState({ map: map })
        }
    },

    clicked: function (event) {
        if (this.props.isAdding() === false) return
        this.props.addPoint(event.latlng)
    },

    addPoint: function (point) {
        var iconNumber = 'number-' + Object.keys(this.state.map._layers).length
        var icon = L.divIcon({ className: 'marker ' + iconNumber })
        this.state.map.addLayer(L.marker(point, { icon: icon }))
    },

    render: function () {
        var isAdding = this.props.isAdding() ? ' adding' : ''
        var oldLayers = []
        if (this.state && this.state.map) {
            this.state.map.eachLayer(function (layer) {
                if (layer.options.icon) oldLayers = oldLayers.concat(layer)
            })
            oldLayers.forEach(function (layer) {
                this.state.map.removeLayer(layer)
            }.bind(this))
        }
        this.props.points.forEach(this.addPoint)
        return React.DOM.div({ className: this.props.className + isAdding }, React.DOM.div({ className: 'leaflet' }))
    }

})
