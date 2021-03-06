describe('ComponentPopups', function() {

  var componentPopups;

  var $modal = {
    open: function() {}
  };
  var LogFactory = {
    getLogger: function() {
      return {
        debug: function() {}
      };
    }
  };
  var DesignerService = {
    loadAvailableUiComponents: function() {}
  };

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(module(function($provide) {
    $provide.value('$modal', $modal);
    $provide.value('LogFactory', LogFactory);
    $provide.value('DesignerService', DesignerService);
  }));

  beforeEach(inject(function(ComponentPopups) {
    componentPopups = ComponentPopups;
  }));

  describe('launch', function() {

    var $scope, id, model, config;
    var componentType = 'corespring-mock-component';
    var modelTitle = 'CoreSpring Mock Model Title';
    var defaultTitle = 'no title provided';
    var success, failure;

    beforeEach(function() {
      $scope = {};
      model = {
        componentType: componentType,
        title: modelTitle
      };
      config = {};
      var spy = spyOn(DesignerService, 'loadAvailableUiComponents');
      componentPopups.launch($scope, id, model, config);
      success = spy.calls.mostRecent().args[0];
      failure = spy.calls.mostRecent().args[1];
    });

    describe('DesignerService.loadAvailableUiComponents succeeds', function() {

      describe('components contains model.componentType', function() {
        var title = "CoreSpring Mock Component";
        var components = {
          interactions: [
            {
              componentType: componentType,
              title: title
            }
          ],
          widgets: []
        };
        var $template;

        beforeEach(function() {
          spyOn($modal, 'open');
          success(components);
          $template = $($modal.open.calls.mostRecent().args[0].template);
        });

        it('should launch dialog with title from component', function() {
          expect($template.find('.modal-title').text()).toEqual(title);
        });
      });

      describe('components does not contain model.componentType', function() {
        var components = {
          interactions: [], widgets: []
        };
        var $template;

        beforeEach(function() {
          spyOn($modal, 'open');
          success(components);
          $template = $($modal.open.calls.mostRecent().args[0].template);
        });

        it('should launch dialog with title from model', function() {
          expect($template.find('.modal-title').text()).toEqual(modelTitle);
        });
      });
    });

    describe('DesignerService.loadAvailableUiComponents fails', function() {
      var $template;

      beforeEach(function() {
        spyOn($modal, 'open');
        failure();
        $template = $($modal.open.calls.mostRecent().args[0].template);
      });

      it('should launch dialog with title from model', function() {
        expect($template.find('.modal-title').text()).toEqual(modelTitle);
      });

    });

    describe('returns default title if component and model do not have title', function() {
      var $template;
      var components = {
        interactions: [
          {
            componentType: componentType,
            title: modelTitle
          }
        ],
        widgets: []
      };

      beforeEach(function() {
        spyOn($modal, 'open');
        delete model.title;
        delete components.interactions[0].title;
      });

      describe('and model.name is undefined', function(){
        it('and loadAvailableUiComponents fails', function() {
          failure();
          $template = $($modal.open.calls.mostRecent().args[0].template);
          expect($template.find('.modal-title').text()).toEqual(defaultTitle);
        });
        it('and loadAvailableUiComponents succeeds', function() {
          success(components);
          $template = $($modal.open.calls.mostRecent().args[0].template);
          expect($template.find('.modal-title').text()).toEqual(defaultTitle);
        });
      });

      describe('and model.name is defined', function(){
        var mockModelName = 'corespring mock model name';
        beforeEach(function(){
          model.name = mockModelName;
        });
        it('and loadAvailableUiComponents fails', function() {
          failure();
          $template = $($modal.open.calls.mostRecent().args[0].template);
          expect($template.find('.modal-title').text()).toEqual(mockModelName);
        });
        it('and loadAvailableUiComponents succeeds', function() {
          success(components);
          $template = $($modal.open.calls.mostRecent().args[0].template);
          expect($template.find('.modal-title').text()).toEqual(mockModelName);
        });
      });


    });


  });

});
