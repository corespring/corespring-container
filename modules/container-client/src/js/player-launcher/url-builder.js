function UrlBuilder() {

  this.build = function(url, params) {
    var split = url.split('?');
    var base = split[0];
    var paramsToAdd = '';
    if (split.length === 2) {
      paramsToAdd = split[1];
    }
    var kv = [];

    for (var x in params) {
      if(params[x]){
        kv.push(x + '=' + params[x]);
      }
    }
    paramsToAdd += (paramsToAdd === '') ? '' : '&';
    paramsToAdd += kv.join('&'); 
    return base + '?' + paramsToAdd;
  };
}

module.exports = UrlBuilder;