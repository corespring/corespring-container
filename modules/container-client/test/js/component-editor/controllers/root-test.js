describe('component-editor Root', function(){

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, rootScope, controller, Msgr, iFrameService;

  beforeEach(module(function($provide) {
    
    var mocks = org.corespring.mocks.editor;
   
    iFrameService=  mocks.iFrameService();
    Msgr = mocks.Msgr();
    $provide.value('ComponentData', mocks.ComponentData());
    $provide.value('iFrameService', iFrameService);
    $provide.value('DesignerService', mocks.DesignerService());
    $provide.value('ComponentDefaultData', mocks.ComponentDefaultData());
    $provide.value('WiggiDialogLauncher', {});
    $provide.value('EditorDialogTemplate', {});
    $provide.value('Msgr', Msgr);
    $provide.value('LogFactory', new mocks.LogFactory());
    $provide.value('$log', mocks.$log());
    $provide.value('$timeout', mocks.$timeout());
    $provide.value('SINGLE_COMPONENT_KEY', 'compKey');
    $provide.value('COMPONENT_EDITOR', {componentType: 'componentType'});
  }));

  beforeEach(inject(function($rootScope, $controller) {
    rootScope = $rootScope;
    controller = $controller;
    scope = $rootScope.$new();
    controller('Root', {$scope: scope});
  }));

  describe('initialization', function(){

    beforeEach(function(){
      controller('Root', {$scope: scope});
    });

    it('sets componentKey', function(){
      expect(scope.componentKey).toEqual('compKey');
    });
    
  });

  describe('in iframe', function(){
  

    var msgrHandlers = {};

    beforeEach(function(){
      iFrameService.isInIFrame.and.returnValue(true);
      iFrameService.bypassIframeLaunchMechanism.and.returnValue(false);
      Msgr.on.and.callFake(function(key, handler){
        msgrHandlers[key] = handler;
        if(key === 'initialise'){
          handler({});
        }
      });
    });

    describe('initialization', function(){
      function assertMsgrOn(key, fnMatcher){
        fnMatcher = fnMatcher || jasmine.any(Function);
        it('calls Msgr.on(' + key +')', function(){
           expect(Msgr.on).toHaveBeenCalledWith(key, fnMatcher);
        });
      }

      beforeEach(function(){
        controller('Root', {$scope: scope});
      });
      
      assertMsgrOn('initialise');
      assertMsgrOn('getData');
      assertMsgrOn('showNavigation');
      assertMsgrOn('showPane');
      assertMsgrOn('getComponentKey');
      assertMsgrOn('setData');
      
      it('calls Msgr.send(ready)', function(){
        expect(Msgr.send).toHaveBeenCalledWith('ready');
      });

    });

    describe('Msgr.on(getComponentKey)', function(){

      it('calls the callback with the key', function(done){
        controller('Root', {$scope: scope}); 
        msgrHandlers.getComponentKey(null, function(err, key){
          expect(key).toEqual(scope.componentKey);
          done();
        });
      });
    }); 
  });

});