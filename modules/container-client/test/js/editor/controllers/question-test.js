describe('QuestionController', function() {

  var scope, element, rootScope, compile, timeout;

  var ItemService = {
    load: jasmine.createSpy('load'),
    saveComponents: jasmine.createSpy('saveComponents')
  };
  var EditorConfig = {
    overrideFeatures: {'override' : 'features'},
    extraFeatures: {'extra' : 'features'}
  };
  var LogFactory = {
    getLogger: jasmine.createSpy('getLogger').and.returnValue({
      debug: function() {}
    })
  };
  var ComponentImageService = {};
  var ComponentData = {
    registerComponent: jasmine.createSpy('registerComponent'),
    registerPlaceholder: jasmine.createSpy('registerPlaceholder')
  };
  var ComponentPopups = {};
  var AppState = {
    question: {
      preview: undefined
    }
  };
  var ScoringHandler = {};
  var MathJaxService = {};

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('ItemService', ItemService);
    $provide.value('EditorConfig', EditorConfig);
    $provide.value('LogFactory', LogFactory);
    $provide.value('ComponentImageService', ComponentImageService);
    $provide.value('ComponentData', ComponentData);
    $provide.value('ComponentPopups', ComponentPopups);
    $provide.value('AppState', AppState);
    $provide.value('ScoringHandler', ScoringHandler);
    $provide.value('MathJaxService', MathJaxService);
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
    element = compile('<div ng-controller="QuestionController"></div>')(scope);
    scope = element.scope();
  }

  beforeEach(inject(function($rootScope, $compile, $timeout) {
    rootScope = $rootScope;
    compile = $compile;
    timeout = $timeout;
    render();
  }));

  describe('initialization', function() {

    beforeEach(function() {
      spyOn($.fn, 'dropdown');
      timeout.flush();
    });

    describe('previewOn', function() {

      it('should be true', function() {
        expect(scope.previewOn).toBe(true);
      });

      describe('AppState question preview is true', function() {
        beforeEach(function() {
          AppState.question.preview = true;
          render();
        });

        it('should be true', function() {
          expect(scope.previewOn).toBe(true);
        });

        afterEach(function() {
          AppState.question.preview = undefined;
        });
      });
    });

    describe('showSummaryFeedback', function() {
      it('should be set to true', function() {
        expect(scope.showSummaryFeedback).toBe(false);
      });
    });

    describe('imageService', function() {
      it('should be ComponentImageService', function() {
        expect(scope.imageService).toBe(ComponentImageService);
      });
    });

    describe('overrideFeatures', function() {
      it('should be EditorConfig.overrideFeatures', function() {
        expect(scope.overrideFeatures).toBe(EditorConfig.overrideFeatures);
      });
    });

    describe('extraFeatures', function() {
      it('should be EditorConfig.extraFeatures', function() {
        expect(scope.extraFeatures).toBe(EditorConfig.extraFeatures);
      });
    });

    it('should trigger $.dropdown on ".wiggi-wiz-toolbar button"', function() {
      expect($.fn.dropdown).toHaveBeenCalled(); //todo: figure out how to verify this is called on particular element
    });

    it('should call ItemService.load', function() {
      expect(ItemService.load).toHaveBeenCalled();
    });

  });

  describe('getUploadUrl', function() {
    it('should be deprecated', function() {
      expect(scope.getUploadUrl).toThrow(new Error('deprecated'));
    });
  });

  describe('selectFile', function() {
    it('should be deprecated', function() {
      expect(scope.selectFile).toThrow(new Error('deprecated'));
    });
  });

  describe('registerComponent event', function() {
    var id = 1;
    var componentBridge = {'component': 'bridge'};
    var componentElement = $('<div>element!</div>');

    beforeEach(function() {
      scope.$emit('registerComponent', id, componentBridge, componentElement);
    });

    it('should call ComponentData.registerComponent', function() {
      expect(ComponentData.registerComponent).toHaveBeenCalledWith(id, componentBridge, componentElement);
    });

  });

  describe('registerPlaceholder event', function() {
    var id = 1;
    var placeholder = $("<div>placeholder!</div>");

    beforeEach(function() {
      scope.$emit('registerPlaceholder', id, placeholder);
    });

    it('should call ComponentData.registerPlaceholder', function() {
      expect(ComponentData.registerPlaceholder).toHaveBeenCalledWith(id, placeholder);
    });

  });

  describe('registerConfigPanel event', function() {
    var id = 1;
    var model = {'a' : 'component'};
    var component = {
      setModel: jasmine.createSpy('setModel'),
      setProfile: jasmine.createSpy('setProfile')
    };
    var profile = {'a': 'profile'};
    var item = {
      components: (function() {
        var t = {};
        t[id] = model;
        return t;
      })(),
      profile: profile
    }

    beforeEach(function() {
      scope.item = item;
      scope.$emit('registerConfigPanel', id, component);
    });

    it('should set the model on the component', function() {
      expect(component.setModel).toHaveBeenCalledWith(model);
    });

    it('should set the profile on the component', function() {
      expect(component.setProfile).toHaveBeenCalledWith(profile);
    });

  });

  describe('itemAdded event', function() {
    var focusCaretAtEnd = jasmine.createSpy('focusCaretAtEnd');

    beforeEach(function() {
      spyOn(scope, 'getWiggiWizElement').and.returnValue({
        scope: function() {
          return {
            focusCaretAtEnd: focusCaretAtEnd
          }
        }
      });
      scope.$emit('itemAdded');
      timeout.flush();
    });

    it("should call focusCaretAtEnd on wiggi-wiz element's scope", function() {
      expect(focusCaretAtEnd).toHaveBeenCalled();
    });

  });



});