var _ = require('lodash');

var Basket = {

    getTotalQuantity: function (basket) {
        if(basket){
            var quantity = 0;
            _.forEach(basket.basketItems, function (item) {
                quantity += item.quantity;
            })
            return quantity;
        }
        return null;
    }
}


module.exports = Basket;