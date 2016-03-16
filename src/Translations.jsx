/** @jsx React.DOM */

var React = require('react'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Layout = require('./layout/Layout'),
    _ = require('lodash'),
    KeyList = require('./view/KeyList');

var project = {
    name: "test",
    parent: {
        login: "test",
        type: "user"
    },
    locales: [
        "de", "en", "fr"
    ]
};

var updateFncs = {};


module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('KeyStore')],

    displayName: 'Translations',

    getInitialState: function () {
        return {};
    },

    getStateFromFlux: function () {
        var store = this.getFlux().store('KeyStore');
        var state = store.getKeysForProject(project);
        return state instanceof Function ? {loading: true} : state;
    },

    setStateForParams: function (params) {
        if (!module.parent) {
            var state = this.getFlux().stores.KeyStore.getKeysForProject(project);
            if (state instanceof Function) {
                this.setState({loading: true});
                state();
            } else {
                this.setState(state);
            }
        }
    },

    componentWillMount: function () {
        this.setStateForParams(this.props.params);
    },

    clickOnArticle: function (article) {
        console.log(article)
    },

    componentWillReceiveProps: function (nextProps) {
        this.setStateForParams(nextProps.params);
    },

    showCreateKey: function () {
        var keyName = prompt("Enter Key name");
        if (keyName) {
            this.getFlux().actions.Keys.createKey(project, keyName);
        }
    },

    updateTranslation: function (translation, event) {
        clearTimeout(updateFncs[translation.id] || 0);
        var value = event.target.value;
        updateFncs[translation.id] = setTimeout(function () {
            this.getFlux().actions.Translations.updateTranslation(project, translation, {value: value});
        }.bind(this), 250);
    },

    createTranslation: function (locale, key, event) {
        var val = event.target.value;
        clearTimeout(updateFncs[locale + key.id] || 0);
        updateFncs[locale + key.id] = setTimeout(function () {
            this.getFlux().actions.Translations.createTranslation(project, locale, val, key.id)
        }.bind(this), 300);
    },

    render: function () {
        var state = this.state,
            loading = this.state.loading,
            translationsLoaded = false,
            translationList = [],
            localeOptions = [];

        if (!loading) {
            if (state.selectedKey) {
                var translations = this.getFlux().store('KeyStore').getTranslationsForKey(project, state.selectedKey.id, "de");
                if (translations instanceof Function) {
                    // load translations
                    translations();
                } else {
                    translationList = _.map(project.locales, function (locale) {
                        var translation = _.find(translations, function (translation) {
                            return translation.locale == locale;
                        });

                        if (translation) {
                            return (
                                <div key={"translation-" + translation.id}>
                                    {locale + " :"}
                                    <input type="text" defaultValue={translation.value} onChange={this.updateTranslation.bind(this, translation)}/>
                                    {translation.updating ? "(updating)" : ""}
                                </div>);
                        } else {
                            return (
                                <div key={"translation-n-" + locale}>
                                    {locale + " :"}
                                    <input type="text" onChange={this.createTranslation.bind(this, locale, state.selectedKey)}/>
                                "NEW"
                                </div>
                            )
                        }

                    }.bind(this));

                    translationsLoaded = true;
                }
            }
            localeOptions = _.map(project.locales, function (locale) {
                return (<option value={locale}>{locale}</option>)
            });
            localeOptions.unshift(<option value="all">All</option>);


        }

        return (
            <Layout>
                <h1>Translations</h1>
                {loading ? "Loading" : ""}
                <div className="actions">
                    <button onClick={this.showCreateKey}>Create Key</button>
                    <select onChange={this.selectLocale}>
                        {localeOptions}
                    </select>
                </div>

                <KeyList project={project} />
                <div className="translations">
                {translationsLoaded ? (translationList.length ? translationList : "No Translations") : (state.selectedKey ? "Loading" : "Select a key!")}
                </div>
            </Layout>
        )
    },

    statics: {
        getMetadata: function () {
            return {
                title: 'Translations'
            }
        },
        loadData: function (flux, params) {
            return {};
        }
    }
})
