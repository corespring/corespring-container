describe('ScoringPopupController', function() {

  var scope, element;

  var $modalInstance = {
    close: jasmine.createSpy('close')
  };
  var LogFactory = {
    getLogger: function() {}
  };
  var DesignerService = {
    loadAvailableUiComponents: jasmine.createSpy('loadAvailableUiComponents')
  };
  var components = {
    'these': 'are',
    'some': 'components'
  };
  var itemConfig = {
    scoringType: 'allOrNothing'
  };
  var xhtml = "<div>this is some <strong>markup!</strong></div>";


  afterEach(function() {
    $modalInstance.close.calls.reset();
    DesignerService.loadAvailableUiComponents.calls.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$modalInstance', $modalInstance);
    $provide.value('LogFactory', LogFactory);
    $provide.value('DesignerService', DesignerService);
    $provide.value('itemConfig', itemConfig);
    $provide.value('components', components);
    $provide.value('xhtml', xhtml);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="ScoringPopupController"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {
    it('should set components', function() {
      expect(scope.components).toEqual(components);
    });

    it('should set componentSize to number of components', function() {
      expect(scope.componentSize).toEqual(scope.sizeToString(_.keys(components).length));
    });

    it('should set xhtml', function() {
      expect(scope.xhtml).toEqual(xhtml);
    });

    it('should call DesignerService.loadAvailableUiComponents', function() {
      expect(DesignerService.loadAvailableUiComponents)
        .toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Function));
    });
  });

  describe('sizeToString', function() {
    it("should return 'many' for size > 1", function() {
      expect(scope.sizeToString(2)).toEqual('many');
    });

    it("should return 'one' for size = 1", function() {
      expect(scope.sizeToString(1)).toEqual('one');
    });

    it("should return 'none' for size = 0", function() {
      expect(scope.sizeToString(0)).toEqual('none');
    });

    it("should return 'none' for size = NaN", function() {
      expect(scope.sizeToString(NaN)).toEqual('none');
    });

    it("should return 'none' for size = -1", function() {
      expect(scope.sizeToString(-1)).toEqual('none');
    });
  });

  describe('onComponentsLoadError', function() {
    it('should throw error', function() {
      expect(scope.onComponentsLoadError).toThrow(new Error("Error loading components"));
    });
  });

  describe('onComponentsLoaded', function() {
    var uiComponents = {
      interactions: {
        'these': 'are',
        'some': 'interactions'
      },
      widgets: {
        'and': 'these',
        'are': 'widgets'
      }
    };

    beforeEach(function() {
      scope.onComponentsLoaded(uiComponents);
    });

    it('should set interactions', function() {
      expect(scope.interactions).toBe(uiComponents.interactions);
    });

    it('should set widgets', function() {
      expect(scope.widgets).toBe(uiComponents.widgets);
    });
  });

  describe('close', function() {
    beforeEach(function() {
      scope.close();
    });
    it('should call $modalInstance.close', function() {
      expect($modalInstance.close).toHaveBeenCalled();
    });
  });

});