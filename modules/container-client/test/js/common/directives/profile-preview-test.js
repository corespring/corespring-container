describe('profile-preview', function(){
  
  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-common.directives'));

  var scope = null, template = null;

  var directivePath = '/common/directives/profile-preview.html';
  
  beforeEach(angular.mock.module('corespring-templates'));

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('DataQueryService', {
        list: function(){}
      });
      $provide.value('ProfileFormatter', {});
      $provide.value('ComponentService', {
        loadAvailableComponents: function(){}
      });
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

  it('txt or n/a returns the correct value', function(){
    expect(scope.textOrNA(null)).toEqual('No information available');
  });

});