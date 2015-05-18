describe('SupportingMaterialPreview', function() {

  var scope, element, rootScope, compile;

  var previewable = false;
  var url = "http://this-is-the-url.com/";
  var file = {
    content: "This is the file"
  };
  var index = 0;
  var supportingMaterials = [
    {
      files: [
        {
          data: 'file!'
        }
      ]
    }
  ];
  var data = {
    item: {
      supportingMaterials: supportingMaterials
    }
  };

  var mockPreviewable = jasmine.createSpy('previewable');
  var mockGetSupportingMaterialFile = jasmine.createSpy('getSupportingMaterialFile');
  var mockGetSupportingUrl = jasmine.createSpy('getSupportingUrl');

  function MockSupportingMaterialsService() {
    this.previewable = mockPreviewable.and.returnValue(previewable);
    this.getSupportingUrl = mockGetSupportingUrl.and.returnValue(url);
    this.getSupportingMaterialFile = mockGetSupportingMaterialFile;
    this.isDefault = function() {
      return true;
    };
  }

  beforeEach(angular.mock.module('corespring-common.supporting-materials.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$stateParams', {
      index: index
    });
    $provide.value('SupportingMaterialsService', new MockSupportingMaterialsService());
  }));

  beforeEach(inject(function($rootScope, $compile) {
    rootScope = $rootScope;
    compile = $compile;
    scope = $rootScope.$new();
    scope.index = index;
    scope.data = data;
    element = $compile('<div ng-controller="SupportingMaterialPreview"></div>')(scope);
    scope = element.scope();
  }));

  function resetMocks() {
    mockPreviewable.calls.reset();
    mockGetSupportingMaterialFile.calls.reset();
    mockGetSupportingUrl.calls.reset();
  }

  afterEach(resetMocks);

  describe('getSupportingMarkup', function() {
    var result;

    beforeEach(function() {
      mockGetSupportingMaterialFile.and.returnValue(file);
      result = scope.getSupportingMarkup();
    });

    it('should call  SupportingMaterialsService.getSupportingMaterialFile with supporting materials and index', function() {
      expect(mockGetSupportingMaterialFile).toHaveBeenCalledWith(supportingMaterials, index);
    });

    it('should return supporting material file content from SupportingMaterialsService', function() {
      expect(result).toEqual(file.content);
    });

  });

  describe('getSupportingUrl', function() {
    it('should return supporting url from SupportingMaterialsService', function() {
      expect(scope.getSupportingUrl()).toEqual(url);
    });
  });

  describe('previewable', function() {
    it('should be SupportingMaterialsService.previewable', function() {
      expect(scope.previewable).toEqual(previewable);
    });
  });

  describe('supportingUrl', function() {
    it('should be SupportingMaterialsService.getSupportingUrl', function() {
      expect(scope.supportingUrl).toEqual(url);
    });
  });

  describe('supportingMarkup', function() {
    var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
    beforeEach(function() {
      scope = rootScope.$new();
      element = compile('<div ng-controller="SupportingMaterialPreview"></div>')(scope);
      scope = element.scope();
    });

    it('should be SupportingMaterialsService.supportingMarkup', function() {
      expect(scope.supportingMarkup).toEqual(file.content);
    });
  });

  describe('fileIndex', function() {
    it('should return file index', function() {
      expect(scope.fileIndex).toBe(0);
    });
  });

  describe('itemLoaded event', function() {
    var url = 'test';
    var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
    var data = {
      item: {
        supportingMaterials: supportingMaterials
      }
    };

    beforeEach(function() {
      spyOn(scope, 'getSupportingUrl').and.returnValue(url);
      scope.$broadcast('itemLoaded');
    });

    it('should set scope.supportingUrl to scope.getSupportingUrl()', function() {
      expect(scope.supportingUrl).toEqual(url);
    });

    it('should set scope.supportingUrl to scope.getSupportingMarkup()', function() {
      expect(scope.supportingMarkup).toEqual(file.content);
    });

  });


});
