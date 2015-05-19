describe('UrlBuilder', function() {

  var UrlBuilder = new corespring.require("url-builder");

  var baseUrl = "http://localhost:9000";

  describe('init', function() {

    it('should set the url as the base', function() {
      expect(new UrlBuilder(baseUrl).build()).toEqual(baseUrl);
    });

  });

  describe('params', function() {

    var params = { these: 'are', my: 'params' };

    it('should append query parameters to url', function() {
      var queryString = _.chain(params).keys().map(function(key) {
        return key + "=" + params[key];
      }).value().join("&");

      var url = new UrlBuilder(baseUrl).params(params).build();
      expect(url).toEqual(baseUrl + "?" + queryString);
    });

  });

  describe('interpolate', function() {

    var id = ":itemId";
    var baseUrl = "http://localhost:9000/player/item/" + id + "/";
    var value = "554a2e07b92ce52b7e3acbba";

    it('should replace parameter with value', function() {
      var url = new UrlBuilder(baseUrl).interpolate(id, value).build();
      expect(url).toEqual(baseUrl.replace(id, value));
    });

    describe("without leading colon", function() {
      var id = "itemId";

      it('should replace parameter with value', function() {
        var url = new UrlBuilder(baseUrl).interpolate(id, value).build();
        expect(url).toEqual(baseUrl.replace(":" + id, value));
      });

    });

  });

  describe('hash', function() {
    var hash = "hash-value";

    it('should append hash value to URL after #', function() {
      var url = new UrlBuilder(baseUrl).hash(hash).build();
      expect(url).toEqual(baseUrl + "#" + hash);
    });

    describe('value is undefined', function() {
      var hash;

      it('should not append anything to URL', function() {
        var url = new UrlBuilder(baseUrl).hash(hash).build();
        expect(url).toEqual(baseUrl);
      });

    });

  });

});
