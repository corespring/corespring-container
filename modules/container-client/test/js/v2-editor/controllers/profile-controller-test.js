describe('profile controller', function () {

  var scope, rootScope, controller, ctrl;


  function MockModal() {
  }

  function MockDesignerService() {
    this.loadAvailableUiComponentsResult = {interactions: [], widgets: []};

    this.loadAvailableUiComponents = function (onSuccess, onError) {
      onSuccess(this.loadAvailableUiComponentsResult);
    };
  }

  function MockItemService() {
    this.loadResult = {profile: {}};

    this.load = function (onSuccess) {
      onSuccess(this.loadResult);
    };

    this.fineGrainedSaveResult = "OK";
    this.fineGrainedSaveCalls = [];

    this.fineGrainedSave = function (data, callback) {
      this.fineGrainedSaveCalls.push(arguments);
      callback(this.fineGrainedSaveResult);
    };
  }

  function MockLogFactory() {
    this.getLogger = function (id) {
      return {
        log: function () {
        },
        warn: function () {
        },
        error: function () {
        }
      };
    };
  }

  function MockDataQueryService() {
    this.queryResult = [];

    this.query = function (topic, term, callback) {
      callback(this.queryResult);
    };

    this.findOneResult = {};

    this.findOne = function (topic, id, callback) {
      callback(this.findOneResult);
    };

    this.listResult = [];

    this.list = function (topic, callback) {
      callback(this.listResult);
    };
  }

  function MockProfileFormatter() {
    this.componentTypesUsedResult = "OK";
    this.componentTypesUsed = function (components, availableComponents) {
      return this.componentTypesUsedResult;
    }
  }

  function MockStandardQueryCreator() {
    this.createStandardQueryArguments = [];
    this.createStandardQuery = function (search, subject, category, subCategory) {
      this.createStandardQueryArguments.push({
        search: search,
        subject: subject,
        category: category,
        subCategory: subCategory
      });
    };
  }

  function MockLocation() {
    this.searchResult = {};
    this.search = function () {
      return this.searchResult;
    };

    this.hashResult = {};
    this.hash = function () {
      return this.hashResult;
    };
  }

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  var mockLocation, mockDesignerService, mockItemService,
    mockDataQueryService, mockProfileFormatter, mockStandardQueryCreator;

  beforeEach(function () {
    mockLocation = new MockLocation();
    mockDesignerService = new MockDesignerService();
    mockItemService = new MockItemService();
    mockDataQueryService = new MockDataQueryService();
    mockProfileFormatter = new MockProfileFormatter();
    mockStandardQueryCreator = new MockStandardQueryCreator();

    module(function ($provide) {
      $provide.value('$location', mockLocation)
      $provide.value('throttle', _.identity);
      $provide.value('DataQueryService', mockDataQueryService);
      $provide.value('DesignerService', mockDesignerService);
      $provide.value('ItemService', mockItemService);
      $provide.value('LogFactory', new MockLogFactory());
      $provide.value('StandardQueryCreator', mockStandardQueryCreator);
      $provide.value('ProfileFormatter', mockProfileFormatter);
    });
  });

  beforeEach(inject(function ($rootScope, $controller) {
    ctrl = null;
    scope = null;
    rootScope = $rootScope;
    controller = $controller;
  }));

  function makeProfileController() {
    scope = rootScope.$new();
    try {
      ctrl = controller('ProfileController', {
        $scope: scope
      });
    } catch (e) {
      throw ("Error with the controller: " + e);
    }
  }

  function keyValue(id) {
    return {key: id, value: id, selected: false};
  }

  function keyValueList(list) {
    return _.map(list, keyValue);
  }

  function randomString() {
    return Math.floor(Math.random() * 1000).toString();
  }

  function randomArray() {
    return _.map([1, 2, 3], randomString);
  }

  describe("init", function () {
    beforeEach(makeProfileController);

    it('should init', function () {
      expect(ctrl).toNotBe(null);
    });

    it("loads item on init", function () {
      expect(scope.item).toEqual(mockItemService.loadResult);
    });

    it("initialises empty sub-properties", function () {
      expect(scope.item.profile.taskInfo).toEqual({subjects: {}});
      expect(scope.item.profile.otherAlignments).toEqual({keySkills: []});
      expect(scope.item.profile.contributorDetails).toEqual({
        licenseType: 'CC BY',
        copyrightYear: new Date().getFullYear().toString(),
        additionalCopyrights: []
      });
    });

    it("creates shortcuts to sub-objects", function () {
      expect(scope.item.profile).toEqual(scope.profile);
      expect(scope.item.profile.taskInfo).toEqual(scope.taskInfo);
      expect(scope.item.profile.otherAlignments).toEqual(scope.otherAlignments);
      expect(scope.item.profile.contributorDetails).toEqual(scope.contributorDetails);
    });
  });

  describe("standards", function () {

    it("loads standards tree", function () {
      var expectedDataProvider = randomArray();
      mockDataQueryService.listResult = expectedDataProvider;
      makeProfileController();
      expect(scope.standardsTree).toEqual(expectedDataProvider);
    });

    it("uses selected subject, category and sub-category to filter search results", function () {
      makeProfileController();
      scope.standardsAdapter.subjectOption = "subject";
      scope.standardsAdapter.categoryOption = "category";
      scope.standardsAdapter.subCategoryOption = "subCategory";
      scope.standardsAdapter.query({
        term: "searchterm", callback: function () {
        }
      })
      expect(mockStandardQueryCreator.createStandardQueryArguments.pop()).toEqual({
        search: "searchterm", subject: "subject", category: "category", subCategory: "subCategory"
      });
    });

    it("initialises standards from comma separated string", function () {
      makeProfileController();

      //init cache with some standards
      scope.queryResults.standards = [{id: "standard-a"}, {id: "standard-b"}, {id: "standard-c"}]

      //override getVal so we can set the val for this test
      scope.standardsAdapter.getVal = function () {
        return "standard-a,standard-b";
      };

      var actualResult;
      var domElement = {};
      scope.standardsAdapter.initSelection(domElement, function (result) {
        actualResult = result;
      });

      expect(actualResult).toEqual([{id: "standard-a"}, {id: "standard-b"}]);
    });

    describe("isLiteracyStandardSelected", function () {
      beforeEach(makeProfileController);
      it("is true if literacy standard is selected", function () {
        scope.profile.standards.push({subject: "some literacy subject"});
        scope.$apply();
        expect(scope.isLiteracyStandardSelected).toEqual(true);
      });
      it("is false if no literacy standard is selected", function () {
        scope.profile.standards.push({subject: "some math subject"});
        scope.$apply();
        expect(scope.isLiteracyStandardSelected).toEqual(false);
      });
    });
  });

  describe("componentTypes", function () {

    it("loads available components", function () {
      mockDesignerService.loadAvailableUiComponentsResult = {interactions: ["one", "two"], widgets: ["three", "four"]};
      makeProfileController();
      expect(scope.availableComponents).toEqual(["one", "two", "three", "four"]);
    });

    it("uses ProfileFormatter to initialise componentTypes from item", function () {
      var expectedResult = randomString();
      mockProfileFormatter.componentTypesUsedResult = expectedResult;
      mockItemService.loadResult = {profile: {}, components: ["one"]};
      makeProfileController();
      expect(scope.componentTypes).toEqual(expectedResult);
    });
  });

  describe("subject", function () {

    beforeEach(makeProfileController);

    describe("select2Adapter", function () {

      it('select2Adapter.query should return the result of DataQueryService.query', function () {

        var expectedResult = [{
          id: "1",
          category: "category",
          subject: "blah"
        }];

        mockDataQueryService.queryResult = expectedResult;

        var actualResult;

        var query = {
          term: "blah",
          callback: function (success) {
            actualResult = success.results;
          }
        };

        scope.primarySubjectSelect2Adapter.query(query);
        expect(actualResult).toEqual(expectedResult);
      });

      it("should init selection with a cached result", function () {

        var expectedItem = {
          id: "1",
          category: "category",
          subject: "blah"
        };

        //add item to queryResults cache
        scope.queryResults['subjects.primary'] = [expectedItem];

        //override element to val to return the id of the item that should be found
        scope.primarySubjectSelect2Adapter.elementToVal = function (e) {
          return "1";
        };

        var domElement = {};
        var actualItem;

        scope.primarySubjectSelect2Adapter.initSelection(domElement, function (s) {
          actualItem = s;
        });

        expect(actualItem).toEqual(expectedItem);
      });
    });
  });

  describe("dataProviders", function () {

    var expectedDataProvider;

    beforeEach(function () {
      expectedDataProvider = randomArray();
      mockDataQueryService.listResult = expectedDataProvider;
      makeProfileController();
    });

    describe("media type", function () {
      it("loads data", function () {
        expect(scope.mediaTypeDataProvider).toEqual(expectedDataProvider);
      });
    });

    describe("bloom's taxononmy", function () {
      it("loads data", function () {
        expect(scope.bloomsTaxonomyDataProvider).toEqual(expectedDataProvider);
      });
    });

    describe("grade levels", function () {
      it("loads data", function () {
        expect(scope.gradeLevelDataProvider).toEqual(expectedDataProvider);
      });
    });

    describe("depth of knowledge", function () {
      it("loads data", function () {
        expect(scope.depthOfKnowledgeDataProvider).toEqual(expectedDataProvider);
      });
    });

  });

  describe("copyright related dates", function () {
    function fullYear(offset) {
      return (new Date().getFullYear() + (offset ? offset : 0)).toString();
    }

    beforeEach(makeProfileController);

    describe("expiration date dataProvider", function () {
      it("first element should be current year", function () {
        expect(_.first(scope.copyrightExpirationYearDataProvider)).toEqual(fullYear());
      });
      it("last element should be Never", function () {
        expect(_.last(scope.copyrightExpirationYearDataProvider)).toEqual("Never");
      });
      it("but last element should be current year plus 20", function () {
        expect(_.first(_.last(scope.copyrightExpirationYearDataProvider, 2))).toEqual(fullYear(20));
      });
    });
    describe("copyright date dataProvider", function () {
      it("first element should be current year", function () {
        expect(_.first(scope.copyrightYearDataProvider)).toEqual(fullYear());
      });
      it("last element should be Never", function () {
        expect(_.last(scope.copyrightYearDataProvider)).toEqual(fullYear(-120));
      });
    });
  });

  describe("credentials", function () {
    var items;

    beforeEach(function () {
      items = keyValueList([1, 2, 'Other']);
      mockDataQueryService.listResult = items;
      makeProfileController();
    });

    it("loads data provider", function () {
      expect(scope.credentialsDataProvider).toEqual(items);
    });

    describe("isCredentialsOtherSelected", function () {
      it("is true if 'Other' is selected", function () {
        scope.contributorDetails.credentials = 'Other';
        scope.$apply();
        expect(scope.isCredentialsOtherSelected).toEqual(true);
      });
      it("is false if 'Other' is deselected", function () {
        scope.contributorDetails.credentials = 'Other';
        scope.$apply();
        expect(scope.isCredentialsOtherSelected).toEqual(true);

        scope.contributorDetails.credentials = 'Something else';
        scope.$apply();
        expect(scope.isCredentialsOtherSelected).toEqual(false);
      });
    });

  });

  describe('keySkills', function () {
    var expectedDataProvider;

    beforeEach(function () {
      expectedDataProvider = randomArray()
      mockDataQueryService.listResult = keyValueList(expectedDataProvider);
      makeProfileController();
    });

    it("should init dataProvider", function () {
      function tagListItem(id) {
        return {header: id, list: id};
      }

      expect(scope.keySkillsDataProvider).toEqual(_.map(expectedDataProvider, tagListItem));
    });

    describe("getKeySkillsSummary", function () {
      beforeEach(makeProfileController);
      it("can handle zero key skills", function () {
        expect(scope.getKeySkillsSummary([])).toEqual("No Key Skills selected")
      });
      it("can handle one key skill", function () {
        expect(scope.getKeySkillsSummary([1])).toEqual("1 Key Skill selected")
      });
      it("can handle multiple key skills", function () {
        expect(scope.getKeySkillsSummary([1, 2, 3])).toEqual("3 Key Skills selected")
      });
    });
  });

  describe('priorUse', function () {
    var itemOne, itemTwo, itemOther;

    beforeEach(function () {
      itemOne = keyValue("one");
      itemTwo = keyValue("two");
      itemOther = keyValue("Other");
      priorUseItems = [itemOne, itemTwo, itemOther];
      mockDataQueryService.listResult = priorUseItems;
      makeProfileController();
    });

    it("should init the dataProvider", function () {
      expect(scope.priorUseDataProvider).toEqual(priorUseItems);
    });

    it("selecting 'Other' reveals input", function () {
      scope.profile.priorUse = "Other";
      scope.$apply();
      expect(scope.isPriorUseOtherSelected).toEqual(true);
    });

    it("deselecting 'Other' clears model", function () {
      scope.profile.priorUse = "Other";
      scope.profile.priorUseOther = "Some prior use";
      scope.$apply();
      expect(scope.profile.priorUseOther).toEqual("Some prior use");

      scope.profile.priorUse = "";
      scope.$apply();
      expect(scope.profile.priorUseOther).toEqual("");
    });
  });

  describe("reviewsPassed", function () {
    var itemOne, itemTwo, itemOther, itemNone, itemAll, reviewsPassedItems;

    beforeEach(function () {
      itemOne = keyValue("one");
      itemTwo = keyValue("two");
      itemOther = keyValue("Other");
      itemNone = keyValue("None");
      itemAll = keyValue("All");
      reviewsPassedItems = [itemOne, itemTwo, itemOther, itemNone, itemAll];
      mockDataQueryService.listResult = reviewsPassedItems;
      makeProfileController();
    });

    it("should init the dataProvider", function () {
      expect(scope.reviewsPassedDataProvider).toEqual(reviewsPassedItems);
    });

    it("initially no item is selected", function () {
      expect(scope.profile.reviewsPassed).toEqual([]);
    });

    it("should select items", function () {
      itemOne.selected = true;
      scope.onChangeReviewsPassed("one");
      expect(scope.profile.reviewsPassed).toEqual(['one']);
    });

    it("should deselect items", function () {
      itemOne.selected = true;
      scope.onChangeReviewsPassed("one");
      itemTwo.selected = true;
      scope.onChangeReviewsPassed("two");
      itemOne.selected = false;
      scope.onChangeReviewsPassed("one");
      expect(scope.profile.reviewsPassed).toEqual(['two']);
    });

    it("should remove all items when 'None' is selected", function () {
      itemOne.selected = true;
      scope.onChangeReviewsPassed("one");
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      itemNone.selected = true;
      scope.onChangeReviewsPassed("None");
      expect(scope.profile.reviewsPassed).toEqual(['None']);
    });

    it("should add all items apart from 'Other' when 'All' is selected", function () {
      itemAll.selected = true;
      scope.onChangeReviewsPassed("All");
      expect(scope.profile.reviewsPassed).toEqual(['one', 'two', 'All']);
    });

    it("should not remove 'Other' when 'All' is selected", function () {
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      itemAll.selected = true;
      scope.onChangeReviewsPassed("All");
      expect(scope.profile.reviewsPassed).toEqual(['one', 'two', 'Other', 'All']);
    });

    it("should replace 'None' with all items when 'All' is selected", function () {
      itemNone.selected = true;
      scope.onChangeReviewsPassed("None");
      expect(scope.profile.reviewsPassed).toEqual(['None']);
      itemAll.selected = true;
      scope.onChangeReviewsPassed("All");
      expect(scope.profile.reviewsPassed).toEqual(['one', 'two', 'All']);
    });

    it('selecting "Other" reveals input', function () {
      itemOther.selected = true;
      scope.onChangeReviewsPassed("Other");
      scope.$apply();
      expect(scope.isReviewsPassedOtherSelected).toEqual(true);
    });

    it('selecting "Other" clears model', function () {
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

  describe("license types", function () {

    var expextedDataProvider = randomArray();
    beforeEach(function () {

      mockDataQueryService.listResult = expextedDataProvider;
      makeProfileController();
    });

    it("loads dataProvider", function () {
      expect(scope.licenseTypeDataProvider).toEqual(expextedDataProvider);
    });

    describe("getLicenseTypeUrl", function () {
      it("returns undefined if licenseType is empty", function () {
        expect(scope.getLicenseTypeUrl("")).toEqual(undefined);
      });
      it("returns licenseType url if licenseType is string", function () {
        expect(scope.getLicenseTypeUrl("CC")).toEqual("/assets/images/licenseTypes/CC.png");
      });
    });
  });

  describe("save", function () {
    beforeEach(function () {
      makeProfileController();
      scope.$apply();
      mockItemService.fineGrainedSaveCalls = [];
    });
    it("is triggered when a property of profile is changed", function () {
      scope.item.profile.someProperty = "some value";
      scope.$apply();
      expect(mockItemService.fineGrainedSaveCalls.length).toEqual(1);
    });
    it("is not triggered when a property of item is changed", function () {
      scope.item.someProperty = "some value";
      scope.$apply();
      expect(mockItemService.fineGrainedSaveCalls.length).toEqual(0);
    });
  });

  describe("additional copyrights", function () {
    function profileWithAdditionalCopyright(item) {
      return {profile: {contributorDetails: {additionalCopyrights: [item]}}};
    }

    it("should be initialised with empty list", function () {
      makeProfileController();
      expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
    });

    describe("on load", function () {
      it("should remove empty items", function () {
        mockItemService.loadResult = profileWithAdditionalCopyright({});
        makeProfileController();
        expect(scope.contributorDetails.additionalCopyrights).toEqual([]);
      });

      it("should not remove items with content", function () {
        mockItemService.loadResult = profileWithAdditionalCopyright({author: "Albert Einstein"});
        makeProfileController();
        expect(scope.contributorDetails.additionalCopyrights).toEqual([{author: "Albert Einstein"}]);
      });
    });
  });

  describe("form configuration", function () {

    it("should be possible to configure visible to false", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {visible: false}})};
      makeProfileController();
      expect(scope.formModels.title.visible).toEqual(false);
    });
    it("should be possible to configure visible to true", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {visible: true}})};
      makeProfileController();
      expect(scope.formModels.title.visible).toEqual(true);
    });
    it("should not configure visible if property does not exist in config", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.visible).toEqual(true);
    });
    it("should be possible to configure readonly to false", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {readonly: false}})};
      makeProfileController();
      expect(scope.formModels.title.readonly).toEqual(false);
    });
    it("should be possible to configure readonly to true", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {readonly: true}})};
      makeProfileController();
      expect(scope.formModels.title.readonly).toEqual(true);
    });
    it("should not configure readonly if property does not exist in config", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.readonly).toEqual(false);
    });
    it("should be possible to configure value", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {value: "some value"}})};
      makeProfileController();
      expect(scope.formModels.title.value).toEqual("some value");
    });
    it("should not configure value if property does not exist in config", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.value).toEqual(undefined);
    });
    it("should be possible to configure options", function () {
      mockLocation.hashResult = {config: JSON.stringify({standards: {options: [1, 2, 3]}})};
      makeProfileController();
      expect(scope.formModels.standards.options).toEqual([1, 2, 3]);
    });
    it("should not configure options if property does not exist in config", function () {
      mockLocation.hashResult = {config: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.options).toEqual(undefined);
    });
    it("should have formModels", function () {
      var keys = ["title", "description", "primarySubject", "relatedSubject", "gradeLevel", "componentTypes",
        "standards", "lexile", "depthOfKnowledge", "bloomsTaxonomy", "keySkills", "priorUse", "priorGradeLevel",
        "reviewsPassed", "author", "credentials", "copyrightOwner", "copyrightYear",
        "copyrightExpirationDate", "sourceUrl", "additionalCopyrights"];

      makeProfileController();
      _.forEach(keys,function(key){
        var item = scope.formModels[key];
        expect(item.visible).toEqual(true);
        expect(item.readonly).toEqual(false);
      });

    });
  });

});