describe('DevEditorRoot', function () {

  var scope, rootScope, controller;
  var ItemService, ComponentRegister, $log, iFrameService, Msgr;

  beforeEach(angular.mock.module('corespring-dev-editor.controllers'));
  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(module(function ($provide) {

    var mocks = org.corespring.mocks.editor;

    Msgr = mocks.Msgr();

    ItemService = {
      load: jasmine.createSpy('load'),
      saveXhtml: jasmine.createSpy('saveXhtml'),
      saveAll: jasmine.createSpy('saveAll'),
      saveCustomScoring: jasmine.createSpy('saveCustomScoring'),
      saveComponents: jasmine.createSpy('saveComponents')
    };

    ComponentRegister = mocks.ComponentRegister();

    $log = mocks.$log();

    iFrameService = mocks.iFrameService();

    $provide.value('ItemService', ItemService);
    $provide.value('ComponentRegister', ComponentRegister);
    $provide.value('iFrameService', iFrameService);
    $provide.value('Msgr', Msgr);
    $provide.value('$log', $log);
  }));


  beforeEach(inject(function ($rootScope, $controller) {
    rootScope = $rootScope;
    controller = $controller;
    scope = $rootScope.$new();
    controller('DevEditorRoot', { $scope: scope });
  }));

  describe('initialization', function () {
    it('should call ItemService.load', function () {
      expect(ItemService.load).toHaveBeenCalledWith(scope.onItemLoaded, scope.onItemLoadError);
    });

    it('should listen to saveAll message', function () {
      expect(Msgr.on).toHaveBeenCalledWith('saveAll', jasmine.any(Function));
    });

  });

  describe('saveAll', function () {

    describe('should save local changes before calling service', function () {

      beforeEach(function () {
        var components = {};
        var item = {
          components: components,
          xhtml: '<div>foo</div>',
          customScoring: ''
        };
        scope.onItemLoaded(item);
      });

      function getItemPassedToService() {
        var args = ItemService.saveAll.calls.mostRecent().args;
        return args[0];
      }

      it('should save change to components', function () {
        var changedValue = {
          1: 'component!'
        };
        scope.components = changedValue;
        scope.saveAll();
        expect(getItemPassedToService().components).toEqual(changedValue);
      });

      it('should save change to customScoringJs', function () {
        var changedValue = 'var someVar="some value"';
        scope.customScoringJs = changedValue;
        scope.saveAll();
        expect(getItemPassedToService().customScoring).toEqual(changedValue);
      });

      it('should save change to xhtml', function () {
        var changedValue = '<div>bar</div>';
        scope.xhtml = changedValue;
        scope.saveAll();
        expect(getItemPassedToService().xhtml).toEqual(changedValue);
      });

    });
    it('on receiving saveAll message item should be saved via ItemService', function () {
      scope.saveAll();
      expect(ItemService.saveAll).toHaveBeenCalled();
    });
  });

  describe('onItemLoaded', function () {
    var components = [];
    var item = {
      components: components,
      xhtml: '<div>woo</div>'
    };

    beforeEach(function () {
      scope.onItemLoaded(item);
    });

    it('should set item', function () {
      expect(scope.item).toEqual(item);
    });

    it('should set xhtml to item.xhtml', function () {
      expect(scope.xhtml).toEqual(item.xhtml);
    });

    it('should set json to formatted item.components', function () {
      expect(scope.json).toEqual(JSON.stringify(item.components, undefined, 2));
    });

  });

  describe('dispatch itemChanged', function () {
    beforeEach(function () {
      var item = {
        components: {},
        customJs: '',
        xhtml: '<div>foo</div>'
      };
      scope.onItemLoaded(item);
      Msgr.send.calls.reset();
    });
    it('when components have been changed', function () {
      scope.components = { 1: 'component!' };
      scope.$digest();
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partsChanged: ['components'] });
    });
    it('when customScoring has been changed', function () {
      scope.customScoringJs = 'var s = "something";';
      scope.$digest();
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partsChanged: ['customScoring'] });
    });
    it('when xhtml has been changed', function () {
      scope.xhtml = '<div>bar</div>';
      scope.$digest();
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partsChanged: ['xhtml'] });
    });
  });

  describe('save', function () {


    describe('xhtml', function () {

      describe('xhtml has not changed', function () {
        var xhtml = '<div>unchanged!</div>';
        var item = {
          xhtml: xhtml
        };

        beforeEach(function () {
          scope.item = item;
          scope.xhtml = xhtml;
          scope.save();
        });

        it('should not save xhtml', function () {
          expect(ItemService.saveXhtml).not.toHaveBeenCalled();
        });
      });

      describe('xhtml has changed', function () {
        var xhtml = '<div>new</div>';
        var item = {
          xhtml: '<div>original</div>'
        };

        beforeEach(function () {
          scope.item = item;
          scope.xhtml = xhtml;
          scope.save();
        });

        it('should save xhtml and post message', function () {
          expect(ItemService.saveXhtml).toHaveBeenCalledWith(xhtml, jasmine.any(Function));
          expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partChanged: 'xhtml' });
        });

      });

      describe('customScoring has changed', function () {
        var newCustomScoring = 'new';
        var item = {
          customScoring: 'original'
        };

        beforeEach(function () {
          scope.item = item;
          scope.customScoringJs = newCustomScoring;
          scope.save();
        });

        it('should save custom scoring', function () {
          expect(ItemService.saveCustomScoring).toHaveBeenCalledWith(newCustomScoring, jasmine.any(Function));
          expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partChanged: 'customScoring' });
        });
      });
    });

    describe('components', function () {

      describe('components have not changed', function () {
        var components = {
          1: 'component!'
        };
        var item = {
          components: components
        };

        beforeEach(function () {
          scope.item = item;
          scope.components = components;
          scope.save();
        });

        it('should not save components', function () {
          expect(ItemService.saveComponents).not.toHaveBeenCalled();
        });
      });

      describe('components have changed', function () {
        var components = {
          1: 'new component!'
        };
        var item = {
          components: {
            1: 'old component!'
          }
        };

        beforeEach(function () {
          scope.item = item;
          scope.components = components;
          scope.save();
        });

        it('should save components and post message', function () {
          expect(ItemService.saveComponents).toHaveBeenCalledWith(components, jasmine.any(Function));
          expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partChanged: 'components' });
        });
      });

      describe('with id not in xhtml', function () {
        var components = { "1": {} };
        beforeEach(function () {
          scope.components = components;
          scope.xhtml = "<div></div>";
          scope.$digest();
        });

        it('should send an itemError event', function () {
          expect(Msgr.send).toHaveBeenCalledWith('itemError', jasmine.any(String));
        });

      });

      describe('with id in xhtml', function () {
        var components = { "1": {} };
        beforeEach(function () {
          scope.components = components;
          scope.xhtml = "<div id='1'></div>";
          scope.$digest();
        });

        it('should send an clearItemError event', function () {
          expect(Msgr.send).toHaveBeenCalledWith('clearItemError', jasmine.any(Object));
        });
      });

    });

  });

  describe('aceMarkupChanged', function () {
    beforeEach(function () {
      scope.$broadcast = jasmine.createSpy();
      scope.aceMarkupChanged();
    });

    it('calls register.flush', function () {
      expect(ComponentRegister.flush).toHaveBeenCalled();
    });

    it('broadcasts reset-player', function () {
      expect(scope.$broadcast).toHaveBeenCalledWith('client-side-preview.reset-player');
    });
  });

  describe('aceJsonChanged', function () {

    describe('valid json', function () {
      var json = '{"valid":"json"}';

      beforeEach(function () {
        scope.$broadcast = jasmine.createSpy();
        scope.json = json;
        scope.aceJsonChanged();
      });

      it('should set components to parsed json', function () {
        expect(scope.components).toEqual(JSON.parse(json));
      });

      it('broadcasts reset-player', function () {
        expect(scope.$broadcast).toHaveBeenCalledWith('client-side-preview.reset-player');
      });

    });

    describe('invalid json', function () {
      var json = 'this is not valid json';
      beforeEach(function () {
        scope.json = json;
        scope.aceJsonChanged();
      });

      it('should log an error', function () {
        expect($log.error).toHaveBeenCalled();
      });

    });

  });

  describe('onItemLoadError', function () {
    beforeEach(function () {
      spyOn(window, 'alert');
      scope.onItemLoadError();
    });

    it('should call window.alert with error message', function () {
      expect(window.alert).toHaveBeenCalledWith(jasmine.any(String));
    });
  });

  describe('assets', function () {
    var id = 1234;
    var componentBridge = { 'component': 'bridge' };

    beforeEach(function () {
      scope.$broadcast('registerComponent', id, componentBridge, {});
    });

    it('should reload the item after an asset has been uploaded', function () {
      scope.item = { files: [] };
      ItemService.load.and.callFake(function (loadCallback) {
        loadCallback({ files: ['f'] });
      });
      rootScope.$broadcast('assetUploadCompleted');
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partChanged: 'item' });
      expect(ItemService.load).toHaveBeenCalled();
      expect(scope.item.files).toEqual(['f']);
      ItemService.load.and.stub();
    });

    it('should notify of item changed after asset has been deleted', function () {
      rootScope.$broadcast('assetDeleteCompleted');
      expect(Msgr.send).toHaveBeenCalledWith('itemChanged', { partChanged: 'item' });
    });
  });

  describe('in iframe', function () {

    beforeEach(function () {
      iFrameService.isInIFrame.and.returnValue(true);
      iFrameService.bypassIframeLaunchMechanism.and.returnValue(false);
      controller('DevEditorRoot', { $scope: scope });
    });

    it('should call saveAll', function () {
      expect(Msgr.on).toHaveBeenCalledWith('saveAll', jasmine.any(Function));
    });

    it('should listen to initialise', function () {
      expect(Msgr.on).toHaveBeenCalledWith('initialise', jasmine.any(Function));
    });

    it('should send the ready message', function () {
      expect(Msgr.send).toHaveBeenCalledWith('ready');
    });

    describe('initialise message handler', function () {

      var onInitialise;

      function handleOnInitialize(data) {
        return function (key, handler) {
          if (key === 'initialise') {
            handler(data);
          }
        };
      }

      it('should set the initialData', function () {
        var initialData = { hideSaveButton: true };
        Msgr.on.and.callFake(handleOnInitialize(initialData));
        controller('DevEditorRoot', { $scope: scope });
        expect(scope.initialData).toEqual(initialData);
      });

      it('should call ItemService.load', function () {
        Msgr.on.and.callFake(handleOnInitialize({}));
        controller('DevEditorRoot', { $scope: scope });
        expect(ItemService.load).toHaveBeenCalled();
      });

      it('should send "rendered" message', function () {
        Msgr.on.and.callFake(handleOnInitialize({}));
        controller('DevEditorRoot', { $scope: scope });
        expect(Msgr.send).toHaveBeenCalledWith('rendered');
      });

    });

  });

  describe('getItemForScoring', function () {
    var scoringItem;
    beforeEach(function () {
      scope.item = {};
      scope.components = { 1: { label: 'hi' } };
      scope.customScoringJs = '//scoring';
      scope.xhtml = 'markup';
      scoringItem = scope.getItemForScoring();
    });

    it('returns the latest components', function () {
      expect(scoringItem.components).toEqual(scope.components);
    });

    it('returns the latest customScoring', function () {
      expect(scoringItem.customScoring).toEqual(scope.customScoringJs);
    });

    it('returns the latest markup', function () {
      expect(scoringItem.xhtml).toEqual(scope.xhtml);
    });
  });

  describe('questionForComponentId', function () {
    beforeEach(function () {
      scope.components = {
        '1': {
          label: 'hi'
        }
      }
    });

    it('returns the data from components', function () {
      expect(scope.questionForComponentId('1')).toEqual(scope.components['1'])
    });
  });
});