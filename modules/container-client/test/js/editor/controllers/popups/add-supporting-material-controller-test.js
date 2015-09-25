describe('AddSupportingMaterialPopupController', function() {

  var scope, controllerFn, $modalInstance;

  beforeEach(angular.mock.module('corespring-editor.controllers'));
  
  var materialNames = ['apple', 'banana'];
  var LogFactory = {
    getLogger: function() {}
  };
  
  function mkController(s){
    controllerFn('AddSupportingMaterialPopupController', {
      $scope: s,
      materialNames: materialNames
    });
  }

  beforeEach(module(function($provide) {
    $modalInstance = new org.corespring.mocks.editor.$modalInstance();
    $provide.value('$timeout', function(fn){ fn(); });
    $provide.value('$modalInstance', $modalInstance);
    $provide.value('LogFactory', LogFactory);
  }));
  
  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    controllerFn = $controller;
    spyOn(scope, '$broadcast');
    mkController(scope);
  }));

  describe('initialization', function() {
    var defaultSupportingMaterial = {
      source: 'html'
    };

    it('should set supportingMaterial to default', function() {
      expect(scope.supportingMaterial).toEqual(defaultSupportingMaterial);
    });

    it('should set materialNames', function(){
      expect(scope.materialNames).toEqual(materialNames);
    });
  });


  describe('opened', function(){
    it('calls $broadcast with metadata.focus-title', function(){
      expect(scope.$broadcast).toHaveBeenCalledWith('metadata.focus-title');
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