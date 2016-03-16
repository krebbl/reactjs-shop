/**
 * Created by mkre on 27.11.14.
 */
var Fluxxor = require('fluxxor'),
    ActionTypes = require("../ActionTypes"),
    _ = require('lodash'),
    RestClient = require('../data/RestClient');


var CatalogStore = Fluxxor.createStore({
    pages: {},

    initialize: function () {
        this.bindActions();
    },

    getPageState: function (page) {
        var p = this.pages[page];
        if (!p) {
            return function (cb) {
                RestClient.loadArticles(205909, page, 20, function (err, body) {
                    if (!err) {
                        this.pages[page] = body;
                        this.pages[page].loaded = true;
                        this.pages[page].page = page;
                        this.pages["currentPage"] = page;
                    }
                    cb && cb(err);
                    this.emit("change");
                }.bind(this));
            }.bind(this);
        } else {
            return p;
        }
    },

    getCurrentPageState: function () {
        return this.pages[this.pages["currentPage"] || 1];
    },
    getState: function () {
        return this.pages;
    },
    setState: function (state) {
        this.pages = state;
    },
    clearState: function () {
        this.pages = {};
    }
});

module.exports = CatalogStore;