describe('ngBindHtmlUnsafe', function() {

  var scope, element;
  var html = "This is some <strong>unsafe</strong> html. Spooky.";
  var mathService = {parseDomForMath: function() {}};

  beforeEach(angular.mock.module('corespring-common.directives'));

  beforeEach(module(function($provide) {
    $provide.value('MathJaxService', mathService);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = angular.element('<div ng-bind-html-unsafe="html"></div>');
    $compile(element)(scope);
    scope.html = html;
    scope.$digest();
  }));

  it('should add html as child', function() {
    expect($('.ng-binding', element).html()).toEqual(html);
  });

  describe('value update', function() {
    var newHtml = "this is some <em>new</em> unsafe html!";

    it('should add new html as child', function() {
      scope.html = newHtml;
      scope.$apply();
      expect($('.ng-binding', element).html()).toEqual(newHtml);
    });

    it('should parse node for MathJax', function() {
      spyOn(mathService, 'parseDomForMath');
      scope.html = newHtml;
      scope.$apply();
      expect(mathService.parseDomForMath).toHaveBeenCalled();
    });

  });

});