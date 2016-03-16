var _ = require('lodash');

var Article = {


    getDefaultViewId: function (article) {

        if (article && article.product) {
            return article.product.defaultValues.defaultView.id;
        }

        return null;
    }

};

module.exports = Article;