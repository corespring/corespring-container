describe('DevEditorRoot', function() {

  var scope, element;

  var ItemService = {
    load: jasmine.createSpy('load'),
    saveXhtml: jasmine.createSpy('saveXhtml'),
    saveAll: jasmine.createSpy('saveAll'),
    saveCustomScoring: jasmine.createSpy('saveCustomScoring'),
    saveComponents: jasmine.createSpy('saveComponents')
  };

  var ComponentData = {
    setModel: jasmine.createSpy('setModel'),
    registerComponent: jasmine.createSpy('registerComponent')
  };

  var $log = {
    debug: jasmine.createSpy('debug'),
    error: jasmine.createSpy('error')
  };

  var iFrameService = {
    isInIFrame: jasmine.createSpy('isInIFrame'),
    bypassIframeLaunchMechanism: jasmine.createSpy('bypassIframeLaunchMechanism'),
  };

  function makeMockTimeout(){
    var timeout = function(fn){
      fn();
    };
    timeout.cancel = function(){};
    timeout.flush = function(){};
    return timeout;
  }


  afterEach(function() {
    ItemService.load.calls.reset();
    ItemService.saveXhtml.calls.reset();
    ItemService.saveCustomScoring.calls.reset();
    ItemService.saveComponents.calls.reset();
    ComponentData.setModel.calls.reset();
    ComponentData.registerComponent.calls.reset();
    $log.error.calls.reset();
  });

  beforeEach(angular.mock.module('corespring-dev-editor.controllers'));

  var Msgr;

  beforeEach(module(function($provide) {
    Msgr = {
      on: jasmine.createSpy('on'),
      send: jasmine.createSpy('send')
    };
    $provide.value('ItemService', ItemService);
    $provide.value('ComponentData', ComponentData);
    $provide.value('iFrameService', iFrameService);
    $provide.value('Msgr', Msgr);
    $provide.value('$log', $log);
    $provide.value('$timeout', makeMockTimeout() );
  }));

  var createController;

  beforeEach(inject(function($rootScope, $compile) {
    createController = function() {
      scope = $rootScope.$new();
      element = $compile('<div ng-controller="DevEditorRoot"></div>')(scope);
      scope = element.scope();
    };
  }));

  describe('initialization', function() {
    beforeEach(createController);
    it('should call ItemService.load', function() {
      expect(ItemService.load).toHaveBeenCalledWith(scope.onItemLoaded, scope.onItemLoadError);
    });

    it('should listen to saveAll message', function() {
      expect(Msgr.on).toHaveBeenCalledWith('saveAll', jasmine.any(Function));
    });

  });

  describe('saveAll', function() {
    beforeEach(createController);

    describe('should save local changes before calling service', function() {

      beforeEach(function () {
        var components = {};
        var item = {
          components: components,
          xhtml: '<div>foo</div>',
          customScoring: ''
        };
        scope.onItemLoaded(item);
      });

      function getItemPassedToService(){
        var args = ItemService.saveAll.calls.mostRecent().args;
        return args[0];
      }

      it("should save change to components", function () {
        var changedValue = {
          1: 'component!'
        };
        scope.components = changedValue;
        scope.saveAll();
        expect(getItemPassedToService().components).toEqual(changedValue);
      });

      it("should save change to customScoringJs", function () {
        var changedValue = "var someVar='some value'";
        scope.customScoringJs = changedValue;
        scope.saveAll();
        expect(getItemPassedToService().customScoring).toEqual(changedValue);
      });

      it("should save change to xhtml", function () {
        var changedValue = "<div>bar</div>";
        scope.xhtml = changedValue;
        scope.saveAll();
        expect(getItemPassedToService().xhtml).toEqual(changedValue);
      });

    });
    it('on receiving saveAll message item should be saved via ItemService', function() {
      scope.saveAll();
      expect(ItemService.saveAll).toHaveBeenCalled();
    });
  });

  describe('onItemLoaded', function() {
    var components = [];
    var item = {
      components: components,
      xhtml: '<div>woo</div>'
    };

    beforeEach(function() {
      createController();
      scope.onItemLoaded(item);
    });

    it('should set item', function() {
      expect(scope.item).toEqual(item);
    });

    it('should call ComponentData.setModel with item.components', function() {
      expect(ComponentData.setModel).toHaveBeenCalledWith(item.components);
    });

    it('should set xhtml to item.xhtml', function() {
      expect(scope.xhtml).toEqual(item.xhtml);
    });

    it('should set json to formatted item.components', function() {
      expect(scope.json).toEqual(JSON.stringify(item.components, undefined, 2));
    });

  });

  describe('dispatch itemChanged', function(){
    beforeEach(function(){
      var item = {
        components: {},
        customJs: '',
        xhtml: '<div>foo</div>'
      };
      createController();
      scope.onItemLoaded(item);
      Msgr.send.calls.reset();
    });
    it("when components have been changed", function(){
      scope.components = {1:"component!"};
      scope.$digest();
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', {partsChanged:['components']});
    });
    it("when customScoring has been changed", function(){
      scope.customScoringJs = "var s = 'something';";
      scope.$digest();
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', {partsChanged:['customScoring']});
    });
    it("when xhtml has been changed", function(){
      scope.xhtml = '<div>bar</div>';
      scope.$digest();
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', {partsChanged:['xhtml']});
    });
  });

  describe('save', function() {

    beforeEach(createController);

    describe('xhtml', function() {

      describe('xhtml has not changed', function() {
        var xhtml = "<div>unchanged!</div>";
        var item = {
          xhtml: xhtml
        };

        beforeEach(function() {
          scope.item = item;
          scope.xhtml = xhtml;
          scope.save();
        });

        it('should not save xhtml', function() {
          expect(ItemService.saveXhtml).not.toHaveBeenCalled();
        });
      });

      describe('xhtml has changed', function() {
        var xhtml = "<div>new</div>";
        var item = {
          xhtml: "<div>original</div>"
        };

        beforeEach(function() {
          scope.item = item;
          scope.xhtml = xhtml;
          scope.save();
        });

        it('should save xhtml and post message', function() {
          expect(ItemService.saveXhtml).toHaveBeenCalledWith(xhtml, jasmine.any(Function));
          expect(Msgr.send).toHaveBeenCalledWith('itemChanged', {partChanged: 'xhtml'});
        });

      });

      describe('customScoring has changed', function() {
        var newCustomScoring = "new";
        var item = {
          customScoring: "original"
        };

        beforeEach(function() {
          scope.item = item;
          scope.customScoringJs = newCustomScoring;
          scope.save();
        });

        it('should save custom scoring', function() {
          expect(ItemService.saveCustomScoring).toHaveBeenCalledWith(newCustomScoring, jasmine.any(Function));
          expect(Msgr.send).toHaveBeenCalledWith('itemChanged', {partChanged: 'customScoring'});
        });
      });
    });

    describe('components', function() {

      describe('components have not changed', function() {
        var components = {
          1: 'component!'
        };
        var item = {
          components: components
        };

        beforeEach(function() {
          scope.item = item;
          scope.components = components;
          scope.save();
        });

        it('should not save components', function() {
          expect(ItemService.saveComponents).not.toHaveBeenCalled();
        });
      });

      describe('components have changed', function() {
        var components = {
          1: 'new component!'
        };
        var item = {
          components: {
            1: 'old component!'
          }
        };

        beforeEach(function() {
          scope.item = item;
          scope.components = components;
          scope.save();
        });

        it('should save components and post message', function() {
          expect(ItemService.saveComponents).toHaveBeenCalledWith(components, jasmine.any(Function));
          expect(Msgr.send).toHaveBeenCalledWith('itemChanged', {partChanged: 'components'});
        });
      });
    });

  });

  describe('aceJsonChanged', function() {

    beforeEach(createController);

    describe('valid json', function() {
      var json = '{"valid":"json"}';

      beforeEach(function() {
        scope.json = json;
        scope.aceJsonChanged();
      });

      it('should set components to parsed json', function() {
        expect(scope.components).toEqual(JSON.parse(json));
      });

    });

    describe('invalid json', function() {
      var json = "this is not valid json";
      beforeEach(function() {
        scope.json = json;
        scope.aceJsonChanged();
      });

      it('should log an error', function() {
        expect($log.error).toHaveBeenCalled();
      });

    });
  });

  describe('onItemLoadError', function() {
    beforeEach(function() {
      spyOn(window, 'alert');
      createController();
      scope.onItemLoadError();
    });

    it('should call window.alert with error message', function() {
      expect(window.alert).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('registerComponent event', function() {
    var id = 1234;
    var componentBridge = {'component': 'bridge'};

    beforeEach(function() {
      createController();
      scope.$broadcast('registerComponent', id, componentBridge, {});
    });

    it('should call ComponentData.registerComponent with id and componentBridge', function() {
      expect(ComponentData.registerComponent).toHaveBeenCalledWith(id, componentBridge, {});
    });

  });

  describe('in iframe', function(){

    beforeEach(function(){
      iFrameService.isInIFrame.and.returnValue(true);
      createController();
    });

    it("should listen to initialise", function(){
      expect(Msgr.on).toHaveBeenCalledWith('initialise', jasmine.any(Function));
    });

    it("should send the ready message", function(){
      expect(Msgr.send).toHaveBeenCalledWith('ready');
    });

    describe('initialise message handler', function(){

      var onInitialise;

      beforeEach(function(){
        onInitialise = Msgr.on.calls.first().args[1];
        ItemService.load.calls.reset();
        Msgr.on.calls.reset();
        Msgr.send.calls.reset();
      });

      it("should set the initialData", function(){
        var initialData = {hideSaveButton: true};
        onInitialise(initialData);
        expect(scope.initialData).toEqual(initialData);
      });

      it("should call ItemService.load", function(){
        onInitialise({});
        expect(ItemService.load).toHaveBeenCalled();
      });

      it("should send 'rendered' message", function(){
        onInitialise({});
        expect(Msgr.send).toHaveBeenCalledWith('rendered');
      });

    });

  });

});