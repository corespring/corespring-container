describe('ArchivePopupController', function() {

  var scope, element;

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('LogFactory', function() {});
    $provide.value('$modal', function() {});
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="ArchivePopupController"></div>')(scope);
    scope = element.scope();
  }));

  it('is unimplemented', function() {
    expect(scope.unimplemented).toBe("remove me when implemented!");
  });

});