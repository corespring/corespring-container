describe('OpenPopupController', function() {

  var scope, element;

  var $modalInstance = new org.corespring.mocks.editor.$modalInstance();

  afterEach(function() {
    $modalInstance.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$modalInstance', $modalInstance);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="OpenPopupController"></div>')(scope);
    scope = element.scope();
  }));

  describe('ok', function() {
    var selectedItem = "hey this item is selected";

    beforeEach(function() {
      scope.selected = {
        item: selectedItem
      };
      scope.ok();
    });

    it('should call $modalInstance.close with selected.item', function() {
      expect($modalInstance.close).toHaveBeenCalledWith(selectedItem);
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