var ActionTypes = require("./ActionTypes"),
    RestClient = require('./data/RestClient'),
    flow = require('flow.js').flow,
    _ = require('lodash'),
    BasketItem = require('./model/BasketItem');

var updateCalls = {},
    createCalls = {},
    lastCreateValue = {},
    Actions;

module.exports = Actions = {
    replay: false,
    Application: {
        navigate: function (path) {
            //if(this.flux.dispatcher.currentDispatch) return;
            this.dispatch(ActionTypes.NAVIGATE, path);
        },
        popstate: function (path) {
            //if(this.flux.dispatcher.currentDispatch) return;
            this.dispatch(ActionTypes.POPSTATE, path);
        }
    },

    Catalog: {

        filterByQuery: function (query) {

        },

        addArticleToWishList: function (articleId) {

        },

        removeArticleFromWishList: function () {

        }

    },

    Article: {
        selectAppearance: function (articleId, appearanceId) {
            this.dispatch(ActionTypes.SELECT_APPEARANCE, {
                articleId: articleId,
                appearanceId: appearanceId
            });
        },
        selectSize: function (articleId, sizeId) {
            this.dispatch(ActionTypes.SELECT_SIZE, {
                articleId: articleId,
                sizeId: sizeId
            });
        },
        selectView: function (articleId, viewId) {
            this.dispatch(ActionTypes.SELECT_VIEW, {
                articleId: articleId,
                viewId: viewId
            });
        }
    },
    Basket: {
        load: function () {

        },

        saveBasket: function (basket) {

        },

        addArticle: function (basket, article, sizeId, quantity, appearanceId) {
            this.dispatch(ActionTypes.ADD_ARTICLE, {
                basket: basket,
                article: article,
                sizeId: sizeId,
                quantity: quantity,
                appearanceId: appearanceId
            });


            var existingBasketItem = _.find(basket.basketItems, function (item) {
                var itemAppearanceId = BasketItem.getAppearanceId(item),
                    itemSizeId = BasketItem.getSizeId(item);
                return item.element.type == "sprd:article" && item.element.id == article.id
                    && sizeId == itemSizeId && appearanceId == itemAppearanceId;

            });

            if (!existingBasketItem) {
                RestClient.createBasketItem(basket.id, {
                    element: {
                        id: article.id,
                        href: article.href,
                        properties: [
                            {
                                key: "appearance",
                                value: appearanceId
                            },
                            {
                                key: "size",
                                value: sizeId
                            }
                        ],
                        type: "sprd:article"
                    },
                    quantity: quantity || 1,
                    origin: {
                        id: "2"
                    }
                }, function (err, res) {
                    if (!err) {
                        RestClient.loadBasket(basket.id, function (err, basket) {
                            this.dispatch(ActionTypes.ADD_ARTICLE_SUCCESS, {
                                article: article,
                                basket: basket
                            });
                        }.bind(this));
                    }
                }.bind(this))

                this.dispatch(ActionTypes.ADD_ARTICLE, {
                    article: article,
                    sizeId: sizeId,
                    quantity: quantity,
                    appearanceId: appearanceId
                });
            } else {
                this.flux.actions.Basket.changeQuantity(basket.id, existingBasketItem, existingBasketItem.quantity + quantity);
            }
        },

        removeBasketItem: function (basketId, basketItem) {
            this.dispatch(ActionTypes.REMOVE_ITEM, {
                basketId: basketId,
                basketItem: basketItem
            });

            RestClient.removeBasketItem(basketId,
                basketItem
                , function (err, res) {
                    if (!err) {
                        RestClient.loadBasket(basketId, function (err, basket) {
                            if (!err) {
                                this.dispatch(ActionTypes.REMOVE_ITEM_SUCCESS, basket);
                            }
                        }.bind(this));
                    }
                }.bind(this));

        },

        changeQuantity: function (basketId, basketItem, quantity) {
            this.dispatch(ActionTypes.CHANGE_QUANTITY, {
                basketId: basketId,
                basketItem: basketItem,
                quantity: quantity
            });

            var newBasketItem = _.assign({}, basketItem, {quantity: quantity});
            RestClient.updateBasketItem(basketId,
                newBasketItem
                , function (err, res) {
                    if (!err) {
                        RestClient.loadBasket(basketId, function (err, basket) {
                            if (!err) {
                                this.dispatch(ActionTypes.CHANGE_QUANTITY_SUCCESS, basket);
                            }
                        }.bind(this));
                    }
                }.bind(this));
        },

        removeItem: function (basket, basketItem) {
            // if item not in basket trigger
        },

        changeQuantityOfItem: function (basket, basketItem, quantity) {

        },

        changeSizeOfItem: function (basket, basketItem, size) {

        },

        applyVoucher: function (basket, voucher) {

        },

        removeVoucher: function (basket, voucher) {

        }
    },

    Checkout: {
        selectShippingType: function () {

        },
        selectShippingCountry: function () {

        },
        loadShippingTypes: function () {

        }
    },

    User: {
        login: function (username, password) {

        },

        logout: function () {

        },

        load: function () {

        }
    },

    Keys: {
        createKey: function (project, keyName) {

            this.dispatch(ActionTypes.CREATE_KEY, {
                project: project,
                keyName: keyName
            });

            setTimeout(function () {
                // TODO: make ajax call
                this.dispatch(ActionTypes.CREATE_KEY_SUCCESS, {
                    project: project,
                    key: {
                        name: keyName,
                        id: new Date().getTime()
                    }
                });
            }.bind(this), 1000);
        },

        updateKey: function (project, key, attributes) {
            // TODO: filter attributes

            this.dispatch(ActionTypes.UPDATE_KEY, {
                project: project,
                key: key,
                newAttributes: attributes
            });

            setTimeout(function () {
                var nKey = _.assign(key, attributes);
                // TODO: make ajax call
                this.dispatch(ActionTypes.UPDATE_KEY_SUCCESS, {
                    project: project,
                    key: nKey
                });
            }.bind(this), 1000);
        },

        selectKey: function (project, key) {
            this.dispatch(ActionTypes.SELECT_KEY, {
                project: project,
                key: key
            })
        }
    },
    Translations: {
        createTranslation: function (project, locale, value, keyId) {
            var cacheKey = locale+"_"+keyId;
            if (!createCalls[cacheKey]) {
                this.dispatch(ActionTypes.CREATE_TRANSLATION, {
                    project: project,
                    locale: locale,
                    value: value,
                    keyId: keyId
                });

                createCalls[cacheKey] = setTimeout(function () {
                    var translation = {
                        id: new Date().getTime(),
                        value: value,
                        locale: locale,
                        keyId: keyId
                    };
                    translation.value = lastCreateValue[cacheKey] || translation.value;

                    this.dispatch(ActionTypes.CREATE_TRANSLATION_SUCCESS, {
                        project: project,
                        translation: translation
                    });

                    delete createCalls[cacheKey];

                    if (lastCreateValue[cacheKey] && lastCreateValue[cacheKey] !== value) {
                        console.log(lastCreateValue[cacheKey]);
                        this.flux.actions.Translations.updateTranslation(project, translation, {value: lastCreateValue[cacheKey]});
                    }

                }.bind(this), 2000);
            } else {
                lastCreateValue[cacheKey] = value;
            }

        },
        updateTranslation: function (project, translation, attributes) {
            clearTimeout(updateCalls[translation.id]);
            this.dispatch(ActionTypes.UPDATE_TRANSLATION, {
                project: project,
                translation: translation,
                newAttributes: attributes
            });
            updateCalls[translation.id] = setTimeout(function () {

                var nTranslation = _.assign(translation, attributes);
                // TODO: make ajax call
                this.dispatch(ActionTypes.UPDATE_TRANSLATION_SUCCESS, {
                    project: project,
                    translation: nTranslation
                });

            }.bind(this), Math.random() * 5000);

        }

    }

};


