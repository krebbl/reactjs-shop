'use strict';

var express = require('express'),
    path = require('path'),
    browserify = require('browserify-middleware'),
    jsx = require('node-jsx'),
    superagent = require("superagent"),
    proxy = require('express-http-proxy'),
    serveStatic = require('serve-static'),
    reactify = require('reactify'),
    uglifyify = require('uglifyify')
    ;

jsx.install({extension: '.jsx'})

var app = module.exports = express(),
    debug = app.get('env') == 'development'

app.use("/api", proxy('api.spreadshirt.net', {
    forwardPath: function (req, res) {
        return "/api" + require('url').parse(req.url).path;
    }

}));


// Mock API
//app.get('/api', function(req, res) {
//  res.send({message: 'Hello from API'})
//})


// Client bundler
app.get('/client.js', browserify('./client.js', {
    cache: 'dynamic',
    precompile: false,
    extensions: ['.jsx', '.js', '.json'],
    debug: debug,
    gzip: false,
    transform: ['reactify']
}));

// Client bundler
app.get('/test.js', browserify('./test.js', {
    extensions: ['.jsx', '.js', '.json'],
    debug: false,
    watch: false,
    gzip: false,
    transform: ['reactify']
}));

app.use('/public', express.static(__dirname + '/public'));

// Server rendering
// TODO: Router doesn't have to be global
var React = require('react'),
    Router = require('./src/Router'),
    Application = require('./src/Application'),
    Actions = require('./src/Actions'),
    Fluxxor = require('fluxxor'),
    ArticleStore = require('./src/store/ArticleStore'),
    CatalogStore = require('./src/store/CatalogStore'),
    ApplicationStore = require('./src/store/ApplicationStore'),
    BasketStore = require('./src/store/BasketStore'),
    KeyStore = require('./src/store/KeyStore');

app.use(function (req, res, next) {
    var path = req.path,
        match = Router.recognizePath(path)

    if (!match) return next()


    // Initialize store
    var stores = {
        ArticleStore: new ArticleStore(),
        CatalogStore: new CatalogStore(),
        ApplicationStore: new ApplicationStore(),
        BasketStore: new BasketStore(),
        KeyStore: new KeyStore()
    };
    var flux = new Fluxxor.Flux(stores, Actions);

    function send() {
        stores.ApplicationStore.setState(path);

        var markup = React.renderComponentToString(Application({
            path: path,
            flux: flux
        }));

        var fluxStores = {};
        for (var s in flux.stores) {
            var store = flux.stores[s];
            if (store.getState) {
                fluxStores[s] = store.getState();
            }
        }

        // Inject store data into markup
        markup = markup.replace('</head>', '<script>window._fluxStores = ' + JSON.stringify(fluxStores) + '</script></head>')

        res.send(markup)
    }

    // send();
    // Load initial data
    if (match.handler.loadData) {

        var ret = match.handler.loadData(flux, match.params);
        if (ret instanceof Function) {
            ret(send);
        } else {
            send();
        }
    } else {
        send()
    }
})

if (!module.parent) {
    var port = process.env.PORT || 3000;

    app.listen(port, function () {
        console.log('Listening on port %s', port);
    })
}
