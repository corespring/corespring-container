describe('questionInformation', function() {

  beforeEach(angular.mock.module('corespring-common.directives'));

  var scope, element, mathJaxService;

  var mockParseDomForMath = jasmine.createSpy('parseDomForMath');

  function MockDataQueryService() {
    this.list = function() {};
  }

  function MockComponentService() {
    this.loadAvailableComponents = function() {};
  }

  function MockSupportingMaterialsService() {
    this.getSupportingMaterialsByGroups = function() {};
    this.getSupportingName = function() {};
    this.getContentType = function() {};
    this.getSupportingUrl = function() {};
    this.getContent = function() {};
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
    scope = element.isolateScope();
    scope.$apply();
  }));

  afterEach(resetMocks);

  describe('selectSupportingMaterial', function() {
    var index = 0;

    beforeEach(function() {
      scope.selectSupportingMaterial(index);
    })

    it('should call MathJaxService.parseDomForMath', function() {
      expect(mathJaxService.parseDomForMath).toHaveBeenCalled();
    });

  });

});