describe('expander', function() {

  var render, scope, element;

  var DataQueryService = {};

  beforeEach(angular.mock.module('corespring-editor.profile.directives'));

  beforeEach(module(function($provide) {
    $provide.value('LogFactory', {
      getLogger: function() {}
    });
  }));

  beforeEach(inject(function($rootScope, $compile) {
    render = function(title) {
      scope = $rootScope.$new();
      element = angular.element('<expander title="' + title + '"></expander>');
      $compile(element)(scope);
      scope = element.scope();
      scope.$apply();
    };
  }));

  describe('template', function() {
    var title = "this is the title";
    beforeEach(function() {
      render(title);
    });

    it('should have class expander', function() {
      expect(element.hasClass('expander')).toBe(true);
    });

    it('should render title', function() {
      expect(element.html()).toBe(title);
    });
  });

});