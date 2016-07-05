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
        if (!this.props.isAdding()) return
        var iconNumber = 'number-' + Object.keys(this.state.map._layers).length
        var icon = L.divIcon({ className: 'marker ' + iconNumber })
        this.state.map.addLayer(L.marker(event.latlng, { icon: icon }))
        var coordinates = !this.props.imageSource ? event.latlng : {
            lng: event.latlng.lng,
            lat: this.props.imageH - event.latlng.lat
        }
        this.props.addPoint(coordinates)
    },

    render: function () {
        var isAdding =  (this.props.isAdding() ? ' adding' : '')
        return React.DOM.div({ className: this.props.className + isAdding }, React.DOM.div({ className: 'leaflet' }))
    }

})
