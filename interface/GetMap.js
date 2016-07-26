var GetMap = React.createClass({

    download: function () {
        var types = {
            'tiff': 'image/tiff',
            'tar.gz': 'application/gzip'
        }
        var data = window.atob(this.props.result).split('').map(function (byte) {
            return byte.charCodeAt()
        })
        var blob = new Blob([new Uint8Array(data)], { type: types[this.props.format] })
        var anchor = document.createElement('a')
        anchor.setAttribute('href', URL.createObjectURL(blob))
        anchor.setAttribute('download', 'georeferenced.' + this.props.format)
        anchor.click()
    },

    next: function () {
        window.location = this.props.nextLocation
    },

    render: function () {
        if (this.props.nextLocation && this.props.resultUploaded) this.next()
        var title = React.DOM.h2({}, 'Georeferencing complete!')
        var downloadButton = this.props.resultUploaded ? '' : React.DOM.button({ onClick: this.download }, 'Download')
        var nextButton = this.props.nextLocation && !this.props.resultUploaded ? React.DOM.button({ onClick: this.next }, 'Next') : ''
        return React.DOM.div({ className: 'get-map' }, title, downloadButton, nextButton)
    }

})
