describe('editor root', function() {

  var scope, EVENTS, controllerFn;
  var iFrame = false, bypassIframeLaunchMechanism = false;

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-editor.controllers'));

  var ConfigurationService = {
    setConfig: jasmine.createSpy('setConfig')
  };
  
  var ItemService, MetadataService, LogFactory, msgrOnHandlers, Msgr;

  var iFrameService = {
    isInIFrame: function() {
      return iFrame;
    },
    bypassIframeLaunchMechanism: function(){
      return bypassIframeLaunchMechanism;
    }
  };

  var launcher = {
    launch : jasmine.createSpy('launch')
  };
  
  function WiggiDialogLauncher(){
    return launcher;
  }

  var EditorDialogTemplate = {
    generate: jasmine.createSpy('generate').and.callFake(function(){
      return Array.prototype.slice.call(arguments);
    })
  };

  beforeEach(module(function($provide) {
    msgrOnHandlers = {};
    
    Msgr = {
      on: jasmine.createSpy('on').and.callFake(function(e,handler){
        msgrOnHandlers[e] = handler;
      }),
      send: jasmine.createSpy('send')
    };
 
    ItemService = {
      load: jasmine.createSpy('load'),
      saveAll: jasmine.createSpy('saveAll')
    };

    MetadataService = {
      get: function() {}
    };

    LogFactory = new org.corespring.mocks.editor.LogFactory();
    editorDebounce = {
      flush: jasmine.createSpy('flush')
    };

    $provide.value('$timeout', function(fn){fn();});
    $provide.value('ConfigurationService', ConfigurationService);
    $provide.value('ItemService', ItemService);
    $provide.value('MetadataService', MetadataService);
    $provide.value('LogFactory', LogFactory);
    $provide.value('iFrameService', iFrameService);
    $provide.value('Msgr', Msgr);
    $provide.value('WiggiDialogLauncher',  WiggiDialogLauncher);
    $provide.value('EditorDialogTemplate', EditorDialogTemplate);
    $provide.value('editorDebounce', editorDebounce);

  }));

  function render() {
    scope = rootScope.$new();
    controllerFn('Root', {$scope: scope});
  }

  beforeEach(inject(function($rootScope, $controller, WIGGI_EVENTS) {
    rootScope = $rootScope;
    controllerFn = $controller;
    EVENTS = WIGGI_EVENTS;

    spyOn(MetadataService, 'get').and.returnValue({
      then: function() {
      }
    });

    render();
  }));

  describe('initialization', function() {
    it('should call ItemService.load', function() {
      expect(ItemService.load).toHaveBeenCalledWith(scope.onItemLoadSuccess, scope.onItemLoadError);
    });

    it('should call ConfigurationService.setConfig with empty config', function() {
      expect(ConfigurationService.setConfig).toHaveBeenCalledWith({});
    });

    describe('when in iframe', function() {
      var oldTop = top;
      beforeEach(inject(function($rootScope, $compile) {
        iFrame = true;
        render();
        spyOn(scope, '$broadcast');
      }));

      it('should bind to Msgr initialise', function() {
        expect(Msgr.on).toHaveBeenCalledWith('initialise', jasmine.any(Function));
      });

      it("should bind to Msgr 'saveAll'", function() {
        expect(Msgr.on).toHaveBeenCalledWith('saveAll', jasmine.any(Function));
      });

      afterEach(function() {
        iFrame = false;
      });

    });

    describe('when in iframe, but bypassed', function() {
      var oldTop = top;

      beforeEach(inject(function($rootScope, $compile) {
        iFrame = true;
        bypassIframeLaunchMechanism = true;
        Msgr.on.calls.reset();
        render();
      }));

      it('should not call Msgr.initialise', function() {
        expect(Msgr.on).not.toHaveBeenCalledWith('initialise', jasmine.any(Function));
      });

      afterEach(function() {
        iFrame = false;
        bypassIframeLaunchMechanism = false;
      });

    });

  });

 

  describe('onItemLoadSuccess', function() {
    var componentType = 'component';
    var preprocessedComponent = {'component': 'has', 'been': 'preprocessed'};
    var index = '1';
    var item;

    beforeEach(function() {
      item = { components:
        (function() {
          var comps = {};
          comps[index] = {'componentType': componentType};
          return comps;
        }())
      };
      spyOn(scope, '$broadcast');
      spyOn(corespring.server, 'logic').and.returnValue({
        preprocess: function() {
          return preprocessedComponent;
        }
      });
      scope.onItemLoadSuccess(item);
    });

    it('should set item', function() {
      expect(scope.item).toEqual(item);
    });

    it('should $broadcast an itemLoaded event', function() {
      expect(scope.$broadcast).toHaveBeenCalledWith('itemLoaded', item);
    });

    it('should call corespring.server.logic for logic of componentType', function() {
      expect(corespring.server.logic).toHaveBeenCalledWith(componentType);
    });

    it('should set item components to preprocessed components', function() {
      expect(item.components[index]).toEqual(preprocessedComponent);
    });

    it('should request metadata sets', function() {
      expect(MetadataService.get).toHaveBeenCalled();
    });

  });

  describe('Item change event', function() {
    beforeEach(function() {
      Msgr.send = jasmine.createSpy('send');
      scope.$emit('itemChanged');
    });
    it('should be forwarded to the outside world via Msgr', function() {
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', undefined);
    });
  });

  describe('onItemLoadError', function() {
    var message = "hey there was an error";

    beforeEach(function() {
      scope.onItemLoadError(message);
    });

    it('should log error with provided message', function() {
      expect(LogFactory.logger.error).toHaveBeenCalledWith(jasmine.any(String), message);
    });
  });

  describe('saveAll', function() {
    var callback;
    var clientCallback;
    
    beforeEach(function(){
      iFrame = true;
      render();
      clientCallback = jasmine.createSpy('clientCallback');
      msgrOnHandlers.saveAll(null, clientCallback);
      callback = ItemService.saveAll.calls.mostRecent().args[1];
    });

    it('should call ItemService#saveAll', function() {
      expect(ItemService.saveAll).toHaveBeenCalled();
    });

    it('should call editorDebounce.flush', function(){
      callback();
      expect(editorDebounce.flush).toHaveBeenCalled();
    });

    it('should call the event caller\'s callback', function() {
      callback();
      expect(clientCallback).toHaveBeenCalledWith(null, {saved: true});
    });
  });


  describe('onLaunchDialog', function(){
    
    function assertCallToLaunch(opts, expectedContent){

      function prnArray(){
        return _.map(expectedContent, function(v){
          if(v === ''){
            return 'empty-string';
          } else if (!v){
            return 'undefined';
          } else {
            return v;
          }
        });
      }

      it('should call launch with content: [' + prnArray() + '] when omitHeader: ' + opts.omitHeader + ' and omitFooter: ' + opts.omitFooter, function(){
        var data = {};
        var title = 'title';
        var content = 'content';
        var cb = function(){};
        var scopeProps = {};
        scope.$emit(EVENTS.LAUNCH_DIALOG, data, title, content, cb, scopeProps, opts);
        expect(launcher.launch)
          .toHaveBeenCalledWith(data, expectedContent, cb, scopeProps, opts);
      });
    }

    assertCallToLaunch({}, ['title', 'content', null, null]);
    assertCallToLaunch({omitHeader: true}, ['title', 'content', '', null]);
    assertCallToLaunch({omitFooter: true}, ['title', 'content', null, '']);
    assertCallToLaunch({omitHeader: true, omitFooter: true }, ['title', 'content', '', '']);
  });

});