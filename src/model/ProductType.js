var _ = require('lodash');

var ProductType = {

    isSizeInAppearanceAvailable: function (productType, sizeId, appearanceId) {
        var state = _.first(productType.stockStates, function (stockState) {
            return stockState.size.id == sizeId && stockState.appearance.id == appearanceId;
        });

        if (state) {
            return state.available && state.quantity > 0;
        }
    },

    getAvailableSizesForAppearanceId: function (productType, appearanceId) {
        var sizes = [];
        _.forEach(productType.sizes, function (size) {
            if (this.isSizeInAppearanceAvailable(productType, size.id, appearanceId)) {
                sizes.push(size);
            }
        }.bind(this));

        return sizes;
    }
}


module.exports = ProductType;