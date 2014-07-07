describe('designer controller', function() {

  var rootScope, ctrl;

  function mockModal() {

  }

  function mockDesignerService() {

    var item = {};

    var availableComponents = [];

    var availableWidgets = [];

    this.loadItem = function(id, callback) {
      callback(item);
    };

    this.loadAvailableComponents = function(onSuccess, onError) {
      onSuccess(availableComponents);
    };

    this.loadAvailableWidgets = function(onSuccess, onError) {
      onSuccess(availableWidgets);
    };
  }

  function mockPlayerService() {
    this.setQuestionLookup = function() {};
    this.setItemLookup = function() {};
  }

  function mockMathJaxService() {}

  function mockItemService() {}

  function mockFeatureAdapter() {
    return {
      componentToWiggiwizFeature: function() {
        return {};
      }
    };
  }

  function mockComponentRegister() {}

  function mockStateParams() {
    this.section = '';
  }

  function mockImageFeature() {

  }

  function mockLogFactory() {
    this.getLogger = function(id) {
      return {
        log: function() {},
        debug: function() {},
        warn: function() {},
        error: function() {},
        info: function() {}
      };
    };
  }

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('$modal', new mockModal());
      $provide.value('$stateParams', new mockStateParams());
      $provide.value('DesignerService', new mockDesignerService());
      $provide.value('ItemService', new mockItemService());
      $provide.value('PlayerService', new mockPlayerService());
      $provide.value('MathJaxService', new mockMathJaxService());
      $provide.value('ComponentToWiggiwizFeatureAdapter', new mockFeatureAdapter());
      $provide.value('ComponentRegister', new mockComponentRegister());
      $provide.value('ImageFeature', new mockImageFeature());
      $provide.value('LogFactory', new mockLogFactory());
    });
  });

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    try {
      ctrl = $controller('Designer', {
        $scope: scope,
        $element: $('<div></div>')
      });
    } catch (e) {
      throw ("Error with the controller: " + e);
    }
  }));

  it('should init', function() {
    expect(ctrl).toNotBe(null);
  });

  //Note: the controller will be changing soon, so tests are pending also.
  xit("pending tests", function() {

  });


});