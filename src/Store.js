'use strict';

var superagent = require('superagent'),
    flat = require('flat');

var Store = module.exports = function(data) {
  this.data = data || {}
}

Store.prototype.get = function(request) {
  return this.getKey(this.generateCacheKey(request))
}

Store.prototype.set = function(request, value) {
  var key = this.generateCacheKey(request);
  if (value !== undefined) {
    this.data[key] = value
  } else {
    delete this.data[key]
  }
}

Store.prototype.fetch = function(request, callback) {
  return this.fetchRequest(request, callback);
}

Store.prototype.getKey = function(key, query) {
  return this.data[key]
}

Store.prototype.generateCacheKey = function(request){
  var flatRequest = flat.flatten(request);
  var keys = Object.keys(flatRequest);
  keys.sort(function(a,b){
    return a > b ? 1 : -1;
  });
  var cacheKey = [];
  for (var i = 0; i < keys.length; i++) {
    cacheKey.push(keys[i],flatRequest[keys[i]]);
  }

  return cacheKey.join("_");

};

Store.prototype.fetchRequest = function(request, callback) {
  var url = request.url,
      query = request.query || {},
      self = this;

  superagent(url)
        .query(query)
        .end(function (err, res) {
            if (err) return callback(err);
            self.set(request, res.body);
            callback(null, res.body)
        });
}

Store.prototype.loadCache = function(data) {
  this.data = data
}

Store.prototype.clearCache = function() {
  this.data = {}
}

Store.prototype.toJSON = function() {
  return JSON.stringify(this.data)
}
