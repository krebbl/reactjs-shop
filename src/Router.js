'use strict';

var urlPattern = require('url-pattern')

var Dashboard = require('./Dashboard'),
    Catalog = require('./Catalog'),
    Product = require('./Product'),
    Article = require('./Article'),
    Basket = require('./Basket'),
    Translations = require('./Translations');

module.exports = {
    routes: [
        {path: '/', handler: Dashboard},
        {path: '/catalog', handler: Catalog},
        {path: '/catalog/:pageId', handler: Catalog},
        {path: '/article/:articleId', handler: Article},
        {path: '/products/:productId/:variantId', handler: Product},
        {path: '/basket', handler: Basket},
        {path: '/translations', handler: Translations}
    ],

    recognizePath: function (path) {
        var routes = this.routes

        for (var i = 0, l = routes.length; i < l; i++) {
            var route = routes[i],
                pattern = urlPattern(route.path),
                params = pattern.match(path)

            if (params) {
                return {
                    path: path,
                    params: params,
                    handler: route.handler
                }
            }
        }
    }
}
