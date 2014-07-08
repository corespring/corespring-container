describe('catalog root controller', function() {

  var rootScope, ctrl, mockItem, mockDepthOfKnowldge, mockReviewsPassed, formatter;

  function mockDesignerService() {

    var availableComponents = [];

    this.loadItem = function(id, callback) {
      callback(mockItem);
    };

    this.loadAvailableUiComponents = function(onSuccess, onError) {
      onSuccess(availableComponents);
    };
  }

  function mockPlayerService() {
    this.setQuestionLookup = function() {};
    this.setItemLookup = function() {};
  }

  function mockMathJaxService() {}

  function mockItemService() {

    this.load = function(loaded, error) {
      loaded(mockItem);
    };
  }

  function mockFeatureAdapter() {}

  function mockComponentRegister() {}

  function mockStateParams() {
    this.section = '';
  }

  function mockImageFeature() {}

  function mockItemIdService() {
    this.itemId = function() {
      return '1';
    };
  }

  function mockComponentService() {
    this.loadAvailableComponents = function() {

    };
  }

  function mockDataQueryService() {

    this.list = function(name, loaded) {

      switch (name) {
        case 'depthOfKnowledge':
          loaded(mockDepthOfKnowldge);
          break;
        case 'reviewsPassed':
          loaded(mockReviewsPassed);
          break;
        default:
          loaded({});
          break;
      }

    };
  }

  beforeEach(angular.mock.module('corespring-catalog.controllers'));
  beforeEach(angular.mock.module('corespring-common.services'));


  beforeEach(function() {
    module(function($provide) {
      $provide.value('DesignerService', new mockDesignerService());
      $provide.value('DataQueryService', new mockDataQueryService());
      $provide.value('ItemService', new mockItemService());
      $provide.value('ItemIdService', new mockItemIdService());
      $provide.value('ComponentService', new mockComponentService());
      $provide.value('PlayerService', mockPlayerService);
    });
  });

  beforeEach(inject(function($rootScope, $controller, ProfileFormatter) {
    scope = $rootScope.$new();

    mockItem = {
      profile: {
        otherAlignments: {
          depthOfKnowledge: 'depth-1'
        },
        taskInfo: {
          reviewsPassed: ['A']
        }
      }
    };

    mockDepthOfKnowldge = [{
      key: 'depth-1',
      value: 'depth-1'
    }];

    mockReviewsPassed = [{
      key: 'A',
      value: 'A'
    }, {
      key: 'B',
      value: 'B'
    }, {
      key: 'All',
      value: 'All'
    }, {
      key: 'None',
      value: 'None'
    }, {
      key: 'Other',
      value: 'Other'
    }];

    ctrl = $controller('CatalogRoot', {
      $scope: scope,
      $element: $('<div></div>')
    });
  }));

  it('should init', function() {
    expect(ctrl).toNotBe(null);
  });

  it('should set the depth of knowledge', function() {
    expect(scope.depthOfKnowledgeLabel).toEqual('depth-1');
  });

  it('should set reviews passed', function() {
    expect(scope.allReviewsPassed).toEqual([{
      name: 'A',
      passed: true
    }, {
      name: 'B',
      passed: false
    }]);

  });


});