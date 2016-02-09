describe('component-editor Root', function(){

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, rootScope, controller, Msgr;

  beforeEach(module(function($provide) {
    
    var mocks = org.corespring.mocks.editor;
   
    $provide.value('ComponentData', mocks.ComponentData());
    $provide.value('iFrameService', mocks.iFrameService());
    $provide.value('DesignerService', mocks.DesignerService());
    $provide.value('ComponentDefaultData', mocks.ComponentDefaultData());
    $provide.value('WiggiDialogLauncher', {});
    $provide.value('EditorDialogTemplate', {});
    $provide.value('Msgr', Msgr);
    $provide.value('LogFactory', new mocks.LogFactory());
    $provide.value('$log', mocks.$log());
    $provide.value('$timeout', mocks.$timeout());
    $provide.value('SINGLE_COMPONENT_KEY', 'compKey');
    $provide.value('COMPONENT_EDITOR', {compoentType: 'componentType'});
  }));

  beforeEach(inject(function($rootScope, $controller) {
    rootScope = $rootScope;
    controller = $controller;
    scope = $rootScope.$new();
    controller('Root', {$scope: scope});
  }));

  describe('initialization', function(){

    it('sets componentKey', function(){
      expect(scope.componentKey).toEqual('compKey');
    });
    
    it('sets componentType', function(){
      expect(scope.componentType).toEqual('componentType');
    });
    
    it('sets activePane', function(){
      expect(scope.activePane).toEqual('config');
    });
    
    it('sets showNavigation', function(){
      expect(scope.showNavigation).toEqual(true);
    });
  });

});