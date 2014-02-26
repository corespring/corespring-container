(function(){

var config = [
  '$routeProvider', 
  '$locationProvider',
  function($routeProvider, $locationProvider){
    $locationProvider.html5Mode(false);
    $routeProvider.
      when('/profile', {
        templateUrl: '../../partials/profile.html',
        controller: 'Profile'
      }).
      when('/designer', {
        templateUrl: '../../partials/designer.html',
        controller: 'Designer'
      }).
      otherwise({
        redirectTo: '/profile'
      });

  }
]; 

corespring.module("corespring-editor-config", config);

})();
