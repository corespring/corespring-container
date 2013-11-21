angular.module("simulator", []);


angular.module("simulator").controller('Root', ['$scope', '$log', function($scope, $log){

  $log.debug("Root controller");

  $scope.mode = "gather";

  $scope.idLabel = function(){
    return $scope.mode == "gather" ? "Item Id" : "Session Id";   
  };

}]);