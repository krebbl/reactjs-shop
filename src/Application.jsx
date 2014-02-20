/** @jsx React.DOM */

'use strict';

var React = require('react'),
    Router = require('./Router')

function matchPath(path) {
  return Router.recognizePath(path)
}

function preloadPath(path, callback) {
  var match = Router.recognizePath(path),
      handler = match.handler

  if (typeof handler.fetchData == 'function') {
    return handler.fetchData(callback)
  }

  callback()
}

module.exports = React.createClass({
  displayName: 'Application',

  getInitialState: function() {
    var path = this.props.path || window.location.pathname

    return {
      match: matchPath(path)
    }
  },

  navigate: function(path, callback) {
    window.history.pushState(null, null, path)

    this.setState({ match: matchPath(path) }, callback)
  },

  handleClick: function(e) {
    if (e.target.tagName === 'A') {
      e.preventDefault()

      this.navigate(e.target.pathname)
    }
  },

  handlePopstate: function() {
    var path = window.location.pathname

    if (this.state.match.path !== path) {
      this.setState({ match: matchPath(path) })
    }
  },

  componentDidMount: function() {
    window.addEventListener('popstate', this.handlePopstate)

    delete window._shared
  },

  render: function() {
    var Page = this.state.match.handler,
        data = this.props.data || window._shared,
        title = data && data.title,
        description = data && data.description

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
        </head>
        <body onClick={this.handleClick}>
          <Page data={data} />

          <script src="/client.js"></script>
        </body>
      </html>
    )
  },

  statics: {
    matchPath: matchPath,
    preloadPath: preloadPath
  }
})