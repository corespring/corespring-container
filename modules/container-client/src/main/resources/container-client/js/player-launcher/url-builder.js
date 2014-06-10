function UrlBuilder() {

  this.build = function(url, params) {
    var split = url.split('?');
    var base = split[0];
    var paramsToAdd = '';
    if (split.length === 2) {
      paramsToAdd = split[1];
    }
    for (var x in params) {
      paramsToAdd += paramsToAdd === '' ? '' : '&';
      paramsToAdd += x + '=' + params[x];
    }
    return base + '?' + paramsToAdd;
  };
}

module.exports = UrlBuilder;