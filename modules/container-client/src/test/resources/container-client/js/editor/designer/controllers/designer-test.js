describe('designer controller', function() {

  var rootScope, ctrl;

  function mockModal() {

  }

  function mockDesignerService() {

    var item = {};

    var availableComponents = [];

    this.loadItem = function(id, callback) {
      callback(item);
    };

    this.loadAvailableComponents = function(onSuccess, onError) {
      onSuccess(availableComponents);
    };
  }

  function mockPlayerService() {
    this.setQuestionLookup = function() {};
    this.setItemLookup = function() {};
  }

  function mockMathJaxService() {}

  function mockItemService() {}

  function mockFeatureAdapter() {}

  function mockComponentRegister() {}

  function mockStateParams() {
    this.section = '';
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
    });
  });

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    try {
      ctrl = $controller('Designer', {
        $scope: scope
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