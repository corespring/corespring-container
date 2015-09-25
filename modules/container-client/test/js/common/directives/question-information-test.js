describe('questionInformation', function() {

  beforeEach(angular.mock.module('corespring-common.directives'));
  beforeEach(angular.mock.module('corespring-templates'));

  var scope, element, mockMathJaxService, mockSmUtils, model;

  beforeEach(angular.mock.module('corespring-common.directives'));
  beforeEach(module(function($provide) {
    
    mockMathJaxService = {
      parseDomForMath: jasmine.createSpy('parseDomForMath')
    };

    mockSmUtils = {
      group: jasmine.createSpy('group').and.returnValue([]),
      mainFile: jasmine.createSpy('mainFile').and.returnValue({}),
      getBinaryUrl: jasmine.createSpy('getBinaryUrl').and.returnValue('binaryUrl')
    };

    $provide.value('MathJaxService', mockMathJaxService, mockSmUtils);
    $provide.value('SmUtils', mockSmUtils);
    $provide.value('profilePreviewDirective', {});
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    model = scope.model = {
      profile: {
        contributorDetails: {}
      }
    };
    scope.tabs = { 
      profile: true,
      question: true, 
      supportingMaterial: true};

    element = angular.element('<div question-information="" ng-model="model" tabs="tabs"></div>');
    $compile(element)(scope);
    element.scope().$apply();
    scope = element.isolateScope();
  }));

  describe('tabs', function() {

    it('should respect tabs property', function() {
      scope.tabs = {
        question: true
      };
      scope.$digest();
      expect(scope.tabs).toEqual({
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

    it('should not hide navigation if the only available tab is supporting materials and there is only 1 supporting material', function() {
      scope.tabs = {
        supportingMaterial: true
      };
      model.supportingMaterials = ['s1'];
      scope.$digest();
      expect(scope.hideNav).toEqual(false);
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

    beforeEach(function() {

      mockSmUtils.mainFile.and.returnValue({name: 'main-file'});
      mockSmUtils.getBinaryUrl.and.returnValue('url');

      var material = {
        name: 'material',
      };

      scope.selectSupportingMaterial(material);
    });

    it('should set activeTab to supportingMaterial', function() {
      expect(scope.activeTab).toEqual('supportingMaterial');
    });

    it('should set the main file', function(){
      expect(mockSmUtils.mainFile).toHaveBeenCalledWith({name: 'material'});
      expect(scope.mainFile).toEqual({name: 'main-file'});
    });

    it('should set the binaryUrl', function(){
      expect(mockSmUtils.getBinaryUrl).toHaveBeenCalledWith({name: 'material'}, {name: 'main-file'});
      expect(scope.binaryUrl).toEqual('url');
    });

    it('should call MathJaxService.parseDomForMath with element', function() {
      expect(mockMathJaxService.parseDomForMath).toHaveBeenCalledWith(100, element[0]);
    });

  });

  describe("supporting material content (AC-189)", function() {
    
    var content = '<div><img src="image.jpg"></div>';
    beforeEach(function(){
      mockSmUtils.getBinaryUrl.and.returnValue('some/binary/url');
      mockSmUtils.mainFile.and.callFake(function(){ return { contentType: 'text/html', content: content};});
    }); 

    it('should add material/[supportingMaterialName] as path to image urls in content', function() {
      supportingName = "test name";
      scope.selectSupportingMaterial({name: 'test name'});
      expect(mockSmUtils.getBinaryUrl).toHaveBeenCalledWith({name: 'test name'}, {name: 'image.jpg'});
      expect(scope.mainFile.content).toEqual('<div><img src="some/binary/url"></div>');
    });

    it('should not crash if content is null', function() {
      content = null;
      scope.selectSupportingMaterial({});
      expect(scope.mainFile.content).toEqual(content);
    });
    
    it('should not crash if content is undefined', function() {
      content = undefined;
      scope.selectSupportingMaterial({});
      expect(scope.mainFile.content).toEqual(content);
    });
    
    it('should not change a content that does not have an image in it', function() {
      content = '<div>No image here</div>';
      scope.selectSupportingMaterial({});
      expect(scope.mainFile.content).toEqual(content);
    });
  });

});