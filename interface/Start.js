var Georef = React.createClass({

    setInput: function (location, image) {
        this.setState({ location: location, image: image })
    },

    setOutput: function (result) {
        this.setState({ result: result })
    },

    render: function () {
        if (this.state && this.state.result) {
            return React.createElement(GetMap, { result: this.state.result })
        }
        else if (this.state && this.state.location && this.state.image) {
            return React.createElement(ViewMap, Object.assign({ setOutput: this.setOutput }, this.state))
        }
        else return React.createElement(NewMap, { setInput: this.setInput })
    }

})

var main = document.querySelector('main')
var element = React.createElement(Georef)
ReactDOM.render(element, main)
