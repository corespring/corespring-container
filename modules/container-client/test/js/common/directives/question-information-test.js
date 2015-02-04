describe('questionInformation', function() {

  beforeEach(angular.mock.module('corespring-common.directives'));
  beforeEach(angular.mock.module('corespring-templates'));

  var scope, element, mathJaxService;

  var mockParseDomForMath = jasmine.createSpy('parseDomForMath');

  var supportingName = "This is the name of the supporting material.";
  var url = "http://supporting-material-url.com/";
  var content = "This is the content of the supporting material.";

  function MockDataQueryService() {
    this.list = function() {};
  }

  function MockComponentService() {
    this.loadAvailableComponents = function() {};
  }

  function MockSupportingMaterialsService() {
    this.getSupportingMaterialsByGroups = function() {};
    this.getSupportingName = function() { return supportingName; };
    this.getContentType = function() {};
    this.getSupportingUrl = function() { return url; };
    this.getContent = function() { return content; };
  }

  function MockMathJaxService() {
    this.parseDomForMath = mockParseDomForMath;
  }

  function resetMocks() {
    mockParseDomForMath.calls.reset();
  }

  beforeEach(angular.mock.module('corespring-common.directives'));

  beforeEach(module(function($provide) {
    mathJaxService = new MockMathJaxService();
    $provide.value('DataQueryService', new MockDataQueryService());
    $provide.value('ProfileFormatter', function() {});
    $provide.value('ComponentService', new MockComponentService());
    $provide.value('SupportingMaterialsService', new MockSupportingMaterialsService());
    $provide.value('MathJaxService', mathJaxService);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.model = {
      profile: {
        contributorDetails: {}
      }
    };
    element = angular.element('<div question-information="" ng-model="model"></div>');
    $compile(element)(scope);

    element.scope().$apply();
    scope = element.isolateScope();
  }));

  afterEach(resetMocks);

  describe('selectTab', function() {
    var tab = "this is a tab";

    beforeEach(function() {
      scope.activeSmIndex = "not undefined!";
      scope.selectedSupportingMaterialContent = "not undefined!";
      scope.selectTab(tab);
    });

    it('should set activeTab to provided tab', function() {
      expect(scope.activeTab).toEqual(tab);
    });

    it('should set activeSmIndex to undefined', function() {
      expect(scope.activeSmIndex).toBeUndefined();
    });

    it('should set selectedSupportingMaterialContent to undefined', function() {
      expect(scope.selectedSupportingMaterialContent).toBeUndefined();
    });

  });

  describe('selectSupportingMaterial', function() {
    var index = 0;

    beforeEach(function() {
      scope.selectSupportingMaterial(index);
    });

    it('should set activeTab to supportingMaterial', function() {
      expect(scope.activeTab).toEqual('supportingMaterial');
    });

    it('should set activeSmIndex to provided index', function() {
      expect(scope.activeSmIndex).toEqual(index);
    });

    it('should set selected supporting material name to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedSupportingMaterialName).toEqual(supportingName);
    });

    it('should set selected supporting material url to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedSupportingMaterialUrl).toEqual(url);
    });

    it('should set selected supporting material content to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedSupportingMaterialContent).toEqual(content);
    });

    it('should call MathJaxService.parseDomForMath with element', function() {
      expect(mathJaxService.parseDomForMath).toHaveBeenCalledWith(100, element[0]);
    });

  });

});