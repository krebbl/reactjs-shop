/** @jsx React.DOM */

var React = require('react'),
    Fluxxor = require("fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin,
    Layout = require('./layout/Layout'),
    BasketItem = require("./model/BasketItem"),
    Article = require('./model/Article');


module.exports = React.createClass({
    mixins: [FluxMixin, StoreWatchMixin('BasketStore')],

    displayName: 'Basket',

    getInitialState: function () {
        return {};
    },

    getStateFromFlux: function () {
        var store = this.getFlux().store('BasketStore'),
            state = store.getState();

        //return basket instanceof Function ? {loaded: false} : {basket: basket} || {};

        return state;
    },

    setStateForParams: function (params) {
        if (!module.parent) {
            var state = this.getFlux().stores.BasketStore.getBasket();
            if (state instanceof Function) {
                this.setState({loaded: false});
                state();
            } else {
                this.setState(state || {});
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
        console.log(nextProps);
        this.setStateForParams(nextProps.params);
    },

    _updateQuantity: function (item, event) {
        if (event.which == 13) {
            var quantity = parseInt(event.target.value);
            if (quantity) {
                this.getFlux().actions.Basket.changeQuantity(this.state.basket.id, item, quantity);
            }
        }
    },

    onChangeQuantity: function (item, event) {
        var quantity = parseInt(event.target.value);
        if (quantity) {
            item.quantity = quantity;
        }
    },

    _removeItem: function (item) {
        this.getFlux().actions.Basket.removeBasketItem(this.state.basket.id, item);
    },

    render: function () {
        var items = {},
            self = this;
        var basket = this.state.basket,
            basketStore = this.getFlux().stores.BasketStore,
            loading = true,
            price = "";

        if (basket && !this.state.loading) {
            loading = false;
            var basketItems = basket.basketItems;

            basketItems.forEach(function (item) {
                var element = basketStore.getElementForBasketItem(item);
                var appearanceId = BasketItem.getAppearanceId(item),
                    sizeId = BasketItem.getSizeId(item),
                    viewId = Article.getDefaultViewId(element);


                items['item-' + item.id] = <tr>
                    <td>
                        <img ref="img" onLoad={this.removeClass} src={element.resources[0].href.replace(/views\/(\d+)/, "views/" + viewId) + ",appearanceId=" + appearanceId + ",width=200,height=200"}/>
                    </td>
                    <td>
                    Size: {BasketItem.getSizeLabel(item)}
                    </td>
                    <td>

                    Quantity:
                        <input type="text" defaultValue={item.quantity} onKeyUp={this._updateQuantity.bind(this, item)} />
                    {item.quantity}
                    </td>
                    <td>
                        <button onClick={this._removeItem.bind(this, item)}>X</button>
                    </td>
                </tr>;
            }.bind(this));
            if (!this.state.updatingPrice) {
                price = (<div>
                Price: {basket.priceTotal.display}
                </div>);
            } else {
                price = "Updating Price";
            }

//<img src={result.resources[0].href}/>
        }

        return (
            <Layout>
                <h1>Basket</h1>

                {loading ? "Loading" : ""}
                <table>
                    <tbody>
                        {items}
                    </tbody>
                </table>
                {price}
            </Layout>
        )
    },

    statics: {
        getMetadata: function () {
            return {
                title: 'Basket'
            }
        },
        loadData: function (flux, params) {
            return null;
            //return flux.stores.BasketStore.getBasket(params.basketId);
        }
    }
})
