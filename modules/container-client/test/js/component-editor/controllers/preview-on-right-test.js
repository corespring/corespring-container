describe('component-editor PreviewOnRight', function(){

  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, rootScope, controller, Msgr, iFrameService;

  beforeEach(module(function($provide) {
    
  }));

  beforeEach(inject(function($rootScope, $controller) {
    rootScope = $rootScope;
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
  

  });

});