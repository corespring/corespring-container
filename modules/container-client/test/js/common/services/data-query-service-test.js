describe('DataQueryService', function() {

  var dataQueryService, mockData = {here: 'is', mock: 'data'};
  var http = jasmine.createSpy('$http').and.returnValue({
    success: function(fn) {
      fn(mockData);
      return { error: function() {} };
    }
  });
  var success = jasmine.createSpy('success');
  var topic = 'items';

  var baseUrl = '../../../data-query/';

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(module(function($provide) {
    $provide.value('$http', http);
  }));

  beforeEach(inject(function(DataQueryService) {
    dataQueryService = DataQueryService;
  }));

  afterEach(function() {
    http.calls.reset();
    success.calls.reset();
  });

  describe('list', function() {

    beforeEach(function() {
      dataQueryService.list(topic, success);
    });

    it('should call $http', function() {
      expect(http).toHaveBeenCalledWith({
        method: 'GET',
        url: baseUrl + topic
      });
    });

    it('should call the success function with provided data', function() {
      expect(success).toHaveBeenCalledWith(mockData);
    });

  });

  describe('query', function() {
    var query = {'description' : 'some & item'};
    var stringifiedQuery = '{"description":"some & item"}';
    var uriEncodedQuery = '%7B%22description%22%3A%22some%20%26%20item%22%7D';

    beforeEach(function() {
      spyOn(JSON, 'stringify').and.returnValue(stringifiedQuery);
      spyOn(window, 'encodeURIComponent').and.returnValue(uriEncodedQuery);

      dataQueryService.query(topic, query, success);
    });

    it('should make an http GET request', function() {
      expect(http).toHaveBeenCalledWith({
        method: 'GET',
        url: jasmine.any(String)
      });
    });

    it('should stringify and URI encode query parameter in HTTP request', function() {
      expect(JSON.stringify).toHaveBeenCalledWith(query);
      expect(window.encodeURIComponent).toHaveBeenCalledWith(stringifiedQuery);

      expect(http).toHaveBeenCalledWith({
        method: jasmine.any(String),
        url: baseUrl + topic + '?query=' + uriEncodedQuery
      });
    });

    it('should call the success function with provided data', function() {
      expect(success).toHaveBeenCalledWith(mockData);
    });

  });

  describe('findOne', function() {
    var id = 1234;

    beforeEach(function() {
      dataQueryService.findOne(topic, id, success);
    });

    it('should call $http', function() {
      expect(http).toHaveBeenCalledWith({
        method: 'GET',
        url: baseUrl + topic + '/' + id
      });
    });

    it('should call the success function with provided data', function() {
      expect(success).toHaveBeenCalledWith(mockData);
    });

  });

  describe('createQuery', function() {
    var searchTerm = 'this is a search term';
    var fields = 'these are fields';
    var filters = {
      these: 'are', the: 'filters'
    };

    describe('with searchTerm', function() {

      it('should return searchTerm', function() {
        expect(dataQueryService.createQuery(searchTerm)).toEqual({
          searchTerm: searchTerm
        });
      });

    });

    describe('with fields', function() {
      it('should return fields', function() {
        expect(dataQueryService.createQuery(undefined, fields)).toEqual({
          fields: fields
        });
      });
    });

    describe('with filters', function() {
      it('should return filters', function() {
        var expandedFilters = (function() {
          var expanded = [];
          for (var key in filters) {
            expanded.push({field: key, value: filters[key]});
          }
          return expanded;
        })();
        expect(dataQueryService.createQuery(undefined, undefined, filters)).toEqual({
          filters: expandedFilters
        });
      });
    });

  });

});