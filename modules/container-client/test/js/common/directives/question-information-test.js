describe('questionInformation', function() {

  beforeEach(angular.mock.module('corespring-common.directives'));
  beforeEach(angular.mock.module('corespring-templates'));

  var scope, element, mathJaxService, model;

  var mockParseDomForMath = jasmine.createSpy('parseDomForMath');

  var content;
  var contentType;
  var supportingName;
  var url;

  function MockDataQueryService() {
    this.list = function() {};
  }

  function MockComponentService() {
    this.loadAvailableComponents = function() {};
  }

  function MockSupportingMaterialsService() {
    this.getSupportingMaterialsByGroups = function() {};
    this.getSupportingName = function() {
      return supportingName;
    };
    this.getContentType = function() {
      return contentType;
    };
    this.getSupportingUrl = function() {
      return url;
    };
    this.getContent = function() {
      return content;
    };
  }

  function MockMathJaxService() {
    this.parseDomForMath = mockParseDomForMath;
  }

  function resetMocks() {
    mockParseDomForMath.calls.reset();
  }

  beforeEach(angular.mock.module('corespring-common.directives'));

  beforeEach(function() {
    supportingName = "This is the name of the supporting material.";
    url = "http://supporting-material-url.com/";
    content = "This is the content of the supporting material.";
    contentType = "This is the content type of the supporting material.";
  });

  beforeEach(module(function($provide) {
    mathJaxService = new MockMathJaxService();
    $provide.value('ComponentService', new MockComponentService());
    $provide.value('DataQueryService', new MockDataQueryService());
    $provide.value('MathJaxService', mathJaxService);
    $provide.value('ProfileFormatter', function() {});
    $provide.value('STATIC_PATHS', {});
    $provide.value('SupportingMaterialsService', new MockSupportingMaterialsService());
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    model = scope.model = {
      profile: {
        contributorDetails: {}
      }
    };
    element = angular.element('<div question-information="" ng-model="model" tabs="tabs"></div>');
    $compile(element)(scope);

    element.scope().$apply();
    scope = element.isolateScope();
  }));

  afterEach(resetMocks);

  describe('available tabs', function() {
    it('should default to all tabs being available', function() {
      expect(scope.availableTabs).toEqual({
        question: true,
        profile: true,
        supportingMaterial: true
      });
    });

    it('should respect tabs property', function() {
      scope.tabs = {
        question: true
      };
      scope.$digest();
      expect(scope.availableTabs).toEqual({
        question: true
      });
    });

    it('should hide navigation if only 1 tab is available and it is not supporting materials', function() {
      scope.tabs = {
        question: true
      };
      scope.$digest();
      expect(scope.hideNav).toEqual(true);
    });

    it('should not hide navigation if the only available tab is supporting materials and there is more than 1 supporting materials', function() {
      scope.tabs = {
        supportingMaterial: true
      };
      model.supportingMaterials = ['s1', 's2'];
      scope.$digest();
      expect(scope.hideNav).toEqual(false);
    });

    it('should hide navigation if the only available tab is supporting materials and there is only 1 supporting material', function() {
      scope.tabs = {
        supportingMaterial: true
      };
      model.supportingMaterials = ['s1'];
      scope.$digest();
      expect(scope.hideNav).toEqual(true);
    });

    it('should select first available tab if current tab is not available', function() {
      scope.activeTab = "supportingMaterial";
      scope.tabs = {
        question: false,
        profile: true,
        supportingMaterial: false
      };
      scope.$digest();
      expect(scope.activeTab).toEqual("profile");
    });

  });

  describe('selectTab', function() {
    var tab = "this is a tab";

    beforeEach(function() {
      scope.selectedMaterial = {};
      scope.selectTab(tab);
    });

    it('should set activeTab to provided tab', function() {
      expect(scope.activeTab).toEqual(tab);
    });

    it('should set selectedMaterial to undefined', function() {
      expect(scope.selectedMaterial).toBeUndefined();
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
      expect(scope.selectedMaterial.index).toEqual(index);
    });

    it('should set selected supporting material name to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedMaterial.name).toEqual(supportingName);
    });

    it('should set selected supporting material url to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedMaterial.url).toEqual(url);
    });

    it('should set selected supporting material content to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedMaterial.content).toEqual(content);
    });

    it('should set selected supporting material contentType to value returned by SupportingMaterialsService', function() {
      expect(scope.selectedMaterial.contentType).toEqual(contentType);
    });

    it('should call MathJaxService.parseDomForMath with element', function() {
      expect(mathJaxService.parseDomForMath).toHaveBeenCalledWith(100, element[0]);
    });

  });

  describe("supporting material content (AC-189)", function() {
    it('should add material/[supportingMaterialName] as path to image urls in content', function() {
      supportingName = "test name";
      content = '<div><img src="image.jpg"></div>';
      scope.selectSupportingMaterial(0);
      expect(scope.selectedMaterial.content).toEqual('<div><img src="materials/test name/image.jpg"></div>');
    });
    it('should not crash if content is null', function() {
      content = null;
      scope.selectSupportingMaterial(0);
      expect(scope.selectedMaterial.content).toEqual(content);
    });
    it('should not crash if content is undefined', function() {
      content = undefined;
      scope.selectSupportingMaterial(0);
      expect(scope.selectedMaterial.content).toEqual(content);
    });
    it('should not change a content that does not have an image in it', function() {
      content = '<div>No image here</div>';
      scope.selectSupportingMaterial(0);
      expect(scope.selectedMaterial.content).toEqual(content);
    });
  });

});