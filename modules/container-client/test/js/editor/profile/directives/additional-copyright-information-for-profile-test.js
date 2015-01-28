describe('additionalCopyrightInformationForProfile', function() {

  var scope, element;

  var DataQueryService = {};

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editor.directives'));

  beforeEach(module(function($provide) {
    $provide.value('DataQueryService', DataQueryService);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = angular.element(
      '<div additional-copyright-information-for-profile=""></div>');
    $compile(element)(scope);
    scope = element.scope();
    scope.$apply();
  }));

  it('should not complain about rendering template', function() {
    expect(true).toBe(true);
  });

});