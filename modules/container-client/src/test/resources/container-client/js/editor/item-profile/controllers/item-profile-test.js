describe('item-profile controller', function() {

  var scope, rootScope, ctrl;

  function mockModal() {}

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
    var profile = {
    };
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
      $provide.value('DataQueryService', mockDataQueryService);
      $provide.value('ItemService', new mockItemService());
      $provide.value('StandardQueryCreator', {});
      $provide.value('DesignerService', {
        loadAvailableComponents: function() {}
      });
      $provide.value('ProfileFormatter', {});
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

  it("should listen to itemLoaded events", function(){
    var item = {profile:{}};
    scope.$broadcast("itemLoaded", item);
    expect(scope.item).toEqual(item);
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
      id: "1",
      category: 'category',
      subject: 'blah'
    });
  });

  describe("additional copyrights", function(){
    var item = {profile:{contributorDetails:{additionalCopyrights:[]}}};

    beforeEach(function(){
      scope.$broadcast("itemLoaded", item);
    });

    it("should init with empty list", function(){
      expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
    });

    it("should add item to list", function(){
      scope.addCopyrightItem();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([{}]);
    });

    it("should remove item from list", function(){
      scope.addCopyrightItem();
      scope.addCopyrightItem();
      var copyrightItem1 = scope.contributorDetails.additionalCopyrights[0];
      var copyrightItem2 = scope.contributorDetails.additionalCopyrights[1];
      scope.removeCopyrightItem(copyrightItem1);
      expect(scope.contributorDetails.additionalCopyrights[0]).toBe(copyrightItem2);
    });

    it("should clear list", function(){
      scope.addCopyrightItem();
      scope.addCopyrightItem();
      scope.clearCopyrightItems();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
    });

    it("should add item when needAdditionalCopyrightInformation is set to 'yes'", function(){
      scope.needAdditionalCopyrightInformation = '';
      scope.$apply();
      scope.needAdditionalCopyrightInformation = 'yes';
      scope.$apply();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([{}]);
    });

    it("should clear list when needAdditionalCopyrightInformation is set to empty string", function(){
      scope.needAdditionalCopyrightInformation = 'yes';
      scope.$apply();
      scope.addCopyrightItem();
      scope.addCopyrightItem();
      scope.needAdditionalCopyrightInformation = '';
      scope.$apply();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
    });
  });


});