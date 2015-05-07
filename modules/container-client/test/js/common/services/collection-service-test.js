describe('CollectionService', function() {

  var collectionService, mockData = {here: 'is', mock: 'data'};
  var http = jasmine.createSpy('$http').and.returnValue({
    success: function(fn) {
      fn(mockData);
      return { error: function() {} };
    }
  });
  var success = jasmine.createSpy('success');

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(module(function($provide) {
    $provide.value('$http', http);
  }));

  beforeEach(inject(function(CollectionService) {
    collectionService = CollectionService;
  }));

  afterEach(function() {
    http.calls.reset();
    success.calls.reset();
  });

  describe('list', function() {

    beforeEach(function() {
      collectionService.list(success);
    });

    it('should call $http', function() {
      expect(http).toHaveBeenCalledWith({
        method: 'GET',
        url: '../../collection'
      });
    });

    it('should call the success function with provided data', function() {
      expect(success).toHaveBeenCalledWith(mockData);
    });

  });

});