(function(){
  function NavModelService ($location, $rootScope) {

    // TODO Remove when this https://github.com/angular-ui/ui-router/issues/202 is resolved.
    (function() {
      $rootScope.$on('$stateChangeStart', function() { this.locationSearch = $location.search(); });
      $rootScope.$on('$stateChangeSuccess', function() { $location.search(this.locationSearch); });
    })();

  }

  angular.module('corespring-editor.services')
    .service('NavModelService',
      [
      '$location',
      '$rootScope',
        NavModelService
      ]
    );

})();


