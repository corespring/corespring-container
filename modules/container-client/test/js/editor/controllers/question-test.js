describe('QuestionController', function() {

  var scope, element, rootScope, compile, timeout;

  var ItemService = {
    load: jasmine.createSpy('load'),
    saveComponents: jasmine.createSpy('saveComponents'),
    saveConfigXhtmlAndComponents: jasmine.createSpy('saveConfigXhtmlAndComponents'),
    saveXhtml: jasmine.createSpy('saveXhtml'),
    saveSummaryFeedback: jasmine.createSpy('saveSummaryFeedback')
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
  
  var EditingImageService = {};
  
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

  var wiggiMathJaxFeatureDef = {};
  
  var wiggiLinkFeatureDef = {};

  var editorChangeWatcher = {
    debounce: jasmine.createSpy('debounce')
  };

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editing.controllers'));
  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('PlayerSkin', {});
    $provide.value('ItemService', ItemService);
    $provide.value('EditorConfig', EditorConfig);
    $provide.value('LogFactory', LogFactory);
    $provide.value('EditingImageService', EditingImageService);
    $provide.value('ComponentData', ComponentData);
    $provide.value('ComponentPopups', ComponentPopups);
    $provide.value('AppState', AppState);
    $provide.value('ScoringHandler', ScoringHandler);
    $provide.value('MathJaxService', MathJaxService);
    $provide.value('WiggiMathJaxFeatureDef', function(){
        return wiggiMathJaxFeatureDef;
    });
    $provide.value('WiggiLinkFeatureDef', function(){
        return wiggiLinkFeatureDef;
    });

    $provide.value('EditorChangeWatcher', new org.corespring.mocks.editor.EditorChangeWatcher());
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
      it('should be EditingImageService', function() {
        expect(scope.imageService).toBe(EditingImageService);
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

    describe('extraFeaturesForFeedback', function(){
      it('should be WiggiMathJaxFeatureDef and WiggiLinkFeatureDef', function(){
        expect(scope.extraFeaturesForFeedback).toEqual({
            definitions: [
                  wiggiMathJaxFeatureDef,
                  wiggiLinkFeatureDef
            ]
        });
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
    };

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

  describe('$watch item.xhtml', function(){
    beforeEach(function(){
      scope.item = {xhtml:"abc"};
      scope.$digest();
      ItemService.saveConfigXhtmlAndComponents.calls.reset();
    });
    it('should save a change to xhtml', function(){
      scope.item.xhtml = "def";
      scope.$digest();
      expect(ItemService.saveConfigXhtmlAndComponents).toHaveBeenCalled();
    });
    it('should not save when there was no change', function(){
      scope.item.xhtml = "abc";
      scope.$digest();
      expect(ItemService.saveConfigXhtmlAndComponents).not.toHaveBeenCalled();
    });
  });

  describe('$watch item.summaryFeedback', function(){
    beforeEach(function(){
      scope.item = {summaryFeedback:"abc"};
      scope.$digest();
      ItemService.saveSummaryFeedback.calls.reset();
    });
    it('should save a change to summaryFeedback', function(){
      scope.item.summaryFeedback = "def";
      scope.$digest();
      expect(ItemService.saveSummaryFeedback).toHaveBeenCalled();
    });

    it('should not save when there was no change', function(){
      scope.item.summaryFeedback = "abc";
      scope.$digest();
      expect(ItemService.saveSummaryFeedback).not.toHaveBeenCalled();
    });
  });

  describe('$watch item.components', function(){
    beforeEach(function(){
      scope.item = {components:[{'a' : 'component'}]};
      scope.$digest();
      ItemService.saveConfigXhtmlAndComponents.calls.reset();
    });
    it('should save a change to components', function(){
      scope.item.components = [{'b' : 'component'}];
      scope.$digest();
      expect(ItemService.saveConfigXhtmlAndComponents).toHaveBeenCalled();
    });
    it('should not save when there was no change ', function(){
      scope.item.components = [{'a' : 'component'}];
      scope.$digest();
      expect(ItemService.saveConfigXhtmlAndComponents).not.toHaveBeenCalled();
    });
  });

});
