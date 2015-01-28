describe('Root', function() {

  var scope, element;

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
  var Msgr = {
    on: jasmine.createSpy('on'),
    send: jasmine.createSpy('send')
  };

  beforeEach(module(function($provide) {
    $provide.value('$state', $state);
    $provide.value('ComponentRegister', ComponentRegister);
    $provide.value('ConfigurationService', ConfigurationService);
    $provide.value('ItemService', ItemService);
    $provide.value('LogFactory', LogFactory);
    $provide.value('Msgr', Msgr);
  }));

  afterEach(function() {
    _.each([ItemService, LogFactory], function(mock) {
      _.keys(mock, function(key) {
        if (_.isFunction(mock[key])) {
          mock[key].calls.reset();
        }
      });
    })
  });

  function render() {
    scope = rootScope.$new();
    element = compile('<div ng-controller="Root"></div>')(scope);
    scope = element.scope();
  }

  beforeEach(inject(function($rootScope, $compile) {
    rootScope = $rootScope;
    compile = $compile;
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
        top = {};
        render();
      }));

      it('should bind to Msgr initialise', function() {
        expect(Msgr.on).toHaveBeenCalledWith('initialise', jasmine.any(Function));
      });

      afterEach(function() {
        top = oldTop;
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
        spyOn(window, 'confirm').and.returnValue(false);
        scope.item = item;
        scope.$emit('deleteSupportingMaterial', data);
        item = {
          supportingMaterials: _.clone(supportingMaterials)
        };
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
        spyOn(window, 'confirm').and.returnValue(true);
        scope.item = item;
        scope.itemId = 123;
        scope.$emit('deleteSupportingMaterial', data);
        item = {
          supportingMaterials: _.clone(supportingMaterials)
        };
      });

      it('transitions to first supportingMaterial', function() {
        expect($state.transitionTo).toHaveBeenCalledWith('supporting-materials', {index: 0}, {reload: true});
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
          comps[index] = {'componentType': componentType}
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

  describe('onItemLoadError', function() {
    var message = "hey there was an error";

    beforeEach(function() {
      scope.onItemLoadError(message);
    });

    it('should log error with provided message', function() {
      expect(mockError).toHaveBeenCalledWith(jasmine.any(String), message);
    });
  });

});