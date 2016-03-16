var superagent = require("superagent"),
    flow = require('flow.js').flow;


var originalParse = superagent.parse["application/json"];

superagent.parse["application/json"] = function () {
    try {
        return originalParse.apply(this, arguments);
    } catch (e) {
        return {};
    }
}


var buildArticleUrl = function (shopId, articleId) {

    var ret = ["shops", shopId, "articles"];
    if (articleId) {
        ret.push(articleId);
    }

    return ret.join("/");
}

var buildProductTypeUrl = function (shopId, productTypeId) {

    var ret = ["shops", shopId, "productTypes"];
    if (productTypeId) {
        ret.push(productTypeId);
    }

    return ret.join("/");
}

var buildBasketUrl = function (basketId) {
    var ret = ["baskets"];
    if (basketId) {
        ret.push(basketId);
    }

    return ret.join("/");
};

var buildCombinedBasketUrl = function (basketId) {
    var ret = ["combinedBaskets"];
    if (basketId) {
        ret.push(basketId);
    }

    return ret.join("/");
};

var buildBasketItemUrl = function (basketId, basketItemId) {
    var ret = ["baskets", basketId, "items"];
    if (basketItemId) {
        ret.push(basketItemId);
    }

    return ret.join("/");
};

var RestClient = {
    apiKey: "bac4047c-c9a6-4ef6-8fcf-6410f286425a",
    locale: "de_DE",
    baseUrl: "http://localhost:3000/api/v1",

    loadArticles: function (shopId, page, pageSize, cb) {
        page = parseInt(page);
        var limit = pageSize;
        var offset = (page - 1) * pageSize;

        superagent.get(this.baseUrl + "/" + buildArticleUrl(shopId))
            .query({
                mediaType: "json",
                fullData: false,
                limit: limit,
                offset: offset
            })
            .end(function (err, res) {
                cb && cb(err, res ? res.body : null);
            })
    },

    loadProductType: function (shopId, productTypeId, cb) {
        superagent.get(this.baseUrl + "/" + buildProductTypeUrl(shopId, productTypeId))
            .query({
                mediaType: "json",
                fullData: true
            })
            .end(function (err, res) {
                cb && cb(err, res ? res.body : null);
            });
    },

    loadArticle: function (shopId, articleId, cb) {
        if (!articleId) {
            cb && cb("NO ARTICLE ID");
            return;
        }

        var url = this.baseUrl + "/" + buildArticleUrl(shopId, articleId);
        superagent.get(url)
            .query({
                mediaType: "json",
                fullData: true
            })
            .end(function (err, res) {
                // TODO: add caching
                cb && cb(err, res ? res.body : null);
            });

    },

    loadCombinedBasket: function (basketId, cb) {
        if (!basketId) {
            cb && cb("NO BASKET ID");
            return;
        }

        var url = this.baseUrl + "/" + buildCombinedBasketUrl(basketId);
        superagent.get(url)
            .query({
                mediaType: "json",
                fullData: true,
                apiKey: this.apiKey,
                locale: this.locale
            })
            .end(function (err, res) {
                // TODO: add caching
                cb && cb(err, res ? res.body : null);
            });
    },

    loadBasket: function (basketId, cb) {
        if (!basketId) {
            cb && cb("NO BASKET ID");
            return;
        }

        var url = this.baseUrl + "/" + buildBasketUrl(basketId);
        superagent.get(url)
            .query({
                mediaType: "json",
                locale: this.locale,
                apiKey: this.apiKey
            })
            .end(function (err, res) {
                // TODO: add caching
                cb && cb(err, res ? res.body : null);
            });
    },

    createBasket: function (cb) {

        var url = this.baseUrl + "/" + buildBasketUrl();

        superagent.post(url, {
            currency: {id: "1"},
            shop: {id: "205909"}
        })
            .query({
                mediaType: "json",
                apiKey: this.apiKey,
                locale: this.locale
            })
            .end(function (err, res) {
                cb && cb(err, res ? res.body : null);
            })

    },

    createBasketItem: function (basketId, basketItem, cb) {
        var url = this.baseUrl + "/" + buildBasketItemUrl(basketId);

        superagent.post(url, basketItem)
            .query({
                mediaType: "json",
                apiKey: this.apiKey,
                method: "POST",
                locale: this.locale
            })
            .end(function (err, res) {
                cb && cb(err, res ? res.body : null);
            });

    },

    updateBasketItem: function (basketId, basketItem, cb) {
        var url = this.baseUrl + "/" + buildBasketItemUrl(basketId, basketItem.id);

        superagent
            .post(url, basketItem)
            .query({
                mediaType: "json",
                apiKey: this.apiKey,
                method: "PUT",
                locale: this.locale
            })
            .end(function (err, res) {
                cb && cb(err, res ? res.body : null);
            });

    },

    removeBasketItem: function (basketId, basketItem, cb) {

        var url = this.baseUrl + "/" + buildBasketItemUrl(basketId, basketItem.id);

        superagent
            .post(url)
            .query({
                mediaType: "json",
                apiKey: this.apiKey,
                method: "DELETE",
                locale: this.locale
            })
            .end(function (err, res) {
                cb && cb(err, res ? res.body : null);
            });

    },

    saveBasket: function (payload, cb) {

    }


};

module.exports = RestClient;