describe('component-editor Root', function(){

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-singleComponentEditor.controllers'));

  var scope, 
    rootScope, 
    controller, 
    Msgr, 
    iFrameService, 
    debounce, 
    compKey, 
    componentData,
    wiggiEvents,
    dialogLauncher;

  beforeEach(module(function($provide) {

    var mocks = org.corespring.mocks.editor;
    
    debounce = jasmine.createSpy('debounce').and.callFake(function(wait, fn){
      return fn;
    });  

    iFrameService=  mocks.iFrameService();
    componentData = mocks.ComponentData();
    compKey = 'compKey';
    Msgr = mocks.Msgr();
    dialogLauncher = {
      launch: jasmine.createSpy('launchDialog')
    };

    $provide.value('$log', mocks.$log());
    $provide.value('$timeout', mocks.$timeout());
    $provide.value('debounce', debounce);
    $provide.value('COMPONENT_EDITOR', {componentType: 'componentType'});
    $provide.value('ComponentData', componentData);
    $provide.value('ComponentDefaultData', mocks.ComponentDefaultData());
    $provide.value('DesignerService', mocks.DesignerService());
    $provide.value('EditorDialogTemplate', {
      generate: jasmine.createSpy('generate').and.returnValue('generated')
    });
    $provide.value('iFrameService', iFrameService);
    $provide.value('LogFactory', new mocks.LogFactory());
    $provide.value('Msgr', Msgr);
    $provide.value('SINGLE_COMPONENT_KEY', compKey);
    $provide.value('WiggiDialogLauncher', function(){ return dialogLauncher;});
  }));

  beforeEach(inject(function($rootScope, $controller, WIGGI_EVENTS) {
    wiggiEvents = WIGGI_EVENTS;
    rootScope = $rootScope;
    controller = $controller;
    scope = $rootScope.$new();
    controller('Root', {$scope: scope});
  }));

  describe('$on(WIGGI_EVENTS.LAUNCH_DIALOG', function(){

    beforeEach(function(){
      controller('Root', {$scope: scope});
      scope.$broadcast(wiggiEvents.LAUNCH_DIALOG, {}, 'title', 'body', jasmine.createSpy('callback'), {}, {});
    });

    it('calls dialogLauncher.launch', function(){
      expect(dialogLauncher.launch)
        .toHaveBeenCalledWith(
          {}, 
          jasmine.any(String),
          jasmine.any(Function),
          {},
          {});
    });
  });

  describe('$watch(data.prompt)', function(){

    beforeEach(function(){
      controller('Root', {$scope: scope});
    });

    it('updates item.xhtml', function(){
      scope.data.prompt = 'update';
      scope.$digest();
      expect(scope.item.xhtml).toEqual(scope.getXhtml('update'));
    });
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
      configPanel = {
        setModel: jasmine.createSpy('setModel')
      };
    });

    describe('with correct data', function(){
      beforeEach(function(){
        
        data = {
          xhtml: '<div><prompt>I\'m a prompt</prompt><div componentType="" id="'+ compKey + '"</div>',
          components: {
            compKey: {
              componentType: 'componentType'  
            }
          }
        };

        controller('Root', {$scope: scope});
        scope.$broadcast('registerConfigPanel', 'singleComponent', configPanel);
        scope.setData(data, done);
      });

      it('sets the prompt', function(){
        expect(scope.data.prompt).toEqual('I\'m a prompt');
      });

      it('calls configPanel.setModel', function(){
        expect(configPanel.setModel).toHaveBeenCalledWith({componentType: 'componentType'});
      });
      
      it('calls ComponentData.updateComponent', function(){
        expect(componentData.updateComponent)
          .toHaveBeenCalledWith(compKey, {componentType: 'componentType'});
      });

      it('calls done with no error', function(){
        expect(done).toHaveBeenCalledWith(null);
      });
    }); 

    describe('with incorrect data', function(){
      
      beforeEach(function(){
        
        data = {
          xhtml: '<div><h1>I\'m a prompt</h1><div componentType="" id="'+ compKey + '"</div>',
          components: {
            compKey: {
              componentType: 'componentType'  
            }
          }
        };

        controller('Root', {$scope: scope});
        scope.$broadcast('registerConfigPanel', 'singleComponent', configPanel);
        scope.setData(data, done);
      });

      it('does not set the prompt', function(){
        expect(scope.data.prompt).toEqual('');
      });

      it('does not call configPanel.setModel', function(){
        expect(configPanel.setModel).not.toHaveBeenCalledWith({componentType: 'componentType'});
      });
      
      it('does not call ComponentData.updateComponent', function(){
        expect(componentData.updateComponent)
          .not.toHaveBeenCalledWith(compKey, {componentType: 'componentType'});
      });

      it('calls done with a prompt error', function(){
        expect(done).toHaveBeenCalledWith(scope.promptError(data.xhtml));
      });
    });
  });

  describe('in iframe', function(){

    beforeEach(function(){
      iFrameService.isInIFrame.and.returnValue(true);
      iFrameService.bypassIframeLaunchMechanism.and.returnValue(false);
    });
    
    describe('custom initialisation', function(){

      var data;
      beforeEach(function(){
        data = {
          xhtml: '<div><prompt>custom</prompt><div componentType="" id="' + compKey + '"></div></div>',
          components: {
            compKey: { 
              componentType: 'componentType'
            }
          }
        };

        Msgr.on.and.callFake(function(key, handler){
          if(key === 'initialise'){
            handler(data);
          }
        });

        controller('Root', {$scope: scope});
        scope.$digest();
      }); 

      it('sets the prompt', function(){
        expect(scope.data.prompt).toEqual('custom');
      });
      
      it('sets the xhtml', function(){
        expect(scope.item.xhtml).toEqual(scope.getXhtml('custom'));
      });
    });

    describe('initialization', function(){
      var msgrHandlers = {};

      beforeEach(function(){
        Msgr.on.and.callFake(function(key, handler){
          msgrHandlers[key] = handler;
          if(key === 'initialise'){
            handler({});
          }
        });
      });
      
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