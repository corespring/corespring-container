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
  
  var scope, $modal, itemService, supportingMaterialsService, imageUtils;

  beforeEach(angular.mock.module('corespring-common.supporting-materials.services'));
  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {

    $modal = {
      open: jasmine.createSpy('open')
    };

    supportingMaterialsService = {
      delete: jasmine.createSpy('delete'),
      getBinaryUrl: jasmine.createSpy('getBinaryUrl'),
      updateContent: jasmine.createSpy('updateContent'),
      create: jasmine.createSpy('create')
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


    $provide.value('LogFactory', new org.corespring.mocks.editor.LogFactory());
    $provide.value('$modal', $modal);
    $provide.value('ItemService', itemService);
    $provide.value('SupportingMaterialsService', supportingMaterialsService);
    $provide.value('EditorConfig', editorConfig);
    $provide.value('EditorChangeWatcher', new org.corespring.mocks.editor.EditorChangeWatcher());
    $provide.value('editorDebounce', org.corespring.mocks.editor.debounce);

    //For SmUtils
    $provide.value('SupportingMaterialUrls', {});
  }));

  beforeEach(inject(function($rootScope, $controller, ImageUtils) {
    scope = $rootScope.$new();
    $controller('SupportingMaterials', {$scope: scope});
    imageUtils = ImageUtils;
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

      supportingMaterialsService.create.and.callFake(function(req, onCreate, onError){
        onCreate({name: 'new-material'});
      });

      $modal.open.and.returnValue({
        result: {
          then: function(cb){
            callback = cb;
          } 
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

    it('should call SupportingMaterialsService.create', function(){
      callback({source: 'html'});
      expect(supportingMaterialsService.create).toHaveBeenCalledWith({source:'html'}, jasmine.any(Function), jasmine.any(Function));
    });

    it('should call onCreate callack', function(){
      callback({source: 'html'});
      expect(scope.item.supportingMaterials.length).toBe(1);
      expect(scope.selectedMaterial).toEqual({name: 'new-material'});
    });

  });

  describe('deleteMaterial', function() {
    
    var onSuccess, onError, material, done, confirmRemove; 
    beforeEach(function() {
      material = {name: 'delete-me'};
      done = jasmine.createSpy('done');
      $modal.open.and.returnValue({
        result: {
          then: function(cb){
            confirmRemove = cb;
          }
        }
      });
      supportingMaterialsService.delete.and.callFake(function(m, success, error){
        onSuccess = success;
        onError = error;
      });

      scope.item.supportingMaterials = [material];
      scope.deleteMaterial(material, done);
      confirmRemove();
    });

    it('should call SupportingMaterialsService.delete', function() {
      expect(supportingMaterialsService.delete).toHaveBeenCalledWith(material, jasmine.any(Function), jasmine.any(Function));
    });

    it('should call $modal.open', function(){
      expect($modal.open).toHaveBeenCalledWith(
        {
          templateUrl: '/templates/popups/removeSupportingMaterial',
          controller: 'RemoveSupportingMaterialPopupController',
          backdrop: 'static',
          resolve: {
            name: jasmine.any(Function)
          }
        });
    });

    it('should remove the material from the item', function(){
      expect(scope.item.supportingMaterials).toEqual([]);
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

  describe('chooseMaterial', function(){
    it('sets the selectedMaterial', function(){
      scope.chooseMaterial({name: 'm'});
      expect(scope.selectedMaterial).toEqual({name: 'm'});
    });
  });
  
  describe('$watch(selectedMaterial)', function(){


    function describeSelectedMaterial(file){
      file.isMain = true;
      return function(){

        beforeEach(function(){
          supportingMaterialsService.getBinaryUrl.and.returnValue('url');
          scope.selectedMaterial = { files: [file]};
          scope.$apply();
        });

        it('sets mainFile', function(){
          expect(scope.mainFile).toBe(file);
        }); 

        it('sets isHtml', function(){
          expect(scope.isHtml).toEqual(file.contentType === 'text/html');
        });
        
        it('sets isBinary', function(){
          expect(scope.isBinary).toEqual(file.contentType !== 'text/html');
        });

        it('sets binaryPreviewUrl', function(){
          if(scope.isBinary){
            expect(scope.binaryPreviewUrl).toEqual('url');
          } else {

          }
        }); 
      };
    }

    describe('html', describeSelectedMaterial({name: 'index.html', contentType: 'text/html'})); 
    describe('binary', describeSelectedMaterial({name: 'index.png', contentType: 'image/png'})); 
  });


  describe('imageService', function(){
      
    beforeEach(function(){
      scope.selectedMaterial = {name: 'material'}; 
    });

    describe('addFile', function(){

      var onComplete,onProgress;
      
      beforeEach(function(){
        supportingMaterialsService.addAsset = jasmine.createSpy('addAsset');
        onComplete = jasmine.createSpy('onComplete');
        onProgress = jasmine.createSpy('onProgress');
      });

      it('returns error if file is too big', function(){
        var size = 1000000;
        scope.imageService.addFile({size: size}, onComplete, onProgress);
        expect(onComplete).toHaveBeenCalledWith(imageUtils.fileTooBigError(size, 500));
        expect(supportingMaterialsService.addAsset).not.toHaveBeenCalled();
      });

      it('calls SupportingMaterialsService.addAsset', function(){
        scope.imageService.addFile({size: 10}, onComplete, onProgress);
        expect(supportingMaterialsService.addAsset).toHaveBeenCalledWith('material', {size:10}, jasmine.any(Function), jasmine.any(Function));
      });

    });

    describe('changeSrcPath', function(){
      beforeEach(function(){
        supportingMaterialsService.getAssetUrl = jasmine.createSpy('getAssetUrl');
      });

      it('calls SupportingMaterialsService.getAssetUrl', function(){
        scope.imageService.changeSrcPath('src');
        expect(supportingMaterialsService.getAssetUrl).toHaveBeenCalledWith('material', 'src') ;
      });
    });

    describe('deleteFile', function(){

      beforeEach(function(){
        supportingMaterialsService.deleteAsset = jasmine.createSpy('deleteAsset');
      });

      it('calls SupportingMaterialsService.deleteAsset', function(){
        scope.imageService.deleteFile('asset');
        expect(supportingMaterialsService.deleteAsset).toHaveBeenCalledWith('material', 'asset');
      });
    });
  });
});