describe('EditTitlePopupController', function() {

  var scope, element;
  var title = "This is the title";

  var $modalInstance = {
    close: jasmine.createSpy('close'),
    dismiss: jasmine.createSpy('dismiss')
  };

  afterEach(function() {
    $modalInstance.close.calls.reset();
    $modalInstance.dismiss.calls.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('LogFactory', function() {});
    $provide.value('$modalInstance', $modalInstance);
    $provide.value('title', title);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="EditTitlePopupController"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {
    it('should set title', function() {
      expect(scope.title).toEqual(title);
    });
  });

  describe('ok', function() {
    beforeEach(function() {
      scope.ok();
    });

    it('should call $modalInstance.close with title', function() {
      expect($modalInstance.close).toHaveBeenCalledWith(scope.title);
    });
  });

  describe('cancel', function() {
    beforeEach(function() {
      scope.cancel();
    });

    it("should call $modalInstance.dismiss with 'cancel'", function() {
      expect($modalInstance.dismiss).toHaveBeenCalledWith('cancel');
    });
  });

});