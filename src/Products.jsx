/** @jsx React.DOM */

var React = require('react'),
    Layout = require('./layout/Layout')

function fetchData(params, query) {
  params = params || {};
  query = query || {};

  var page = Math.max(parseInt(query.p) || 1,1),
      pageSize = 20;


  // 'http://localhost:3000/api/v1/shops/205909/products?mediaType=json&limit=10'
  var limit = page * pageSize;
  var offset = (page-1) * pageSize;
  var queryString =["mediaType=json","limit="+limit,"offset="+offset].join("&");

  return {
    products: 'http://localhost:3000/api/v1/shops/205909/articles'
  }
}

module.exports = React.createClass({
  displayName: 'Products',

  getInitialState: function() {
    var p =  this.props.store.get(fetchData());
    var loading = false;
    if(!p){
      return {
        loading: true,
        products: [],
        count: 0
      }
    } else {

      return {
        page: 1,
        products: p.products.articles,
        count: p.products.count
      }

    }

  },

  loadMissingData: function() {
    if (!this.state.data) {
      this.props.store.fetch(fetchData(), function(err, data) {
        this.setState({
          products: data.products.articles,
          count: data.products.count
        })
      }.bind(this))
    }
  },

  componentWillMount: function() {
    this.loadMissingData()
  },

  handleClick: function() {
    this.setState({
      count: this.state.count + 1
    })
  },

  clickOnArticle: function(article){
     console.log(article)
  },

  render: function() {
    console.log(this.props);
    var items = {},
        self = this;
    this.state.products.forEach(function(result){
         items['result-' + result.id] = <li onDoubleClick={self.clickOnArticle.bind(self, result)}><img src={result.resources[0].href}/>{result.name}</li>;
    });

    return (
      <Layout>
        <h1>Products</h1>

        <button onClick={this.handleClick}>Click me to increment: {this.state.count}!</button>

        <ul>
          {items}
        </ul>
      </Layout>
    )
  },

  statics: {
    getMetadata: function() {
      return {
        title: 'Products'
      }
    },
    fetchData: fetchData
  }
})
