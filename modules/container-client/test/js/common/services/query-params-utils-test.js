describe('query-params-utils', function(){

  var Utils;

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(module(function($provide) {
    $provide.value('QUERY_PARAMS', { 
      a: 'a',
      b: 'b'
    });
  }));

  beforeEach(inject(function(QueryParamUtils) {
    Utils = QueryParamUtils;
  }));

  describe('addQueryParams', function(){

    it('returns the path with the params', function(){
      expect(Utils.addQueryParams('path')).toEqual('path?a=a&b=b');
    });
    
    it('strips the path of any params before adding the params', function(){
      expect(Utils.addQueryParams('path?z=z')).toEqual('path?a=a&b=b');
    });
    
    it('adds the params to an empty string if path is undefinedr', function(){
      expect(Utils.addQueryParams()).toEqual('?a=a&b=b');
    });
  });
});