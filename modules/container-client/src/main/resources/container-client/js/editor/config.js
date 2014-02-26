(function(){

var config = [
  '$routeProvider', 
  function($routeProvider){
    $routeProvider.
      when('/profile', {
        templateUrl: '../../partials/profile.html',
        controller: 'ProfileController'
      }).
      when('/designer', {
        templateUrl: '../../partials/designer.html',
        controller: 'DesignerController'
      }).
      otherwise({
        redirectTo: '/profile'
      });

  }
]; 

corespring.module("corespring-editor-config", config);

})();
