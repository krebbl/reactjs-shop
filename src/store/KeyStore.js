/**
 * Created by mkre on 27.11.14.
 */
var Fluxxor = require('fluxxor'),
    ActionTypes = require("../ActionTypes"),
    _ = require('lodash'),
    RestClient = require('../data/RestClient');


var KeyStore = Fluxxor.createStore({
    state: {},

    initialize: function () {
        this.bindActions(
            ActionTypes.CREATE_KEY, this.handleCreateKey,
            ActionTypes.CREATE_KEY_SUCCESS, this.handleCreateKeySuccess,
            ActionTypes.UPDATE_KEY, this.handleUpdateKey,
            ActionTypes.UPDATE_KEY_SUCCESS, this.handleUpdateKeySuccess,
            ActionTypes.SELECT_KEY, this.handleSelectKey,
            ActionTypes.UPDATE_TRANSLATION, this.handleUpdateTranslation,
            ActionTypes.UPDATE_TRANSLATION_SUCCESS, this.handleUpdateTranslationSuccess,
            ActionTypes.CREATE_TRANSLATION_SUCCESS, this.handleCreateTranslationSuccess
        );
    },

    handleCreateKey: function (payload) {
        // optimistic adding
        var k = this._getCacheKeyForProject(payload.project);
        var p = this.state[k];
        if (p) {
            var key = _.find(p.keys, function (key) {
                return key.name == payload.keyName;
            });
            if (!key) {
                p.keys.push({
                    id: "n:" + payload.keyName,
                    name: payload.keyName,
                    adding: true
                });
                p.keys.sort(function (k1, k2) {
                    return k1.name > k2.name ? -1 : 1;
                });
                this.emit("change");
            }
        }

    },

    handleCreateKeySuccess: function (payload) {

        var k = this._getCacheKeyForProject(payload.project);
        var p = this.state[k];
        if (p) {
            var key = _.find(p.keys, function (key) {
                return key.name == payload.key.name;
            });
            if (key) {
                key.id = payload.key.id;
                key.adding = false;
                this.emit("change");
            }
        }

    },

    handleUpdateKey: function (payload) {
        var k = this._getKeyForProjectAndId(payload.project, payload.key.id);
        if (k) {
            _.assign(k, payload.newAttributes);
            k.updating = true;
            this.emit("change");
        }
    },

    handleUpdateKeySuccess: function (payload) {
        var k = this._getKeyForProjectAndId(payload.project, payload.key.id);
        if (k) {
            k.updating = false;
            this.emit("change");
        }
    },

    handleCreateTranslationSuccess: function (payload) {
        var s = this._getKeysStateForProject(payload.project);
        if (s) {
            s.translations.push(payload.translation);
            this.emit("change");
        }
    },

    handleSelectKey: function (payload) {
        var s = this._getKeysStateForProject(payload.project);
        if (s) {
            s.selectedKey = payload.key;
            this.emit("change");
        }
    },

    getTranslationsForKey: function (project, id, locale) {
        var s = this._getKeysStateForProject(project);
        if (s && s.translations) {
            return _.filter(s.translations, function (translation) {
                return translation.keyId == id;
            });
        } else {
            return function (cb) {
                setTimeout(function () {
                    var cacheKey = this._getCacheKeyForProject(project);
                    this.state[cacheKey] = this.state[cacheKey] || {};
                    this.state[cacheKey].translations = [
                        {
                            id: 1,
                            value: "Warenkorb",
                            locale: "de",
                            keyId: 1
                        },
                        {
                            id: 2,
                            value: "Basket",
                            locale: "en",
                            keyId: 1
                        }
                    ];

                    this.emit("change");
                    cb && cb(null);
                }.bind(this));
            }.bind(this);
        }
    },

    handleUpdateTranslation: function (payload) {
        // optimistic updating
        var translation = this._getTranslationForProjectAndId(payload.project, payload.translation.id);
        if (translation) {
            // TODO: save original values in case the update fails
            _.assign(translation, payload.attributes);
            translation.updating = true;
            this.emit("change");
        }

    },

    handleUpdateTranslationSuccess: function (payload) {
        // optimistic updating
        var translation = this._getTranslationForProjectAndId(payload.project, payload.translation.id);
        if (translation) {
            translation.updating = false;
            this.emit("change");
        }
    },

    _getKeysStateForProject: function (project) {
        var k = this._getCacheKeyForProject(project);
        return this.state[k];
    },

    _getKeyForProjectAndId: function (project, id) {
        var s = this._getKeysStateForProject(project);
        return _.find(s.keys || [], function (key) {
            return key.id == id;
        });
    },

    _getTranslationForProjectAndId: function (project, id) {
        var s = this._getKeysStateForProject(project);
        return _.find(s.translations || [], function (translation) {
            return translation.id == id;
        })
    },

    getKeysForProject: function (project) {
        var k = this._getCacheKeyForProject(project);
        var payload = this.state[k];
        if (!payload) {
            return function (cb) {
                setTimeout(function () {
                    this.state[k] = {
                        keys: [{
                            id: 1,
                            name: "basket"
                        }, {
                            id: 2,
                            name: "shopping"
                        }],
                        loading: false
                    };

                    this.state[k].keys.sort(function (k1, k2) {
                        return k1.name > k2.name ? -1 : 1;
                    })
                    this.emit("change");
                    cb && cb(null);
                }.bind(this), 100);
            }.bind(this);
        } else {
            return payload;
        }
    },

    _getCacheKeyForProject: function (project) {
        return ["user", project.parent.login, "type", project.parent.type, "project", project.name].join("_");
    },

    getState: function () {
        return this.state;
    },
    setState: function (state) {
        this.state = state;
    },
    clearState: function () {
        this.state = {};
        this.emit('change');
    }
});

module.exports = KeyStore;