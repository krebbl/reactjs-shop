/** @jsx React.DOM */

var React = require('react'),
    Layout = require('./layout/Layout'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    _ = require('lodash'),
    ProductType = require('./model/ProductType');


module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('ArticleStore')],
    displayName: 'Article',


    getInitialState: function () {
        return {};
    },

    getStateFromFlux: function () {
        var store = this.getFlux().store('ArticleStore');
        var state = store.getArticleState(this.props.params.articleId)
        return state instanceof Function ? {loaded: false} : state;
    },

    setStateForParams: function (params) {
        if (!module.parent) {

            var store = this.getFlux().stores.ArticleStore;
            store.removeListener('change:' + params.articleId, this._handleChange);
            store.on('change:' + params.articleId, this._handleChange);
            var state = store.getArticleState(params.articleId);
            if (state instanceof Function) {
                this.setState({
                    loaded: false
                });
                state();
            } else {
                this.setState(state);
            }
        }
    },

    componentDidMount: function () {
        this.getFlux().stores.ArticleStore.on('change:' + this.props.params.articleId, this._handleChange);
    },

    componentWillUnmount: function () {
        this.getFlux().stores.ArticleStore.removeListener('change:' + this.props.params.articleId, this._handleChange);
    },

    componentWillMount: function () {
        this.setStateForParams(this.props.params);
    },

    componentWillReceiveProps: function (nextProps) {
        this.setStateForParams(nextProps.params);
    },

    _handleChange: function () {
        this.setState(this.getStateFromFlux());
    },

    _selectView: function (articleId, viewId) {
        this.getFlux().actions.Article.selectView(articleId, viewId);
    },

    _selectAppearance: function (articleId, appearanceId) {
        this.getFlux().actions.Article.selectAppearance(articleId, appearanceId);
    },

    _selectSize: function (articleId, sizeId) {
        this.getFlux().actions.Article.selectSize(articleId, sizeId);
    },

    _addArticleToBasket: function () {
        if (this.state.sizeId) {
            var basket = this.getFlux().stores.BasketStore.getBasket();
            if (basket) {
                this.getFlux().actions.Basket.addArticle(basket, this.state.article, this.state.sizeId, 1, this.state.appearanceId);
            }

        }
    },

    replayStates: function () {
        var states = JSON.parse(window.localStorage.getItem("states")),
            store = this.getFlux().store('ArticleStore');
        window.localStorage.setItem("states", "[]");
        console.log(states);

        store.replay = true;

        var interval = setInterval(function () {
            if (states.length > 0) {
                this.getFlux().store('ArticleStore').setState(states.pop());
            } else {
                store.replay = false;
                clearInterval(interval);
            }
        }.bind(this), 500);

    },

    removeClass: function () {
        console.log("remove class");
    },

    render: function () {
        var state = this.state,
            content;
        if (state && state.article) {
            var views = [],
                appearances = [],
                articleId = state.article.id;

            var productType = state.productType;
            var selectedViewId = state.viewId,
                sizeId = state.sizeId,
                appearanceId = state.appearanceId;

            _.forEach(productType.views, function (view) {
                views.push((
                    <div key={view.id} onClick={this._selectView.bind(this, articleId, view.id)} className={selectedViewId == view.id ? 'selected' : ''}>
                        {view.name}
                    </div>))
            }.bind(this));

            _.forEach(productType.appearances, function (appearance) {
                appearances.push((
                    <div key={appearance.id} onClick={this._selectAppearance.bind(this, articleId, appearance.id)} className={appearanceId == appearance.id ? 'selected' : ''}>
                        {appearance.name}
                    </div>
                ));
            }.bind(this));

            var sizes = ProductType.getAvailableSizesForAppearanceId(productType, appearanceId);
            _.forEach(productType.sizes, function (size) {
                sizes.push((
                    <div key={size.id} onClick={this._selectSize.bind(this, articleId, size.id)} className={sizeId == size.id ? 'selected' : ''}>
                        {size.name}
                    </div>
                ));
            }.bind(this))


            content = (<div>
                <img ref="img" onLoad={this.removeClass} src={state.article.resources[0].href.replace(/views\/(\d+)/, "views/" + selectedViewId) + ",appearanceId=" + appearanceId + ",width=400,height=400"}/>
                <div>Views</div>
                <div>
                    {views}
                </div>
                <div>Appearances</div>
                <div>
                {appearances}
                </div>
                <div>Select Size</div>
                <div>
                {sizes}
                </div>
                <div>
                    <button onClick={this._addArticleToBasket}>Add Article To Basket</button>
                </div>
            </div>);


        } else {
            content = "Loading";
        }

        //var variant = this.props.params.articleId && <Variant id={this.props.params.articleId} />

        return (
            <Layout>
            {content}
            </Layout>
        )
    },
    statics: {
        getMetadata: function () {
            return {
                title: 'Article'
            }
        },
        loadData: function (flux, params) {
            return flux.stores.ArticleStore.getArticleState(params.articleId);
        }
    }
})
