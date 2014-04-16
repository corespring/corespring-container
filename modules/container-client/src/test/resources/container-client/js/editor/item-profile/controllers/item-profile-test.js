describe('item-profile controller', function() {

  var rootScope, ctrl;

  function mockModal() {
  }

  function mockDesignerService() {

    var item = {};

    var availableComponents = [];

    this.loadItem = function(id, callback) {
      callback(item);
    };

    this.loadAvailableComponents = function(onSuccess, onError) {
      onSuccess(availableComponents);
    };
  }

  function mockItemService() {
    var profile = {};
    this.load = function(id, onSuccess) {
      onSuccess({
        profile: profile
      });
    };
  }

  function MockDataQueryService() {

    this.results = [];

    this.query = function(topic, term, callback) {
      callback(this.results);
    };

    this.findOne = function(topic, id, callback) {
      callback(this.results[0]);
    };

    this.list = function(topic, callback) {
      callback(this.results);
    };
  }

  var mockDataQueryService = new MockDataQueryService();

  function mockComponentRegister() {}

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(function() {
    module(function($provide) {
      //$provide.value('ProfileService', new mockProfileService());
      $provide.value('DataQueryService', mockDataQueryService);
      $provide.value('ItemService', new mockItemService());
    });
  });

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    try {
      ctrl = $controller('ItemProfile', {
        $scope: scope
      });
    } catch (e) {
      throw ("Error with the controller: " + e);
    }
  }));

  it('should init', function() {
    expect(ctrl).toNotBe(null);
  });

  it('should handle subject queries', function() {

    var queryResult;

    var query = {
      term: "blah",
      callback: function(success) {
        queryResult = success.results;
      }
    };

    mockDataQueryService.results = [{
      id: "1",
      category: "category",
      subject: "blah"
    }];

    scope.primarySubjectAsync.query(query);
    expect(queryResult).toNotBe(null);
    expect(queryResult.length).toEqual(1);
    expect(queryResult[0]).toEqual(mockDataQueryService.results[0]);
  });

  it("should init selection with a local result", function() {

    var foundSubject;

    //override element to val...
    scope.primarySubjectAsync.elementToVal = function(e) {
      return "1";
    };

    scope.queryResults.primarySubject = [{
      id: "1"
    }];

    var element = {};

    function initCallback(s) {
      foundSubject = s;
    }

    scope.primarySubjectAsync.initSelection(element, initCallback);
    expect(foundSubject).toNotBe(undefined);
    expect(foundSubject).toEqual({
      id: "1", category: 'category', subject: 'blah'
    });
  });

});