var GetMap = React.createClass({

    download: function () {
        var anchor = document.createElement('a')
        anchor.setAttribute('href', this.props.result)
        anchor.setAttribute('download', 'georefed.tiff')
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
    },

    render: function () {
        var title = React.DOM.h2({}, 'Georeferencing complete!')
        var downloadButton = React.DOM.button({ onClick: this.download }, 'Download')
        return React.DOM.div({ className: 'get-map' }, title, downloadButton)
    }

})
