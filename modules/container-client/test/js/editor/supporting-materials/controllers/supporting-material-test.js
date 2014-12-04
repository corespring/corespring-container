describe('supporting material controller', function() {

  var ctrl;
  var scope, stateParams, supportingMaterialsService;
  var contentType = "text/html";

  var itemMarkup = "<h1>Sample Rubric</h1><br/><p>This is a rubric for scoring this item.</p>";
  var item = {
    supportingMaterials: [{
      "name": "Custom Rubric",
      "materialType": "Rubric",
      "files": [{
        "_t": "org.corespring.platform.core.models.item.resource.VirtualFile",
        "name": "index.html",
        "contentType": contentType,
        "content": itemMarkup,
        "default": true
      }]
    }]
  };

  beforeEach(angular.mock.module('corespring-v1-editor.controllers'));
  beforeEach(angular.mock.module('corespring-common.supporting-materials'));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.data = {};
    stateParams = {
      index: 0
    };
    itemService = {};
    supportingMaterialsService = {
      getSupportingMaterial: function() {
        return item.supportingMaterials[0];
      },
      getContentType: function() {
        return contentType;
      },
      getKBFileSize: function(item, index, callback) {
        callback(100);
      }
    };

    try {
      ctrl = $controller('SupportingMaterial', {
        $scope: scope,
        $stateParams: stateParams,
        $state: {},
        $element: $('<div></div>'),
        WiggiWizHelper: {
          focusCaretAtEnd: function() {}
        },
        WiggiFootnotesFeatureDef: function() {},
        SupportingMaterialsService: supportingMaterialsService,
        ItemService: itemService
      });
    } catch (e) {
      throw ("Error with the controller: " + e);
    }
  }));

  it('should init', function() {
    expect(ctrl).toNotBe(undefined);
  });

  describe('formatKB', function() {
    it('should format kilobytes < 1024', function() {
      expect(scope.formatKB(100)).toEqual("100kb");
      expect(scope.formatKB(0)).toEqual("0kb");
    });
    it('should format kilobytes > 1024 as megabytes', function() {
      expect(scope.formatKB(1024)).toEqual("1mb");
      expect(scope.formatKB(2000)).toEqual("1.95mb");
    });
    it('should format undefined as double-dash', function() {
      expect(scope.formatKB(undefined)).toEqual("--");
    });
  });

  describe('hasDate', function() {
    it('should return true when supporting material has date', function() {
      expect(scope.hasDate({
        dateModified: {
          $date: new Date()
        }
      })).toBe(true);
    });
    it('should return false when supporting material does not have date', function() {
      expect(scope.hasDate({
        i: "don't",
        have: "a date"
      })).toBe(false);
    });
  });

  describe('getSupportingMaterialMarkup', function() {
    it('should return undefined when scope has no item', function() {
      scope.data.item = undefined;
      expect(scope.getSupportingMaterialMarkup()).toBe(undefined);
    });

    // TODO Figure out how to inject item into scope properly
    xit('should return content property when scope has item', function() {
      scope.data.item = item;
      expect(scope.getSupportingMaterialMarkup()).toEqual(itemMarkup);
    });
  });

  describe('isContentType', function() {
    // TODO Figure out how to inject item into scope properly
    xit('should return true for matching content type', function() {
      expect(scope.isContentType('text/html')).toBe(true);
    });
    it('should return false for non-matching content type', function() {
      expect(scope.isContentType('application/json')).toBe(false);
    });
  });

});
