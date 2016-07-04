var NewMap = React.createClass({

    getInitialState: function () {
        return {
            location: '',
            locations: null,
            errors: []
        }
    },

    setLocation: function (event) {
        this.setState({
            location: event.target.innerHTML,
            locationCoords: [event.target.getAttribute('data-lat'), event.target.getAttribute('data-lng')],
            locations: null
        })
    },

    findFile: function (event) {
        document.querySelector('.dropzone [type=file]').click()
    },

    setFile: function (event) {
        event.preventDefault()
        var image = event.type === 'drop'
            ? event.dataTransfer.files[0]
            : document.querySelector('.dropzone [type=file]').files[0]
        this.setState({ dragging: false, image: image })
    },

    geolocate: function (event) {
        event.persist()
        this.setState({ location: event.target.value })
        if (event.target.value === '') return this.setState({ locations: null })
        var address = event.target.value.replace(' ', '+')
        var location = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address
        var http = new XMLHttpRequest()
        http.open('GET', location, true)
        http.addEventListener('load', function () {
            var response = JSON.parse(http.response)
            var locations = response.results.slice(0, 10).map(function (result) {
                return {
                    name: result.formatted_address,
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng
                }
            })
            this.setState({ locations: locations })
        }.bind(this))
        http.send()
    },

    start: function () {
        var checks = {
            location: this.state.locationCoords ? false : 'You must enter a rough location for this map.',
            image: this.state.image ? false : 'You must select an image file to be used.'
        }
        var errors = Object.keys(checks).map(function (k) { return checks[k] }).filter(function (v) { return v })
        if (errors.length === 0) this.props.setInput(this.state.locationCoords, this.state.image)
        else {
            this.setState({ errors: errors })
        }
    },

    render: function () {
        var title = React.DOM.h2({}, 'Georeference a new map')
        var location = React.DOM.input({ className: 'location', placeholder: 'Location', value: this.state.location, onChange: this.geolocate })
        var locationsValues = this.state.locations === null ? '' :
            this.state.locations.map(function (place, i) {
                return React.DOM.li({ onClick: this.setLocation, 'data-lat': place.lat, 'data-lng': place.lng, key: i }, place.name)
            }.bind(this))
        var locations = this.state.locations && this.state.locations.length > 0 ? React.DOM.ol({}, locationsValues) : ''
        var dropzoneButton = this.state.image ? '' : React.DOM.button({ onClick: this.findFile }, 'select a file')
        var dropzoneText = React.DOM.p({}, this.state.image ? this.state.image.name : 'Drag here or ')
        var dropzoneInput = React.DOM.input({ type: 'file', onChange: this.setFile })
        var dropzoneParams = {
            className: 'dropzone ' + (this.state.dragging ? 'dragging' : ''),
            onDragEnter: function () { this.setState({ dragging: true  }) }.bind(this),
            onDragLeave: function () { this.setState({ dragging: false }) }.bind(this),
            onDragOver: function (event) { event.preventDefault() }.bind(this),
            onDrop: this.setFile
        }
        var dropzone = React.DOM.div(dropzoneParams, dropzoneText, dropzoneButton, dropzoneInput)
        var errors = this.state.errors.map(function (error, i) {
            return React.DOM.span({ className: 'error', key: i }, error)
        })
        var startButton = React.DOM.button({ onClick: this.start }, 'Start')
        return React.DOM.div({ className: 'new-map' }, title, location, locations, dropzone, errors, startButton)
    }

})
