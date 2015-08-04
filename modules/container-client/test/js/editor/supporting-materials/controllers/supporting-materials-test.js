describe('SupportingMaterials', function() {

  var scope, element;

  var index = 0;

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  var $modal = {
    open: function() {}
  };

  var $state = {
    transitionTo: function() {}
  };

  function MockStateParams() {
    this.index = index;
  }

  var supportingMaterialsService = {
    getSupportingMaterialFile: function() {},
    getContentType: function() {},
    getSupportingUrl: function() {},
    getKBFileSize: function() {}
  };

  var editorConfig = {
    mathJaxFeatureGroup: function() {
      return ['this', 'is', 'the', 'mathjax', 'feature', 'group'];
    },
    footnotesFeatureGroup: function() {
      return ['this', 'is', 'the', 'footnotes', 'feature', 'group'];
    },
    overrideFeatures: ['these', 'are', 'the', 'override', 'features']
  };

  var itemService = {
    saveSupportingMaterials: jasmine.createSpy('saveSupportingMaterials')
  };

  beforeEach(module(function($provide) {
    $provide.value('$modal', $modal);
    $provide.value('$state', $state);
    $provide.value('$stateParams', new MockStateParams());
    $provide.value('ItemService', itemService);
    $provide.value('SupportingMaterialsService', supportingMaterialsService);
    $provide.value('EditorConfig', editorConfig);
    $provide.value('debounce', org.corespring.mocks.editor.debounce);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="SupportingMaterials"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {

    it('should set index to $stateParams.index', function() {
      expect(scope.index).toEqual(index);
    });

    it('should set editing to false', function() {
      expect(scope.editing).toBe(false);
    });

    it('should set extra feature definitions to include mathjax and footnotes from EditorConfig', function() {
      expect(scope.extraFeatures).toEqual({
        definitions: [
          editorConfig.mathJaxFeatureGroup(),
          editorConfig.footnotesFeatureGroup()
        ]
      });
    });

    it('should set overrideFeatures to EditorConfig.overrideFeatures', function() {
      expect(scope.overrideFeatures).toEqual(editorConfig.overrideFeatures);
    });

  });

  describe('addNew', function() {
    var callback;
    beforeEach(function() {
      callback = jasmine.createSpy('callback');
      spyOn($modal, 'open').and.returnValue({
        result: {
          then: callback
        }
      });
      scope.addNew();
    });

    it('should create a modal', function() {
      expect($modal.open).toHaveBeenCalledWith({
        templateUrl: '/templates/popups/addSupportingMaterial',
        controller: 'AddSupportingMaterialPopupController',
        backdrop: 'static'
      });
    });

    describe('callback', function() {
      var supportingMaterial;
    });

  });

  describe('deleteSupportingMaterial', function() {
    var index = 0, event = {
      preventDefault: function() {},
      stopPropagation: function() {}
    };
    beforeEach(function() {
      spyOn(scope, '$emit');
      spyOn(event, 'preventDefault');
      spyOn(event, 'stopPropagation');
      scope.deleteSupportingMaterial(index, event);
    });

    it('should $emit a deleteSupportingMaterial event', function() {
      expect(scope.$emit).toHaveBeenCalledWith('deleteSupportingMaterial', {index: index});
    });

    it('should cancel the provided event', function() {
      expect(event.preventDefault).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

  });

  describe('fileSizeGreaterThanMax event', function() {
    beforeEach(function() {
      spyOn(console, 'warn');
      scope.$broadcast('fileSizeGreaterThanMax');
    });

    it('should warn that file is too big', function() {
      expect(console.warn).toHaveBeenCalledWith('file too big');
    });
  });

  describe('itemLoaded event', function() {
    beforeEach(function() {
      spyOn(scope, 'init');
      scope.$broadcast('itemLoaded');
    });

    it('should call the init method', function() {
      expect(scope.init).toHaveBeenCalled();
    });
  });

  describe('onNewSupportingMaterialSaveSuccess', function() {
    var data = {
      supportingMaterials: ['these', 'are', 'supporting', 'materials']
    };

    beforeEach(function() {
      spyOn($state, 'transitionTo');
      scope.item = {};
      scope.onNewSupportingMaterialSaveSuccess(data);
    });

    it('should set the item.supportingMaterials to the supportingMaterials from the parameter', function() {
      expect(scope.item.supportingMaterials).toEqual(data.supportingMaterials);
    });

    it('should transition to the new supporting material', function() {
      expect($state.transitionTo)
        .toHaveBeenCalledWith('supporting-materials', {index: jasmine.any(Number)}, {reload: true});
    });

  });

  describe('formatKB', function() {

    it("should return '--' for NaN", function() {
      expect(scope.formatKB(NaN)).toEqual('--');
    });

    it('should return 1.5mb for 1536', function() {
      expect(scope.formatKB(1536)).toEqual('1.5mb');
    });

    it('should return 512kb for 512', function() {
      expect(scope.formatKB(512)).toEqual('512kb');
    });

  });

  describe('getSupportingMaterials', function() {

    var item = {
      supportingMaterials: ['these', 'are', 'supporting', 'materials']
    };

    beforeEach(function() {
      scope.item = item;
    });

    it('should return scope.item.supportingMaterials', function() {
      expect(scope.getSupportingMaterials()).toEqual(item.supportingMaterials);
    });

  });

  describe('hasDate', function() {
    it ('should return true if supportingMaterial.dateModified is defined', function() {
      var supportingMaterial = {
        dateModified: "I'm defined!"
      };
      expect(scope.hasDate(supportingMaterial)).toBe(true);
    });

    it('should return false if supportingMaterial.dateModified is not defined', function() {
      var supportingMaterial = {};
      expect(scope.hasDate(supportingMaterial)).toBe(false);
    });
  });

  describe('getSupportingMaterialMarkup', function() {
    var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
    var index = 0;
    var content = 'content!';

    beforeEach(function() {
      spyOn(scope, 'getSupportingMaterials').and.returnValue(supportingMaterials);
      spyOn(supportingMaterialsService, 'getSupportingMaterialFile').and.returnValue({content: content});
      scope.index = index;
    });

    it('should call SupportingMaterialsService with getSupportingMaterials and index', function() {
      var result = scope.getSupportingMaterialMarkup();
      expect(supportingMaterialsService.getSupportingMaterialFile).toHaveBeenCalledWith(
        supportingMaterials, index
      );
      expect(result).toEqual(content);
    });
  });

  describe('isContentType', function() {
    var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
    var index = 0;
    var contentType = 'application/json';

    beforeEach(function() {
      scope.index = index;
      spyOn(scope, 'getSupportingMaterials').and.returnValue(supportingMaterials);
      spyOn(supportingMaterialsService, 'getContentType').and.returnValue(contentType);
    });

    it('should return true when contentType matches', function() {
      expect(scope.isContentType(contentType)).toBe(true);
    });

    it("should return false when contentType doesn't match", function() {
      expect(scope.isContentType('application/xml')).toBe(false);
    });

  });

  describe('getSupportingUrl', function() {
    var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
    var index = 0;
    var supportingUrl = "http://www.google.com";

    beforeEach(function() {
      scope.index = index;
      spyOn(scope, 'getSupportingMaterials').and.returnValue(supportingMaterials);
      spyOn(supportingMaterialsService, 'getSupportingUrl').and.returnValue(supportingUrl);
    });

    it('should return the result from SupportingMaterialsService.getSupportingUrl', function() {
      var result = scope.getSupportingUrl();
      expect(supportingMaterialsService.getSupportingUrl).toHaveBeenCalledWith(supportingMaterials, index);
      expect(result).toEqual(supportingUrl);
    });
  });

  describe('init', function() {
    var materialType = 'good one';
    var item = {
      supportingMaterials: [
        {'these': 'are', materialType: materialType}, {'supporting': 'materials', materialType: materialType}
      ]
    };
    var index = 0;
    var supportingMaterialFile = {content: 'content!'};
    var fileSize = 1024;

    beforeEach(function() {
      scope.item = item;
      scope.index = index;
      spyOn(supportingMaterialsService, 'getSupportingMaterialFile').and.returnValue(supportingMaterialFile);
      spyOn(supportingMaterialsService, 'getKBFileSize');
      scope.init();
      // Perform callback
      supportingMaterialsService.getKBFileSize.calls.mostRecent().args[2](fileSize);
    });

    it('should set supportingMaterial to index of supportingMaterials', function() {
      expect(scope.supportingMaterial).toEqual(item.supportingMaterials[index]);
    });

    it('should set supportingMaterialFile file to supportingMaterial content', function() {
      expect(scope.supportingMaterialFile).toEqual(supportingMaterialFile);
    });

    it('should set supportingMaterialFileSize to supportingMaterial file size', function() {
      expect(scope.supportingMaterialFileSize).toEqual(fileSize);
    });

    it('should set materialType to supportingMaterial type', function() {
      expect(scope.materialType).toEqual(materialType);
    });

  });

  describe('createText', function(){
    it('should call saveSupportingMaterials', function(){
      scope.content = 'Hi';
      scope.item = {};
      scope.createText({name: 'new', materialType: 'type'});
      var material = itemService.saveSupportingMaterials.calls.mostRecent().args[0][0];
      console.log(material);
      expect(material.name).toEqual('new');
      expect(material.materialType).toEqual('type');
      expect(material.files[0].isMain).toBe(true);
      expect(material.files[0].contentType).toEqual('text/html');
      expect(material.files[0].name).toEqual('index.html');
      expect(material.files[0].content).toEqual(scope.content);
    });
  });

  describe('createFile', function(){
    it('should call saveSupportingMaterials', function(){
      pending();
    });
  });

});