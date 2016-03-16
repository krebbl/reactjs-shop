var _ = require('lodash');



var Basket = {
    getPropertyValue: function(basketItem, key){
        if(basketItem){
            var ret = _.find(basketItem.element.properties, function (prop) {
                return prop.key == key;
            })
            return ret ? ret.value : null;
        }

        return null;
    },
    getAppearanceId: function (basketItem) {
        return this.getPropertyValue(basketItem, "appearance");
    },
    getSizeId: function (basketItem) {
        return this.getPropertyValue(basketItem, "size");
    },
    getSizeLabel: function (basketItem) {
        return this.getPropertyValue(basketItem, "sizeLabel");
    }
}


module.exports = Basket;