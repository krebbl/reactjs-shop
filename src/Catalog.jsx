/** @jsx React.DOM */

var React = require('react'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Layout = require('./layout/Layout')


module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('CatalogStore')],

    displayName: 'Catalog',

    getInitialState: function () {
        return {};
    },

    getStateFromFlux: function () {
        var store = this.getFlux().store('CatalogStore'),
            state = store.getCurrentPageState();
        return state instanceof Function ? {loaded: false} : state || {};
    },

    setStateForParams: function (params) {
        if (!module.parent) {
            var p = parseInt(params.pageId) || 1;
            var state = this.getFlux().stores.CatalogStore.getPageState(p);
            if (state instanceof Function) {
                this.setState({loaded: false});
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

    render: function () {
        var items = {},
            self = this;
        var page = parseInt(this.state.page),
            loading = true,
            buttons = [];

        if (this.state.loaded) {
            var articles = this.state.articles;

            loading = false;
            if(articles){
                articles.forEach(function (result) {
                    items['result-' + result.id] = <li onDoubleClick={self.clickOnArticle.bind(self, result)}>
                        <a href={"/article/" + result.id}>{result.name}</a>
                    </li>;
                });
            }

            if (page > 1) {
                buttons.push(<a key="prev" href={"/catalog/" + (page - 1)}>Prev Page</a>);
                buttons.push(" | ");
            }
            buttons.push(<a key="next" href={"/catalog/" + (page + 1)}>Next Page</a>);
        }

        return (
            <Layout>
                <h1>Articles</h1>

                {buttons}
                {loading ? "Loading" : ""}
                <ul>
                    {items}
                </ul>

            </Layout>
        )
    },

    statics: {
        getMetadata: function () {
            return {
                title: 'Catalog'
            }
        },
        loadData: function (flux, params) {
            return flux.stores.CatalogStore.getPageState(params.pageId || 1);
        }
    }
})
