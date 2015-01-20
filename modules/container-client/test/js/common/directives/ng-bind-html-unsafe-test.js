describe('ngBindHtmlUnsafe', function() {

  var scope, element;
  var html = "This is some <strong>unsafe</strong> html. Spooky.";

  beforeEach(angular.mock.module('corespring-common.directives'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.html = html;
    element = angular.element('<div ng-bind-html-unsafe="html"></div>');
    $compile(element)(scope);
    scope = element.isolateScope();
    scope.$apply();
  }));

  it('should add html as child', function() {
    expect($('.ng-binding', element).html()).toEqual(html);
  });

  it('should update html on value update', function() {
    var newHtml = "this is some <em>new</em> unsafe html!";

    beforeEach(function() {
      scope.html = newHtml;
    });

    it('should add new html as child', function() {
      expect($('.ng-binding', element).html()).toEqual(newHtml);
    });

  });

});