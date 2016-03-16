/** @jsx React.DOM */

'use strict';

var React = require('react'),
    Router = require('./Router'),
    Fluxxor = require("fluxxor"),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    FluxMixin = Fluxxor.FluxMixin(React);

function findParent(tagname,el){
    if ((el.nodeName || el.tagName).toLowerCase()===tagname.toLowerCase()){
        return el;
    }
    while (el = el.parentNode){
        if ((el.nodeName || el.tagName).toLowerCase()===tagname.toLowerCase()){
            return el;
        }
    }
    return null;
}

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('ApplicationStore')],

    displayName: 'Application',

    getInitialState: function () {
        return {}
    },

    getStateFromFlux: function () {
        var ClientStore = this.getFlux().stores.ClientStore;
        var path = this.getFlux().stores.ApplicationStore.getState();

        return {
            path: path,
            match: Router.recognizePath(path),
            currentPosition: ClientStore ? ClientStore.getCurrentPosition() : 0,
            numOfStates: ClientStore ? ClientStore.getNumberOfStates() : 0
        }
    },

    navigate: function (path, callback) {
        this.getFlux().actions.Application.navigate(path);
    },


    handleClick: function (e) {
        var from = findParent('A',e.target || e.srcElement);
        if (from){
            /* it's a link, actions here */
            e.preventDefault()

            this.navigate(from.pathname)
        }
    },

    handlePopstate: function () {
        this.getFlux().actions.Application.popstate(window.location.pathname);
    },

    componentDidMount: function () {
        var ClientStore = this.getFlux().stores.ClientStore;
        if(ClientStore){
            ClientStore.on('change', this.forceUpdate());
        }

        window.addEventListener('popstate', this.handlePopstate)
    },

    _onSliderChange: function(event){
        var t = event.target;
        window.goToStep(parseInt(t.value));
    },

    render: function () {
        var Page = this.state.match.handler,
            metadata = Page.getMetadata ? Page.getMetadata() : {},
            title = metadata.title || 'Reactive',
            description = metadata.description || 'Example react applicaiton'

        return (
            <html>
                <head>
                    <title>{title}</title>

                    <meta name="description" content={description} />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />

                    <meta property="og:title" content={title} />
                    <meta property="og:type" content="website" />
                    <meta property="og:description" content={description} />
                    <meta property="og:image" content="/images/facebook-thumbnail.png" />
                    <link rel="stylesheet" type="text/css" href="/public/style.css"/>
                </head>
                <body onClick={this.handleClick}>
                    <input width="100%" type="range" value={this.state.currentPosition} min={0} max={this.state.numOfStates} onChange={this._onSliderChange}/>

                    <Page params={this.state.match.params} />

                    <script src="/client.js"></script>
                </body>
            </html>
        )
    }
})
