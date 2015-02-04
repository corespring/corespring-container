describe('AddSupportingMaterialPopupController', function() {

  var scope, element;

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  var $modalInstance = {
    close: jasmine.createSpy('close'),
    dismiss: jasmine.createSpy('dismiss')
  };
  var LogFactory = {
    getLogger: function() {}
  };

  beforeEach(module(function($provide) {
    $provide.value('$modalInstance', $modalInstance);
    $provide.value('LogFactory', LogFactory);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="AddSupportingMaterialPopupController"></div>')(scope);
    scope = element.scope();
  }));

  afterEach(function() {
    $modalInstance.close.calls.reset();
    $modalInstance.dismiss.calls.reset();
  });

  describe('initialization', function() {
    var defaultSupportingMaterial = {
      method: 'createHtml'
    };

    it('should set supportingMaterial to default', function() {
      expect(scope.supportingMaterial).toEqual(defaultSupportingMaterial);
    });
  });

  describe('isSubmitDisabled', function() {

    describe('supporting material has no name', function() {
      beforeEach(function() {
        scope.supportingMaterial.name = undefined;
      });

      it('should return true', function() {
        expect(scope.isSubmitDisabled()).toBe(true);
      });

    });

    describe('supporting material has a name', function() {
      beforeEach(function() {
        scope.supportingMaterial.name = "my sweet rubric";
      });

      it('should return false', function() {
        expect(scope.isSubmitDisabled()).toBe(false);
      });

      describe('upload file is empty', function() {
        beforeEach(function() {
          scope.supportingMaterial.method = 'uploadFile';
        });

        it('should return true', function() {
          expect(scope.isSubmitDisabled()).toBe(true);
        });
      });

    });

  });

  describe('fileChange event', function() {
    var file = "hey this is a file!";
    beforeEach(function() {
      scope.$emit('fileChange', file);
    });

    it('should set supportingMaterial.fileToUpload to be file', function() {
      expect(scope.supportingMaterial.fileToUpload).toEqual(file);
    });

  });

  describe('ok', function() {
    beforeEach(function() {
      scope.ok();
    });

    it('should call $modalInstance.close with supportingMaterial', function() {
      expect($modalInstance.close).toHaveBeenCalledWith(scope.supportingMaterial);
    });
  });

  describe('cancel', function() {
    beforeEach(function() {
      scope.cancel();
    });

    it('should call $modalInstance.dismiss', function() {
      expect($modalInstance.dismiss).toHaveBeenCalled();
    });

  });

});

describe('filechange', function() {

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<input type="file" filechange="" />')(scope);
    scope = element.scope();
  }));

  describe('change event on element', function() {
    beforeEach(function() {
      spyOn(scope, '$apply').and.callThrough();
      spyOn(scope, '$emit');
      element.change();
    });

    it('should $emit a fileChange event', function() {
      expect(scope.$emit).toHaveBeenCalledWith('fileChange', undefined);
    });

    it('should call scope.$apply', function() {
      expect(scope.$apply).toHaveBeenCalled();
    });

  });


});