(function(){

  var config = [
/*
  '$routeProvider', 
  '$locationProvider',
  function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(false);
    $routeProvider.
      when('/profile', {
        //templateUrl: 'profile.html',
        controller: 'Profile'
      }).
      when('/designer', {
        //templateUrl: 'designer.html',
        controller: 'Designer'
      }).
      when('/supporting-materials', {
        //templateUrl: 'supporting-materials.html',
        controller: 'SupportingMaterials'
      }).
      otherwise({
        redirectTo: '/profile'
      });

  }
 */
];

corespring.module("corespring-editor-config", config);

})();
