function UrlBuilder() {

  this.build = function(url, params) {
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
    return base + ((paramsToAdd !== '') ? '?' + paramsToAdd : '');
  };
}

module.exports = UrlBuilder;