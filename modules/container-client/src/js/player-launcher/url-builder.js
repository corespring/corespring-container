function UrlBuilder(baseUrl) {

  var url = baseUrl;

  this.params = function(params) {
    var split = url.split('?');
    var base = split.shift();
    var paramsToAdd = split.join('?');

    var kv = [];
    for (var x in params) {
      if(params[x]){
        kv.push(x + '=' + params[x]);
      }
    }
    paramsToAdd += (paramsToAdd === '') ? '' : '&';
    paramsToAdd += kv.join('&');
    url = base + ((paramsToAdd !== '') ? '?' + paramsToAdd : '');
    return this;
  };

  this.interpolate = function(placeholder, value) {
    placeholder = placeholder.startsWith(":") ? placeholder : (":" + placeholder);
    url = url.replace(placeholder, value);
    return this;
  };

  this.hash = function(hash) {
    if (hash) {
      url = url + ("#" + hash);
    }
    return this;
  };

  this.build = function() {
    return url;
  };

}

module.exports = UrlBuilder;