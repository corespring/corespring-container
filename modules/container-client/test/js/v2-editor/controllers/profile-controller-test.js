describe('profile controller', function() {

  var scope, rootScope, controller, ctrl;


  function MockModal() {}

  function MockDesignerService() {
    this.loadAvailableUiComponentsResult = {interactions:[], widgets:[]};

    this.loadAvailableUiComponents = function(onSuccess, onError) {
      onSuccess(this.loadAvailableUiComponentsResult);
    };
  }

  function MockItemService() {
    this.loadResult = {profile:{}};

    this.load = function(onSuccess) {
      onSuccess(this.loadResult);
    };

    this.fineGrainedSaveResult = "OK";
    this.fineGrainedSaveCalls = [];

    this.fineGrainedSave = function(data, callback){
      this.fineGrainedSaveCalls.push(arguments);
      callback(this.fineGrainedSaveResult);
    };
  }

  function MockLogFactory(){
    this.getLogger = function(id){
      return {
        log: function(){},
        error: function(){}
      };
    };
  }

  function MockDataQueryService() {
    this.queryResult = [];

    this.query = function(topic, term, callback) {
      callback(this.queryResult);
    };

    this.findOneResult = {};

    this.findOne = function(topic, id, callback) {
      callback(this.findOneResult);
    };

    this.listResult = [];

    this.list = function(topic, callback) {
      callback(this.listResult);
    };
  }


  var mockDesignerService = new MockDesignerService();
  var mockItemService = new MockItemService();
  var mockDataQueryService = new MockDataQueryService();

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('throttle', _.identity);
      $provide.value('DataQueryService', mockDataQueryService);
      $provide.value('DesignerService', mockDesignerService);
      $provide.value('ItemService', mockItemService);
      $provide.value('LogFactory', new MockLogFactory());
      $provide.value('StandardQueryCreator', {});
      $provide.value('ProfileFormatter', {});
    });
  });

  beforeEach(inject(function($rootScope, $controller) {
    ctrl = null;
    scope = null;
    rootScope = $rootScope;
    controller = $controller;
  }));

  function makeProfileController(){
    scope = rootScope.$new();
    try {
      ctrl = controller('ProfileController', {
        $scope: scope
      });
    } catch (e) {
      throw ("Error with the controller: " + e);
    }
  }

  describe("init", function(){
    beforeEach(makeProfileController);

    it('should init', function() {
      expect(ctrl).toNotBe(null);
    });

    it("loads item on init", function(){
      expect(scope.item).toEqual(mockItemService.loadResult);
    });

    it("initialises empty sub-properties", function() {
      expect(scope.item.profile.taskInfo).toEqual({});
      expect(scope.item.profile.otherAlignments).toEqual({keySkills: []});
      expect(scope.item.profile.contributorDetails).toEqual({
        licenseType: 'CC BY',
        copyrightYear: new Date().getFullYear().toString(),
        additionalCopyrights: []
      });
    });

    it("creates shortcuts to sub-objects", function() {
      expect(scope.item.profile).toEqual(scope.profile);
      expect(scope.item.profile.taskInfo).toEqual(scope.taskInfo);
      expect(scope.item.profile.otherAlignments).toEqual(scope.otherAlignments);
      expect(scope.item.profile.contributorDetails).toEqual(scope.contributorDetails);
    });
  });

  describe("additional copyrights", function(){
    it("should init with empty list", function(){
      makeProfileController();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
    });

    it("should remove empty items", function(){
      mockItemService.loadResult = {profile: {contributorDetails: {additionalCopyrights: [{}]}}};
      makeProfileController();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
    });

    it("should not remove items with content", function(){
      mockItemService.loadResult = {profile: {contributorDetails: {additionalCopyrights: [{author: "Albert Einstein"}]}}};
      makeProfileController();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([{author: "Albert Einstein"}]);
    });
  });

  describe("save", function(){
    beforeEach(function(){
      makeProfileController();
      scope.$apply();
      mockItemService.fineGrainedSaveCalls = [];
    });
    it("is triggered when a property of profile is changed", function(){
      scope.item.profile.someProperty = "some value";
      scope.$apply();
      expect(mockItemService.fineGrainedSaveCalls.length).toEqual(1);
    });
    it("is not triggered when a property of item is changed", function(){
      scope.item.someProperty = "some value";
      scope.$apply();
      expect(mockItemService.fineGrainedSaveCalls.length).toEqual(0);
    });
  });

  describe("getLicenseTypeUrl", function(){
    beforeEach(makeProfileController);
    it("returns undefined if licenseType is empty", function(){
      expect(scope.getLicenseTypeUrl("")).toEqual(undefined);
    });
    it("returns licenseType url if licenseType is string", function(){
      expect(scope.getLicenseTypeUrl("CC")).toEqual("/assets/images/licenseTypes/CC.png");
    });
  });

  describe("getKeySkillsSummary", function(){
    beforeEach(makeProfileController);
    it("can handle zero key skills", function(){
      expect(scope.getKeySkillsSummary([])).toEqual("No Key Skills selected")
    });
    it("can handle one key skill", function(){
      expect(scope.getKeySkillsSummary([1])).toEqual("1 Key Skill selected")
    });
    it("can handle multiple key skills", function(){
      expect(scope.getKeySkillsSummary([1,2,3])).toEqual("3 Key Skills selected")
    });
  });

  describe("reviewsPassed",function(){
    var itemOne,itemTwo,itemOther,itemNone,itemAll,reviewsPassedItems;

    beforeEach(function(){
      function item(id) {
        return {key: id, selected: false}
      }
      itemOne = item("one");
      itemTwo = item("two");
      itemOther = item("Other");
      itemNone = item("None");
      itemAll = item("All");
      reviewsPassedItems = [itemOne, itemTwo, itemOther, itemNone, itemAll];
      mockDataQueryService.listResult = reviewsPassedItems;
      makeProfileController();
    });

    it("should init the dataProvider", function(){
      expect(scope.reviewsPassedDataProvider).toEqual(reviewsPassedItems);
    });

    it("initially no item is selected", function(){
      expect(scope.profile.reviewsPassed).toEqual([]);
    });

    it("should select items", function(){
      itemOne.selected = true;
      scope.onChangeReviewsPassed("one");
      expect(scope.profile.reviewsPassed).toEqual(['one']);
    });

    it("should deselect items", function(){
      itemOne.selected = true;
      scope.onChangeReviewsPassed("one");
      itemTwo.selected = true;
      scope.onChangeReviewsPassed("two");
      itemOne.selected = false;
      scope.onChangeReviewsPassed("one");
      expect(scope.profile.reviewsPassed).toEqual(['two']);
    });

    it("should remove all items when 'None' is selected", function(){
      itemOne.selected = true;
      scope.onChangeReviewsPassed("one");
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      itemNone.selected = true;
      scope.onChangeReviewsPassed("None");
      expect(scope.profile.reviewsPassed).toEqual(['None']);
    });

    it("should add all items apart from 'Other' when 'All' is selected", function(){
      itemAll.selected = true;
      scope.onChangeReviewsPassed("All");
      expect(scope.profile.reviewsPassed).toEqual(['one','two','All']);
    });

    it("should not remove 'Other' when 'All' is selected", function(){
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      itemAll.selected = true;
      scope.onChangeReviewsPassed("All");
      expect(scope.profile.reviewsPassed).toEqual(['one','two','Other','All']);
    });

    it("should replace 'None' with all items when 'All' is selected", function(){
      itemNone.selected = true;
      scope.onChangeReviewsPassed("None");
      expect(scope.profile.reviewsPassed).toEqual(['None']);
      itemAll.selected = true;
      scope.onChangeReviewsPassed("All");
      expect(scope.profile.reviewsPassed).toEqual(['one','two','All']);
    });

    it('selecting "Other" reveals input',function(){
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      scope.$apply();
      expect(scope.isReviewsPassedOtherSelected).toEqual(true);
    });

    it('selecting "Other" clears model',function(){
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      scope.profile.reviewsPassedOther = "Some other review";
      scope.$apply();
      expect(scope.profile.reviewsPassedOther).toEqual("Some other review");

      itemOther.selected = false;
      scope.onChangeReviewsPassed("Other");
      scope.$apply();
      expect(scope.profile.reviewsPassedOther).toEqual("");
    });
  });

  describe('priorUse',function(){
    var itemOne,itemTwo,itemOther;

    beforeEach(function(){
      function item(id) {
        return {key: id, selected: false};
      }
      itemOne = item("one");
      itemTwo = item("two");
      itemOther = item("Other");
      priorUseItems = [itemOne, itemTwo, itemOther];
      mockDataQueryService.listResult = priorUseItems;
      makeProfileController();
    });

    it("should init the dataProvider", function(){
      expect(scope.priorUseDataProvider).toEqual(priorUseItems);
    });

    it("selecting 'Other' reveals input", function(){
      scope.profile.priorUse = "Other";
      scope.$apply();
      expect(scope.isPriorUseOtherSelected).toEqual(true);
    });

    it("deselecting 'Other' clears model", function(){
      scope.profile.priorUse = "Other";
      scope.profile.priorUseOther = "Some prior use";
      scope.$apply();
      expect(scope.profile.priorUseOther).toEqual("Some prior use");

      scope.profile.priorUse = "";
      scope.$apply();
      expect(scope.profile.priorUseOther).toEqual("");
    });
  });

  describe('keySkills',function(){
    beforeEach(function(){
      function item(id){
        return {key:id, value:id};
      }
      mockDataQueryService.listResult = [item(1),item(2),item(3)];
      makeProfileController();
    });

    it("should init dataProvider",function(){
      function tagListItem(id){
        return {header:id, list:id};
      }
      expect(scope.keySkillsDataProvider).toEqual([tagListItem(1),tagListItem(2),tagListItem(3)]);
    });
  });

  describe('depthOfKnowledge',function(){
    beforeEach(function(){
      mockDataQueryService.listResult = [1,2,3];
      makeProfileController();
    });

    it("should init dataProvider",function(){
      expect(scope.depthOfKnowledgeDataProvider).toEqual([1,2,3]);
    });
  });

  describe('licenseTypes',function(){
    beforeEach(function(){
      mockDataQueryService.listResult = [1,2,3];
      makeProfileController();
    });

    it("should init dataProvider",function(){
      expect(scope.licenseTypeDataProvider).toEqual([1,2,3]);
    });
  });

  describe("primarySubjectSelect2Adapter", function(){

    beforeEach(makeProfileController);

    it('should handle subject queries', function() {

      var queryResult;

      var query = {
        term: "blah",
        callback: function(success) {
          queryResult = success.results;
        }
      };

      mockDataQueryService.queryResult = [{
        id: "1",
        category: "category",
        subject: "blah"
      }];

      scope.primarySubjectSelect2Adapter.query(query);
      expect(queryResult).toEqual(mockDataQueryService.queryResult);
    });

    it("should init selection with a cached result", function() {

      //add item to queryResults cache
      scope.queryResults['subjects.primary'] = [{
        id: "1",
        category: "category",
        subject: "blah"
      }];

      //override element to val to return the id of the item that should be found
      scope.primarySubjectSelect2Adapter.elementToVal = function(e) {
        return "1";
      };

      var domElement = {};
      var foundSubject = "not found";

      scope.primarySubjectSelect2Adapter.initSelection(domElement, function(s) {
        foundSubject = s;
      });

      expect(foundSubject).toEqual({
        id: "1",
        category: 'category',
        subject: 'blah'
      });
    });
  });


});