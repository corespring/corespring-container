describe('profile-preview', function() {

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-common.directives'));

  var scope = null,
    template = null;

  beforeEach(angular.mock.module('corespring-templates'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('ComponentService', {
        loadAvailableComponents: function() {}
      });
      $provide.value('DataQueryService', {
        list: function() {}
      });
      $provide.value('ProfileFormatter', {});
      $provide.value('STATIC_PATHS', {});
    });
  });

  beforeEach(inject(function($rootScope, $compile) {
    $rootScope.mockItem = {
      profile: {
        contributorDetails: {}
      }
    };
    element = angular.element('<div profile-preview="" ng-model="mockItem"></div>');
    $compile(element)($rootScope.$new());
    element.scope().$apply();
    scope = element.scope().$$childHead;
  }));

  describe('textOrNA', function() {

    it("returns 'No information available' for null", function() {
      expect(scope.textOrNA(null)).toEqual('No information available');
    });

  });

  describe('getUrl', function() {
    var url = "www.google.com";

    it('adds http:// prefix when missing', function() {
      expect(scope.getUrl(url)).toEqual('http://' + url);
    });

    it('does not add http:// prefix when not missing', function() {
      expect(scope.getUrl('http://' + url)).toEqual('http://' + url);
    });

  });

  describe('getDisplayUrl', function() {
    var url = "www.google.com";

    it('removes http:// prefix', function() {
      expect(scope.getDisplayUrl("http://" + url)).toEqual(url);
    });

    it('removes https:// prefix', function() {
      expect(scope.getDisplayUrl("https://" + url)).toEqual(url);
    });

  });


});