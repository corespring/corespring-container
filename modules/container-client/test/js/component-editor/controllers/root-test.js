describe('component-editor Root', function(){

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, rootScope, controller, Msgr, iFrameService, debounce, compKey;

  beforeEach(module(function($provide) {

    var mocks = org.corespring.mocks.editor;
    
    debounce = jasmine.createSpy('debounce').and.callFake(function(fn){
      return fn;
    });  

    iFrameService=  mocks.iFrameService();
    compKey = 'compKey';
    Msgr = mocks.Msgr();
    $provide.value('$log', mocks.$log());
    $provide.value('$timeout', mocks.$timeout());
    $provide.value('debounce', debounce);
    $provide.value('COMPONENT_EDITOR', {componentType: 'componentType'});
    $provide.value('ComponentData', mocks.ComponentData());
    $provide.value('ComponentDefaultData', mocks.ComponentDefaultData());
    $provide.value('DesignerService', mocks.DesignerService());
    $provide.value('EditorDialogTemplate', {});
    $provide.value('iFrameService', iFrameService);
    $provide.value('LogFactory', new mocks.LogFactory());
    $provide.value('Msgr', Msgr);
    $provide.value('SINGLE_COMPONENT_KEY', compKey);
    $provide.value('WiggiDialogLauncher', {});
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
  });

  describe('$watch(data.prompt)', function(){

  });

  describe('getData', function(){

    var configPanel;

    beforeEach(function(){
      
      configPanel = {
        getModel: jasmine.createSpy('getModel').and.returnValue('hi'),
        setModel: jasmine.createSpy('setModel')
      };

      controller('Root', {$scope: scope});
      scope.$broadcast('registerConfigPanel', 'singleComponent', configPanel);
    });

    it('returns data', function(){
      var data = scope.getData();
      var expected = {
        xhtml: jasmine.any(String),
        components: {}
      };
      expected.components[compKey] = 'hi';
      expect(data).toEqual(expected);
    });
  });
  
  describe('setData', function(){
    
    var done, data; 
    beforeEach(function(){
      
      done = jasmine.createSpy('done');
      data = {
        xhtml: '<div><prompt>I\'m a prompt</prompt><div componentType="" id="'+ compKey + '"</div>',
        components: {
          compKey: {
            componenType: 'componentType'  
          }
        }
      };

      configPanel = {
        getModel: jasmine.createSpy('getModel').and.returnValue('hi'),
        setModel: jasmine.createSpy('setModel')
      };

      controller('Root', {$scope: scope});
      scope.$broadcast('registerConfigPanel', 'singleComponent', configPanel);
      scope.setData(data, done);
    });

    it('sets the prompt', function(){
      expect(scope.data.prompt).toEqual('I\'m a prompt');
    });

    // it('sets the data', function(){

    // });
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

      describe('dimension update', function(){

        it('triggers lockfixed:pageupdate', inject(function($document){
          $document.trigger = jasmine.createSpy();
          scope.dimensionUpdate({});
          expect($document.trigger).toHaveBeenCalled();
        }));
      });
    });

  });
});