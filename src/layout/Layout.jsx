/** @jsx React.DOM */

var React = require('react'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Basket = require('../model/Basket');

module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('BasketStore')],

    displayName: 'Layout',

    getStateFromFlux: function () {
        var store = this.getFlux().store('BasketStore'),
            basket = store.getBasket();
        return {
            basketQuantity: basket ? Basket.getTotalQuantity(basket) : undefined
        }
    },

    render: function () {
        var basketQuantity = "";
        if (this.state.basketQuantity > 0) {
            basketQuantity = "(" + this.state.basketQuantity + ")";
        }

        return (
            <main>
                <nav>
                    <ul>
                        <li>
                            <a href="/catalog">Catalog</a>
                        </li>
                        <li>
                            <a href="/basket">Basket {basketQuantity}</a>
                        </li>
                    </ul>
                </nav>

        {this.props.children}
            </main>
        )
    }
})
