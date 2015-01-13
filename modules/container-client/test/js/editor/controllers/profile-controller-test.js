describe('profile controller', function () {

  var scope, rootScope, controller, ctrl;


  function MockModal() {
  }

  function MockDesignerService() {
    this.loadAvailableUiComponentsResult = {interactions: [], widgets: []};

    this.loadAvailableUiComponents = function (onSuccess, onError) {
      onSuccess(_.cloneDeep(this.loadAvailableUiComponentsResult));
    };
  }

  function MockItemService() {
    this.loadResult = {};

    this.load = function (onSuccess) {
      onSuccess(_.cloneDeep(this.loadResult));
    };

    this.saveProfileResult = "OK";
    this.saveProfileCalls = [];

    this.saveProfile = function (data, callback) {
      this.saveProfileCalls.push(arguments);
      callback(_.cloneDeep(this.saveProfileResult));
    };
  }

  function MockLogFactory() {
    this.getLogger = function (id) {
      return window.console || {
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
      callback(_.cloneDeep(this.queryResult));
    };

    this.findOneResult = {};

    this.findOne = function (topic, id, callback) {
      callback(_.cloneDeep(this.findOneResult));
    };

    this.listResult = [];

    this.list = function (topic, callback) {
      callback(_.cloneDeep(this.listResult));
    };
  }

  function MockProfileFormatter() {
    this.componentTypesUsedResult = "OK";
    this.componentTypesUsed = function (components, availableComponents) {
      return this.componentTypesUsedResult;
    };
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

  function MockConfigurationService(){
    this.config = {};
    this.getConfig = function(callback){
      callback(this.config);
      return this.config;
    };
  }

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  var mockLocation, mockDesignerService, mockItemService,mockConfigurationService,
    mockDataQueryService, mockProfileFormatter, mockStandardQueryCreator;

  beforeEach(function () {
    mockLocation = new MockLocation();
    mockConfigurationService = new MockConfigurationService();
    mockDesignerService = new MockDesignerService();
    mockItemService = new MockItemService();
    mockDataQueryService = new MockDataQueryService();
    mockProfileFormatter = new MockProfileFormatter();
    mockStandardQueryCreator = new MockStandardQueryCreator();


    module(function ($provide) {
      $provide.value('$location', mockLocation);
      $provide.value('$timeout', function(fn){fn();});
      $provide.value('throttle', _.identity);
      $provide.value('ConfigurationService', mockConfigurationService);
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
    return 'random-' + Math.floor(Math.random() * 1000).toString();
  }

  function randomArray() {
    return _.map([1, 2, 3], function(item){
      var s = randomString();
      return {key:s, value:s};
    });
  }

  describe("init", function () {
    beforeEach(makeProfileController);

    it('should init', function () {
      expect(ctrl).not.toBe(null);
      expect(ctrl).not.toBe(undefined);
    });

    it("loads item on init", function () {
      expect(scope.item).not.toBe(null);
      expect(scope.item).not.toBe(undefined);
    });

    it("initialises empty sub-properties", function () {
      expect(scope.item.profile).not.toBe(null);
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

    it("should not call save after loading an item", function(){
      scope.$apply();
      expect(mockItemService.saveProfileCalls).toEqual([]);
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
      scope.standardFilterOption.subject = "subject";
      scope.standardFilterOption.category = "category";
      scope.standardFilterOption.subCategory = "subCategory";
      scope.standardsAdapter.query({
        term: "searchterm", callback: function () {
        }
      });
      expect(mockStandardQueryCreator.createStandardQueryArguments.pop()).toEqual({
        search: "searchterm", subject: "subject", category: "category", subCategory: "subCategory"
      });
    });

    describe("isLiteracyStandardSelected", function () {
      beforeEach(makeProfileController);
      it("is true if literacy standard is selected", function () {
        scope.item.profile.standards = [{subject: "some literacy subject"}];
        scope.$apply();
        expect(scope.isLiteracyStandardSelected).toEqual(true);
      });
      it("is false if no literacy standard is selected", function () {
        scope.profile.standards = [{subject: "some math subject"}];
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

    });
  });

  describe("dataProviders", function () {

    var expectedDataProvider;

    beforeEach(function () {
      expectedDataProvider = randomArray();
      mockDataQueryService.listResult = expectedDataProvider;
      makeProfileController();
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
        expect(_.first(scope.copyrightExpirationDateDataProvider)).toEqual(fullYear());
      });
      it("last element should be Never", function () {
        expect(_.last(scope.copyrightExpirationDateDataProvider)).toEqual("Never");
      });
      it("but last element should be current year plus 20", function () {
        expect(_.first(_.last(scope.copyrightExpirationDateDataProvider, 2))).toEqual(fullYear(20));
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
    var inputData;

    beforeEach(function () {
      inputData = [{key:'categoryA', value:['skillA-1','skillA-2']},{key:'categoryB', value:['skillB-1','skillB-2']}];
      mockDataQueryService.listResult = inputData;
    });

    it("should init dataProvider", function () {
      makeProfileController();
      expect(scope.keySkillsDataProvider).toEqual([
        {key:'skillA-1',value:'skillA-1',selected:false},
        {key:'skillA-2',value:'skillA-2',selected:false},
        {key:'skillB-1',value:'skillB-1',selected:false},
        {key:'skillB-2',value:'skillB-2',selected:false},
        ]);
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
      reviewsPassedItems = [keyValue("one"),keyValue("two"),keyValue("Other"),keyValue("None"),keyValue("All")];
      mockDataQueryService.listResult = reviewsPassedItems;
      makeProfileController();
      itemOne = scope.reviewsPassedDataProvider[0];
      itemTwo = scope.reviewsPassedDataProvider[1];
      itemOther = scope.reviewsPassedDataProvider[2];
      itemNone = scope.reviewsPassedDataProvider[3];
      itemAll = scope.reviewsPassedDataProvider[4];
    });

    it("should init the dataProvider", function () {
      expect(scope.reviewsPassedDataProvider).toEqual(reviewsPassedItems);
    });

    it("initially no item is selected", function () {
      expect(scope.profile.reviewsPassed).toEqual([]);
    });

    it("should remove all items when 'None' is selected", function () {
      scope.profile.reviewsPassed = ["one", "Other", "None"];
      scope.$apply();
      expect(scope.profile.reviewsPassed).toEqual([]);
    });

    it("should add all items apart from 'Other' when 'All' is selected", function () {
      scope.profile.reviewsPassed = ["All"];
      scope.$apply();
      expect(scope.profile.reviewsPassed).toEqual(['one', 'two']);
    });

    it("should not remove 'Other' when 'All' is selected", function () {
      scope.profile.reviewsPassed = ["All", "Other"];
      scope.$apply();
      expect(scope.profile.reviewsPassed).toEqual(['one', 'two', "Other"]);
    });

    it('selecting "Other" reveals input', function () {
      scope.profile.reviewsPassed = ["Other"];
      scope.$apply();
      expect(scope.isReviewsPassedOtherSelected).toEqual(true);
    });

    it('deselecting "Other" clears model', function () {
      scope.profile.reviewsPassed = ["Other"];
      scope.profile.reviewsPassedOther = "Some other review";
      scope.$apply();
      expect(scope.profile.reviewsPassedOther).toEqual("Some other review");

      scope.profile.reviewsPassed = [];
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
      mockItemService.saveProfileCalls = [];
    });
    it("is triggered when a property of profile is changed", function () {
      scope.profile.someProperty = "some value";
      scope.$apply();
      expect(mockItemService.saveProfileCalls.length).toEqual(1);
    });
    it("is not triggered when a property of item is changed", function () {
      scope.item.someProperty = "some value";
      scope.$apply();
      expect(mockItemService.saveProfileCalls.length).toEqual(0);
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
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {visible: false}})};
      makeProfileController();
      expect(scope.formModels.title.visible).toEqual(false);
    });
    it("should be possible to configure visible to true", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {visible: true}})};
      makeProfileController();
      expect(scope.formModels.title.visible).toEqual(true);
    });
    it("should not configure visible if property does not exist in config", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.visible).toEqual(true);
    });
    it("should be possible to configure readonly to false", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {readonly: false}})};
      makeProfileController();
      expect(scope.formModels.title.readonly).toEqual(false);
    });
    it("should be possible to configure readonly to true", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {readonly: true}})};
      makeProfileController();
      expect(scope.formModels.title.readonly).toEqual(true);
    });
    it("should not configure readonly if property does not exist in config", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.readonly).toEqual(false);
    });
    it("should be possible to configure value", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {value: "some value"}})};
      makeProfileController();
      expect(scope.formModels.title.value).toEqual("some value");
    });
    it("should not configure value if property does not exist in config", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.value).toEqual(undefined);
    });
    it("should be possible to configure options", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({standards: {options: [1, 2, 3]}})};
      makeProfileController();
      expect(scope.formModels.standards.options).toEqual([1, 2, 3]);
    });
    it("should not configure options if property does not exist in config", function () {
      mockLocation.hashResult = {profileConfig: JSON.stringify({title: {}})};
      makeProfileController();
      expect(scope.formModels.title.options).toEqual(undefined);
    });
    it("should have defaults", function () {
      var keys = ["title", "description", "primarySubject", "relatedSubject", "gradeLevel", "componentTypes",
        "standards", "lexile", "depthOfKnowledge", "bloomsTaxonomy", "keySkills", "priorUse", "priorGradeLevel",
        "reviewsPassed", "author", "credentials", "copyrightOwner", "copyrightYear",
        "copyrightExpirationDate", "sourceUrl", "additionalCopyrights"];

      makeProfileController();
      _.forEach(keys,function(key){
          var item = scope.formModels[key];
          expect(key + ".visible " + item.visible).toEqual(key + ".visible " + true);
          expect(key + ".readonly " + item.readonly).toEqual(key + ".readonly " + false);
        });
    });
    describe("overrides values in profile", function(){
      describe("simple", function(){
        beforeEach(function(){
          mockLocation.hashResult = {profileConfig: JSON.stringify({
            title: {value: "some title"},
            description: {value: "some description"},
            gradeLevel: {value: ["01","03"]},
            lexile: {value: 76},
            depthOfKnowledge: {value: "some depth"},
            bloomsTaxonomy: {value: "some blooms"},
            keySkills: {value: ["one","two"]},
            priorUse: {value: "some prior use"},
            priorUseOther: {value: "some other prior use"},
            priorGradeLevel: {value: ["02","04"]},
            reviewsPassed: {value: ["r1","r2"]},
            reviewsPassedOther: {value: "Other reviews passed"},
            author: {value: "some author"},
            credentials: {value: "some credentials"},
            credentialsOther: {value: "some other credentials"},
            copyrightOwner: {value: "some copyright owner"},
            copyrightYear: {value: 1978},
            copyrightExpirationDate: {value: 2020},
            sourceUrl: {value: "some source url"},
            additionalCopyrights: {value: [
              {author: "some author"}
            ]}
          })};
          makeProfileController();

        });
        it("title", function(){
          expect(scope.taskInfo.title).toEqual("some title");
        });
        it("description", function(){
          expect(scope.taskInfo.description).toEqual("some description");
        });
        it("gradeLevel", function(){
          expect(scope.taskInfo.gradeLevel).toEqual(["01","03"]);
        });
        it("lexile", function(){
          expect(scope.profile.lexile).toEqual(76);
        });
        it("depthOfKnowledge", function(){
          expect(scope.profile.otherAlignments.depthOfKnowledge).toEqual("some depth");
        });
        it("bloomsTaxonomy", function(){
          expect(scope.profile.otherAlignments.bloomsTaxonomy).toEqual("some blooms");
        });
        it("keySkills", function(){
          expect(scope.profile.otherAlignments.keySkills).toEqual(["one", "two"]);
        });
        it("priorUse", function(){
          expect(scope.profile.priorUse).toEqual("some prior use");
        });
        it("priorUseOther", function(){
          expect(scope.profile.priorUseOther).toEqual("some other prior use");
        });
        it("priorGradeLevel", function(){
          expect(scope.profile.priorGradeLevel).toEqual(["02", "04"]);
        });
        it("reviewsPassed", function(){
          expect(scope.profile.reviewsPassed).toEqual(["r1", "r2"]);
        });
        it("reviewsPassedOther", function(){
          expect(scope.profile.reviewsPassedOther).toEqual("Other reviews passed");
        });
        it("author", function(){
          expect(scope.contributorDetails.author).toEqual("some author");
        });
        it("credentials", function(){
          expect(scope.contributorDetails.credentials).toEqual("some credentials");
        });
        it("credentialsOther", function(){
          expect(scope.contributorDetails.credentialsOther).toEqual("some other credentials");
        });
        it("copyrightOwner", function(){
          expect(scope.contributorDetails.copyrightOwner).toEqual("some copyright owner");
        });
        it("copyrightYear", function(){
          expect(scope.contributorDetails.copyrightYear).toEqual(1978);
        });
        it("copyrightExpirationDate", function(){
          expect(scope.contributorDetails.copyrightExpirationDate).toEqual(2020);
        });
        it("sourceUrl", function(){
          expect(scope.contributorDetails.sourceUrl).toEqual("some source url");
        });
        it("additionalCopyrights", function(){
          expect(scope.contributorDetails.additionalCopyrights).toEqual([{author: "some author"}]);
        });
      });
      describe("subjects.primary", function(){
        beforeEach(function() {
          mockLocation.hashResult = {
            profileConfig: JSON.stringify({
              primarySubject: {value: "Cat1: Sub1"}
            })
          };
          mockDataQueryService.queryResult = [{subject:"Sub1", category:"Cat1"}];
          makeProfileController();
        });
        it("should equal to the first result of the data query", function(){
          expect(scope.taskInfo.subjects.primary).toEqual({subject:"Sub1", category:"Cat1"});
        });
      });
      describe("subjects.related", function(){
        beforeEach(function() {
          mockLocation.hashResult = {
            profileConfig: JSON.stringify({
              relatedSubject: {value: ["Cat1: Sub1"]}
            })
          };
          mockDataQueryService.queryResult = [{subject:"Sub1", category:"Cat1"}];
          makeProfileController();
        });
        it("related subject", function(){
          expect(scope.taskInfo.subjects.related).toEqual([{subject:"Sub1", category:"Cat1"}]);
        });
      });
      describe("standards", function(){
        beforeEach(function() {
          mockLocation.hashResult = {
            profileConfig: JSON.stringify({
              standards: {value: ["RL.1.1"]}
            })
          };
          mockDataQueryService.queryResult = [{dotNotation:"RL.1.1"}];
          makeProfileController();
        });
        it("standards", function(){
          expect(scope.profile.standards).toEqual([{dotNotation:"RL.1.1"}]);
        });
      });
    });

    describe("options", function(){
      beforeEach(makeProfileController);

      describe("bloomsTaxonomy", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.bloomsTaxonomy.options;
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.bloomsTaxonomyFilter);
          expect(actual).toEqual(keyValueList(["one","two", "three"]));
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.bloomsTaxonomy.options = ["one","two","not in dataProvider"];
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.bloomsTaxonomyFilter);
          expect(actual).toEqual(keyValueList(["one","two"]));
        });
      });
      describe("copyrightYear", function(){
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.copyrightYear.options = ['1981', '1982', "not in dataProvider"];
          var actual = _.filter(scope.copyrightYearDataProvider, scope.copyrightYearFilter);
          expect(actual).toEqual(['1982', '1981']);
        });
      });
      describe("copyrightExpirationDate", function(){
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.copyrightExpirationDate.options = ['2020', '2021', "not in dataProvider"];
          var actual = _.filter(scope.copyrightExpirationDateDataProvider, scope.copyrightExpirationDateFilter);
          expect(actual).toEqual(['2020', '2021']);
        });
      });
      describe("credentials", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.credentials.options;
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.credentialsFilter);
          expect(actual).toEqual(keyValueList(["one","two", "three"]));
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.credentials.options = ["one","two","not in dataProvider"];
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.credentialsFilter);
          expect(actual).toEqual(keyValueList(["one","two"]));
        });
      });
      describe("depthOfKnowledge", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.depthOfKnowledge.options;
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.depthOfKnowledgeFilter);
          expect(actual).toEqual(keyValueList(["one","two", "three"]));
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.depthOfKnowledge.options = ["one","two","not in dataProvider"];
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.depthOfKnowledgeFilter);
          expect(actual).toEqual(keyValueList(["one","two"]));
        });
      });
      describe("gradeLevel", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.gradeLevel.options;
          var actual = _.filter(keyValueList(["01", "03", "05"]), scope.gradeLevelFilter);
          expect(actual).toEqual(keyValueList(["01", "03", "05"]));
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.gradeLevel.options = ["01", "03","not in dataProvider"];
          var actual = _.filter(keyValueList(["01", "03", "not in options"]), scope.gradeLevelFilter);
          expect(actual).toEqual(keyValueList(["01","03"]));
        });
      });
      describe("primarySubject", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.primarySubject.options;
          var inputData = [{subject:'A', category:'A'},{subject:'B', category:'B'}];
          mockDataQueryService.queryResult = inputData;
          var actualResult;
          scope.primarySubjectSelect2Adapter.query({term:"some term", callback: function(result){
            actualResult = result;
          }});
          expect(actualResult).toEqual({results:inputData});
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.primarySubject.options = ['A: B','Something: Else'];
          var inputData = [{category:'A', subject:'B'},{category:'C', subject:'D'}];
          mockDataQueryService.queryResult = inputData;
          var actualResult;
          scope.primarySubjectSelect2Adapter.query({term:"some term", callback: function(result){
            actualResult = result;
          }});
          expect(actualResult).toEqual({results:[{category:'A',subject:'B'}]});
        });
      });
      describe("priorGradeLevel", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.priorGradeLevel.options;
          var actual = _.filter(keyValueList(["01", "03", "05"]), scope.priorGradeLevelFilter);
          expect(actual).toEqual(keyValueList(["01", "03", "05"]));
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.priorGradeLevel.options = ["01", "03","not in dataProvider"];
          var actual = _.filter(keyValueList(["01", "03", "not in options"]), scope.priorGradeLevelFilter);
          expect(actual).toEqual(keyValueList(["01","03"]));
        });
      });
      describe("priorUse", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.priorUse.options;
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.priorUseFilter);
          expect(actual).toEqual(keyValueList(["one","two", "three"]));
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.priorUse.options = ["one","two","not in dataProvider"];
          var actual = _.filter(keyValueList(["one", "two", "three"]), scope.priorUseFilter);
          expect(actual).toEqual(keyValueList(["one","two"]));
        });
      });
      describe("relatedSubject", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.relatedSubject.options;
          var inputData = [{subject:'A', category:'A'},{subject:'B', category:'B'}];
          mockDataQueryService.queryResult = inputData;
          var actualResult;
          scope.relatedSubjectSelect2Adapter.query({term:"some term", callback: function(result){
            actualResult = result;
          }});
          expect(actualResult).toEqual({results:inputData});
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.relatedSubject.options = ['A: B','Something: Else'];
          var inputData = [{category:'A', subject:'B'},{category:'C', subject:'D'}];
          mockDataQueryService.queryResult = inputData;
          var actualResult;
          scope.relatedSubjectSelect2Adapter.query({term:"some term", callback: function(result){
            actualResult = result;
          }});
          expect(actualResult).toEqual({results:[{category:'A',subject:'B'}]});
        });
      });
      describe("standards", function(){
        it("should not change dataProvider, when options are not defined", function(){
          delete scope.formModels.standards.options;
          var inputData = [{dotNotation:'A'},{dotNotation:'B'}];
          mockDataQueryService.queryResult = inputData;
          var actualResult;
          scope.standardsAdapter.query({term:"some term", callback: function(result){
            actualResult = result;
          }});
          expect(actualResult).toEqual({results:inputData});
        });
        it("should remove items which are not in both, dataProvider and options", function(){
          scope.formModels.standards.options = ['A','Something'];
          var inputData = [{dotNotation:'A'},{dotNotation:'B'}];
          mockDataQueryService.queryResult = inputData;
          var actualResult;
          scope.standardsAdapter.query({term:"some term", callback: function(result){
            actualResult = result;
          }});
          expect(actualResult).toEqual({results:[{dotNotation:'A'}]});
        });
      });
    });
  });

});