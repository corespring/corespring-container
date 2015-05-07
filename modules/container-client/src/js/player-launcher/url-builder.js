/**
 * Using the builder pattern, this method provides several methods for building a URL.
 */
function UrlBuilder(baseUrl) {

  var url = baseUrl;

  /**
   * Converts a parameters object to a query string, and appends this to the URL.
   */
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

  /**
   * Replaces a colon-prefixed placeholder in the URL with a specified value.
   */
  this.interpolate = function(placeholder, value) {
    if (typeof placeholder === 'string') {
      placeholder = (placeholder[0] === ":") ? placeholder : (":" + placeholder);
      url = url.replace(placeholder, value);
    }
    return this;
  };

  /**
   * Appends a hash to the URL.
   */
  this.hash = function(hash) {
    if (hash) {
      url = url + ("#" + hash);
    }
    return this;
  };

  /**
   * Returns the current value of the mutable URL.
   */
  this.build = function() {
    return url;
  };

}

module.exports = UrlBuilder;