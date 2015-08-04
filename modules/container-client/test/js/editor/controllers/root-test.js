describe('editor root', function() {

  var scope, element, EVENTS;
  var iFrame = false, bypassIframeLaunchMechanism = false;

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-editor.controllers'));

  var $state = {
    transitionTo: jasmine.createSpy('transitionTo')
  };
  var ComponentRegister = {};
  var ConfigurationService = {
    setConfig: jasmine.createSpy('setConfig')
  };
  var ItemService = {
    load: jasmine.createSpy('load'),
    saveSupportingMaterials: jasmine.createSpy('saveSupportingMaterials')
  };
  var mockError = jasmine.createSpy('error');
  var LogFactory = {
    getLogger: jasmine.createSpy('getLogger').and.returnValue({
      debug: function() {},
      log: function() {},
      error: mockError
    })
  };
  var iFrameService = {
    isInIFrame: function() {
      return iFrame;
    },
    bypassIframeLaunchMechanism: function(){
      return bypassIframeLaunchMechanism;
    }
  };
  var Msgr = {
    on: jasmine.createSpy('on'),
    send: jasmine.createSpy('send')
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

  var mockWindow = {
    confirm: function(msg){
      return true;
    },
    location: {
      search: 'query-string'
    }
  };

  beforeEach(module(function($provide) {
    $provide.value('$state', $state);
    $provide.value('$window', mockWindow);
    $provide.value('ComponentRegister', ComponentRegister);
    $provide.value('ConfigurationService', ConfigurationService);
    $provide.value('ItemService', ItemService);
    $provide.value('LogFactory', LogFactory);
    $provide.value('iFrameService', iFrameService);
    $provide.value('Msgr', Msgr);
    $provide.value('WiggiDialogLauncher',  WiggiDialogLauncher);
    $provide.value('EditorDialogTemplate', EditorDialogTemplate);
  }));

  afterEach(function() {
    _.each([ItemService, LogFactory], function(mock) {
      _.keys(mock, function(key) {
        if (_.isFunction(mock[key])) {
          mock[key].calls.reset();
        }
      });
    });
  });

  function render() {
    scope = rootScope.$new();
    element = compile('<div ng-controller="Root"></div>')(scope);
    scope = element.scope();
  }

  beforeEach(inject(function($rootScope, $compile, WIGGI_EVENTS) {
    rootScope = $rootScope;
    compile = $compile;
    EVENTS = WIGGI_EVENTS;
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

      it("should bind to Msgr '*'", function() {
        expect(Msgr.on).toHaveBeenCalledWith('*', jasmine.any(Function));
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

  describe('deleteSupportingMaterial event', function() {
    var index = 1;
    var data = {
      index: index
    };
    var supportingMaterials = ['these', 'are', 'supporting', 'materials'];
    var withoutSupportingMaterial = (function() {
      var arr = _.clone(supportingMaterials);
      arr.splice(index, 1);
      return arr;
    })();
    var item;
    var itemId = 123;

    describe('unconfirmed delete', function() {
      beforeEach(function() {
        spyOn(mockWindow, 'confirm').and.returnValue(false);
        item = {
          supportingMaterials: _.clone(supportingMaterials)
        };
        scope.item = item;
        scope.$emit('deleteSupportingMaterial', data);
      });

      it('does not transition to another supportingMaterial', function() {
        expect($state.transitionTo).not.toHaveBeenCalled();
      });

      it('does not change item.supportingMaterials', function() {
        expect(scope.item.supportingMaterials).toEqual(supportingMaterials);
      });

      it('does not call ItemService.saveSupportingMaterials', function() {
        expect(ItemService.saveSupportingMaterials).not.toHaveBeenCalled();
      });

    });

    describe('confirmed delete', function() {
      beforeEach(function() {
        spyOn(mockWindow, 'confirm').and.returnValue(true);
        item = {
          supportingMaterials: _.clone(supportingMaterials)
        };
        scope.item = item;
        scope.itemId = 123;
        scope.$emit('deleteSupportingMaterial', data);
      });

      it('transitions to first supportingMaterial', function() {
        expect($state.transitionTo).toHaveBeenCalledWith('supporting-materials', {index: '0'}, {reload: true});
      });

      it('removes supporting material at index from item.supportingMaterials', function() {
        expect(scope.item.supportingMaterials).toEqual(withoutSupportingMaterial);
      });

      it('calls ItemService.saveSupportingMaterials with supporting material at index removed', function() {
        expect(ItemService.saveSupportingMaterials)
          .toHaveBeenCalledWith(withoutSupportingMaterial, jasmine.any(Function), scope.onSaveError, scope.itemId);
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
      expect(mockError).toHaveBeenCalledWith(jasmine.any(String), message);
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