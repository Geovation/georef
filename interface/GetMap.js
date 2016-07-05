var GetMap = React.createClass({

    download: function () {
        var data = window.atob(this.props.result).split('').map(function (byte) {
            return byte.charCodeAt()
        })
        var blob = new Blob([new Uint8Array(data)], { type: 'image/tiff' })
        var anchor = document.createElement('a')
        anchor.setAttribute('href', URL.createObjectURL(blob))
        anchor.setAttribute('download', 'georefed.tiff')
        anchor.click()
    },

    render: function () {
        var title = React.DOM.h2({}, 'Georeferencing complete!')
        var downloadButton = React.DOM.button({ onClick: this.download }, 'Download')
        return React.DOM.div({ className: 'get-map' }, title, downloadButton)
    }

})
