 // describe('deleteSupportingMaterial event', function() {
  //   var index = 1;
  //   var data = {
  //     index: index
  //   };
  //   var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
  //   var withoutSupportingMaterial = (function() {
  //     var arr = _.clone(supportingMaterials);
  //     arr.splice(index, 1);
  //     return arr;
  //   })();
  //   var item;
  //   var itemId = 123;

  //   describe('unconfirmed delete', function() {
  //     beforeEach(function() {
  //       spyOn(mockWindow, 'confirm').and.returnValue(false);
  //       item = {
  //         supportingMaterials: _.clone(supportingMaterials)
  //       };
  //       scope.item = item;
  //       scope.$emit('deleteSupportingMaterial', data);
  //     });

  //     it('does not transition to another supportingMaterial', function() {
  //       expect($state.transitionTo).not.toHaveBeenCalled();
  //     });

  //     it('does not change item.supportingMaterials', function() {
  //       expect(scope.item.supportingMaterials).toEqual(supportingMaterials);
  //     });

  //     it('does not call ItemService.saveSupportingMaterials', function() {
  //       expect(ItemService.saveSupportingMaterials).not.toHaveBeenCalled();
  //     });

  //   });

  //   describe('confirmed delete', function() {
  //     beforeEach(function() {
  //       spyOn(mockWindow, 'confirm').and.returnValue(true);
  //       item = {
  //         supportingMaterials: _.clone(supportingMaterials)
  //       };
  //       scope.item = item;
  //       scope.itemId = 123;
  //       scope.$emit('deleteSupportingMaterial', data);
  //     });

  //     it('transitions to first supportingMaterial', function() {
  //       expect($state.transitionTo).toHaveBeenCalledWith('supporting-materials', {index: '0'}, {reload: true});
  //     });

  //     it('removes supporting material at index from item.supportingMaterials', function() {
  //       expect(scope.item.supportingMaterials).toEqual(withoutSupportingMaterial);
  //     });

  //     it('calls ItemService.saveSupportingMaterials with supporting material at index removed', function() {
  //       expect(ItemService.saveSupportingMaterials)
  //         .toHaveBeenCalledWith(withoutSupportingMaterial, jasmine.any(Function), scope.onSaveError, scope.itemId);
  //     });

  //   });

  // });

  

describe('SupportingMaterials', function() {
  
  var scope, $modal, itemService, supportingMaterialsService;

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {

    $modal = {
      open: jasmine.createSpy('open')
    };

    supportingMaterialsService = {
      delete: jasmine.createSpy('delete')
    };

    editorConfig = {
      mathJaxFeatureGroup: function() {
        return ['mathjax'];
      },
      footnotesFeatureGroup: function() {
        return ['footnotes'];
      },
      overrideFeatures: ['overrideFeatures']
    };

    itemService = {
      saveSupportingMaterials: jasmine.createSpy('saveSupportingMaterials'),
      load: jasmine.createSpy('load').and.callFake(function(onLoad, onError){
        onLoad({ supportingMaterials: []});
      })
    };

    smUtils = {

    };

    $provide.value('LogFactory', new org.corespring.mocks.editor.LogFactory());
    $provide.value('$modal', $modal);
    $provide.value('ItemService', itemService);
    $provide.value('SupportingMaterialsService', supportingMaterialsService);
    $provide.value('EditorConfig', editorConfig);
    $provide.value('EditorChangeWatcher', new org.corespring.mocks.editor.EditorChangeWatcher());
    $provide.value('editorDebounce', org.corespring.mocks.editor.debounce);
    $provide.value('SmUtils', smUtils);
  }));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    $controller('SupportingMaterials', {$scope: scope});
  }));

  describe('initialization', function() {

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

    describe('ItemService.load -> onLoad', function() {
      it('should set the item', function() {
        expect(scope.item).not.toBe(null);
      });
      
      it('should set the item.supportingMaterials', function() {
        expect(scope.item.supportingMaterials).not.toBe(null);
      });
    });
  });

  describe('addNew', function() {
    var callback;
    beforeEach(function() {
      callback = jasmine.createSpy('callback');
      $modal.open.and.returnValue({
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
        backdrop: 'static',
        resolve: {
          materialNames: jasmine.any(Function)
        }
      });
    });

  });

  describe('deleteMaterial', function() {
    
    var onSuccess, onError, material, done; 
    beforeEach(function() {
      material = {name: 'delete-me'};
      done = jasmine.createSpy('done');
      supportingMaterialsService.delete.and.callFake(function(m, success, error){
        onSuccess = success;
        onError = error;
      });
      scope.deleteMaterial(material, done);
    });

    it('should call SupportingMaterialsService.delete', function() {
      expect(supportingMaterialsService.delete).toHaveBeenCalledWith(material, jasmine.any(Function), jasmine.any(Function));
    });

    describe('on success', function(){

      beforeEach(function(){
        onSuccess();
      });

      it('should deselect the selected material', function(){
        expect(scope.selectedMaterial).toBe(null);
      });
      
      it('should deselect the preview url', function(){
        expect(scope.binaryPreviewUrl).toBe(null);
      });

      it('should call the done callback', function(){
        expect(done).toHaveBeenCalled();
      });
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