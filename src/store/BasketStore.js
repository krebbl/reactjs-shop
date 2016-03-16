/**
 * Created by mkre on 27.11.14.
 */
var Fluxxor = require('fluxxor'),
    ActionTypes = require("../ActionTypes"),
    _ = require('lodash'),
    RestClient = require("../data/RestClient");


var BASKET_ID = "BASKET_ID";


var BasketStore = Fluxxor.createStore({

    state: {},
    initialize: function () {
        //console.log(attributes);
        if (typeof(window) != "undefined") {
            var basketId = window.localStorage.getItem(BASKET_ID);
            if (basketId) {
                this.loadBasket(basketId, function (err) {
                    if (err) {
                        if (typeof(window) != "undefined") {
                            window.localStorage.removeItem(BASKET_ID);
                        }
                        this.createBasket();
                    }
                }.bind(this));

            } else {
                this.createBasket();
            }
        }

        this.bindActions(
            ActionTypes.ADD_ARTICLE, this.handleAddArticle,
            ActionTypes.ADD_ARTICLE_SUCCESS, this.handleAddArticleSuccess,
            ActionTypes.CHANGE_QUANTITY, this.handleChangeQuantity,
            ActionTypes.CHANGE_QUANTITY_SUCCESS, this.handleChangeQuantitySuccess,
            ActionTypes.REMOVE_ITEM, this.handleRemoveBasketItem,
            ActionTypes.REMOVE_ITEM_SUCCESS, this.handleRemoveBasketItemSuccess
        );
    },

    loadBasket: function (basketId, cb) {
        this.state.loading = true;

        RestClient.loadCombinedBasket(basketId, function (err, res) {
            if (!err) {
                this.state = _.assign({}, res);
                this.state.loading = false;
                this.emit("change");
            }
            cb && cb(err, res);
        }.bind(this));

    },

    createBasket: function () {
        RestClient.createBasket(function (err, res) {
            if (!err) {
                if (typeof(window) != "undefined") {
                    window.localStorage.setItem(BASKET_ID, res.id);
                }
                this.loadBasket(res.id, function (err) {
                    if (err) {
                        throw new Error(err);
                    }
                }.bind(this));
            }
        }.bind(this));
    },

    handleAddArticle: function (payload) {
        if (this.state.basket) {
            this.state.updatingPrice = true;
            this.emit("change");
        }
    },

    handleAddArticleSuccess: function (payload) {
        var newBasket = payload.basket,
            newArticle = payload.article;
        if (this.state.articles) {
            this.state.articles.articles.push(newArticle);
        }
        this.state.basket = newBasket;
        this.state.updatingPrice = false;
        this.emit("change");
    },

    handleChangeQuantity: function (payload) {
        if (this.state.basket) {
            this.state.updatingPrice = true;
            payload.basketItem.quantity = payload.quantity;
            this.emit("change");
        }
    },

    handleChangeQuantitySuccess: function (basket) {
        basket.basketItems = this.state.basket.basketItems;
        this.state.basket = basket;
        this.state.updatingPrice = false;
        this.emit("change");
    },

    handleRemoveBasketItem: function (payload) {
        var basket = this.state.basket;
        _.remove(basket.basketItems, function (item) {
            return item.id == payload.basketItem.id;
        });
        this.state.updatingPrice = true;
        this.emit("change");
    },

    handleRemoveBasketItemSuccess: function (basket) {
        // update everything expect of basketItems
        basket.basketItems = this.state.basket.basketItems;
        this.state.basket = basket;
        this.state.updatingPrice = false;
        this.emit("change");
    },

    getElementForBasketItem: function (basketItem) {
        if (basketItem.element.type == "sprd:article") {
            var articles = this.state.articles;
            if (articles && articles.articles) {
                return _.find(articles.articles, function (article) {
                    return article.id == basketItem.element.id;
                });
            }
        } else if (basketItem.element.type == "sprd:product") {
            var products = this.state.products;
            if (products && products.products) {
                return _.find(products.products, function (product) {
                    return product.id == basketItem.element.id;
                });
            }
        }
        return null;
    },

    getBasket: function () {
        return this.state.basket;
    },

    getState: function () {
        return this.state;
    },
    setState: function (state) {
        this.state = state;
        this.emit("change");
    }
});

module.exports = BasketStore;