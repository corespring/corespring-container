describe('MetadataService', function() {

  var 
    metadataService, 
    queryParamUtils,
    mockData = {here: 'is', mock: 'data'};

  var http = jasmine.createSpy('$http').and.returnValue({
    success: function(fn) {
      fn(mockData);
      return { error: function() {} };
    }
  });
  
  var success = jasmine.createSpy('success');

  var metadataPath = 'metadata-path';

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(module(function($provide) {

    queryParamUtils = org.corespring.mocks.editor.QueryParamUtils();

    $provide.value('$http', http);
    $provide.constant('STATIC_PATHS', { metadata: metadataPath});
    $provide.value('QueryParamUtils', queryParamUtils);
  }));

  beforeEach(inject(function(MetadataService) {
    metadataService = MetadataService;
  }));

  afterEach(function() {
    http.calls.reset();
    success.calls.reset();
  });

  describe('get', function() {

    beforeEach(inject(function($rootScope) {
      metadataService.get("id").then(success);
      $rootScope.$apply();
    }));

    it('should call $http', function() {
      expect(http).toHaveBeenCalledWith({
        method: 'GET',
        url: metadataPath
      });
    });

    it('calls QueryParamUtils.addQueryParams', function(){
      expect(queryParamUtils.addQueryParams).toHaveBeenCalledWith(metadataPath);
    });

    it('should call the success function with provided data', function() {
      expect(success).toHaveBeenCalledWith(mockData);
    });

  });

});