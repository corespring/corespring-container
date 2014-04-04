(function(){
  function NavModelService ($location, $rootScope) {

    this.navEntries = [
      {
        title: "Design",
        path: "design"
      },
      {
        title: "View Player",
        path: "view-player"
      },
      {
        title: "Item Profile",
        path: "item-profile"
      },
      {
        title: "Supporting Materials",
        path: "supporting-materials"
      },
      {
        title: "Overview",
        path: "overview"
      }
    ];


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


