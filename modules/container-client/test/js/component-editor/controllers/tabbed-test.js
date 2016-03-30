describe('component-editor PreviewOnRight', function(){

  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, controller;

  beforeEach(inject(function($rootScope, $controller) {
    controller = $controller;
    scope = $rootScope.$new();
    controller('Tabbed', {$scope: scope});
  }));

  describe('initialization', function(){
    it('sets activePane', function(){
      expect(scope.activePane).toEqual('config');
    });
    
    it('sets showNavigation', function(){
      expect(scope.showNavigation).toBe(false);
    });
  });
  
  describe('$on(\'showPane\')', function(){

    it('sets activePane to config', function(){
      scope.$broadcast('showPane', 'config');
      expect(scope.activePane).toEqual('config');
    });
    
    it('sets activePane to preview', function(){
      scope.$broadcast('showPane', 'preview');
      expect(scope.activePane).toEqual('preview');
    });
  });

  describe('$on(\'showNavigation\')', function(){

    it('sets showNavigation to true', function(){
      scope.showNavigation = false;
      scope.$broadcast('showNavigation', true);
      expect(scope.showNavigation).toBe(true);
    });
    
    it('sets showNavigation to false', function(){
      scope.showNavigation = true;
      scope.$broadcast('showNavigation', false);
      expect(scope.showNavigation).toBe(false);
    });
  });
});