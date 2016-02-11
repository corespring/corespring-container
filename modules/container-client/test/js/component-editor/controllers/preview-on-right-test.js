describe('component-editor PreviewOnRight', function(){

  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, controller;

  beforeEach(inject(function($rootScope, $controller) {
    controller = $controller;
    scope = $rootScope.$new();
    controller('PreviewOnRight', {$scope: scope});
  }));

  describe('initialization', function(){
    it('sets showPreview', function(){
      expect(scope.showPreview).toBe(true);
    });
  });

  describe('$on(\'showPreview\')', function(){

    it('sets showPreview to false', function(){
      scope.$broadcast('showPreview', false);
      expect(scope.showPreview).toBe(false);
    });
    
    it('updates showPreview', function(){
      scope.showPreview = false;
      scope.$broadcast('showPreview', true);
      expect(scope.showPreview).toBe(true);
    });
  });

});