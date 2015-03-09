describe('CatalogRoot', function() {

  var scope, element;

  beforeEach(angular.mock.module('corespring-catalog.controllers'));

  var mockSupportingMaterialsByGroups = {supporting: 'materials', by: 'groups'};

  var mockLoad = jasmine.createSpy('load');
  var mockGetSupportingMaterialsByGroups = jasmine.createSpy('getSupportingMaterialsByGroups')
    .and.returnValue(mockSupportingMaterialsByGroups);

  function MockLogFactory() {
    this.getLogger = function() {
      return {
        debug: function() {}
      };
    }
  }

  function MockItemService() {
    this.load = mockLoad;
  }

  function MockiFrameService() {
    this.isInIFrame = function() {
      return false;
    };
  }

  function MockSupportingMaterialsService() {
    this.getSupportingMaterialsByGroups = mockGetSupportingMaterialsByGroups;
  }

  function resetMocks() {
    mockLoad.calls.reset();
  }

  beforeEach(module(function($provide) {
    $provide.value('LogFactory', new MockLogFactory());
    $provide.value('SupportingMaterialsService', new MockSupportingMaterialsService());
    $provide.value('ItemService', new MockItemService());
    $provide.value('iFrameService', new MockiFrameService());
    $provide.value('Msgr', {});
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="CatalogRoot"></div>')(scope);
    scope = element.scope();
  }));

  afterEach(resetMocks);

  describe('initialization', function() {
    it('should call ItemService.load with onLoaded', function() {
      expect(mockLoad).toHaveBeenCalledWith(scope.onLoaded, scope.onUploadFailed);
    });
  });

  describe('itemLoaded event', function() {
    var item = {
      supportingMaterials: {these: 'are', supporting: 'materials'}
    };

    beforeEach(function() {
      scope.onLoaded(item);
    });

    it('should set supportingMaterials to result of getSupportingMaterialsByGroups', function() {
      expect(mockGetSupportingMaterialsByGroups).toHaveBeenCalledWith(item.supportingMaterials);
      expect(scope.supportingMaterials).toEqual(mockSupportingMaterialsByGroups);
    });
  });

  describe('onLoaded', function() {
    var item = {it: 'is', an: 'item'};
    beforeEach(function() {
      scope.onLoaded(item);
    });

    it('should set item on scope', function() {
      expect(scope.item).toEqual(item);
    });

  });

});