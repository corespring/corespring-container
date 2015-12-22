describe('additionalCopyrightInformationForProfile', function() {

  var scope, element, render;
  var copyrights = [];

  var DataQueryService = {
    list: jasmine.createSpy('list')
  };

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editor.profile.directives'));

  beforeEach(module(function($provide) {
    $provide.value('DataQueryService', DataQueryService);
  }));


  afterEach(function() {
    DataQueryService.list.calls.reset();
  });

  beforeEach(inject(function($rootScope, $compile) {
    render = function() {
      scope = $rootScope.$new();
      scope.copyrights = copyrights;
      element = angular.element(
        '<div additional-copyright-information-for-profile="" prompt="whatever" copyrights="copyrights"></div>');
      $compile(element)(scope);
      element.scope().$apply();
      scope = element.isolateScope();
    };
    render();
  }));

  describe('initialization', function() {
    it("should call DataQueryService.list for 'licenseTypes'", function() {
      expect(DataQueryService.list).toHaveBeenCalledWith('licenseTypes', jasmine.any(Function));
    });

    it("should call DataQueryService.list for 'mediaType'", function() {
      expect(DataQueryService.list).toHaveBeenCalledWith('mediaType', jasmine.any(Function));
    });
  });

  describe('hasCopyrightItems', function() {

    describe('copyrights are empty', function() {
      it('should be false', function() {
        expect(scope.hasCopyrightItems()).toBe(false);
      });
    });

    describe('copyrights are nonempty', function() {
      beforeEach(function() {
        copyrights = ['these', 'are', 'copyrights'];
        render();
      });

      it('should be true', function() {
        expect(scope.hasCopyrightItems()).toBe(true);
      });
    });

  });

  describe('addCopyrightItem', function() {
    var before, after;

    beforeEach(function() {
      before = scope.copyrights.length;
      scope.addCopyrightItem();
      after = scope.copyrights.length;
    });

    it('should increase length of copyrights by one', function() {
      expect(after).toBe(before + 1);
    });

  });

  describe('removeCopyrightItem', function() {
    var toRemove = 'me';
    var newCopyrights = ['one', 'two', toRemove];
    var oldCopyrights;

    beforeEach(function() {
      oldCopyrights = copyrights;
      copyrights = newCopyrights;
      render();
      scope.removeCopyrightItem(toRemove);
    });

    it('should remove the specified item', function() {
      expect(scope.copyrights).toEqual(['one','two']);
    });

    describe('removes the final copyright', function() {
      beforeEach(function() {
        var newCopyrights = [toRemove];
        copyrights = newCopyrights;
        render();
        scope.removeCopyrightItem(toRemove);
      });

      it("should set required to 'no'", function() {
        expect(scope.required).toEqual('no');
      });

    });

    afterEach(function() {
      copyrights = oldCopyrights;
    });

  });

  describe('clearCopyrightItems', function() {
    var newCopyrights = ['one', 'two', 'three'];
    var oldCopyrights;

    beforeEach(function() {
      oldCopyrights = copyrights;
      copyrights = newCopyrights;
      render();
      scope.clearCopyrightItems();
    });

    it('should set copyrightItems to undefined', function() {
      expect(scope.copyrightItems).toBeUndefined();
    });

    afterEach(function() {
      copyrights = oldCopyrights;
    });
  });

  describe('getLicenseTypeUrl', function() {

    var licenseType = "creative commons";

    it('should return undefined with undefined', function() {
      expect(scope.getLicenseTypeUrl(undefined)).toBeUndefined();
    });

    it('should return url dashized and prefixed with asset path', function() {
      expect(scope.getLicenseTypeUrl(licenseType)).toBe('/assets/images/licenseTypes/creative-commons.png');
    });

  });

});
