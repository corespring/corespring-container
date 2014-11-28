/*#
 # A simple button bar
 # Eg: <tight-button-bar ng-model="selected" button-provider="buttons" key="label"/>
 #
 # @ngModel = the chosen items
 # @buttonProvider an array of choices
 # @key - the property of the buttonProvider objects to use for display, and to store in the ngModel
 #*/
angular.module('corespring-editor.directives')
  .directive('tightButtonBar', [
  '$log',
  function($log) {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      scope: {
        buttonProvider: '=',
        ngModel: '=',
        key: '@'
      },
      templateUrl: "/v2-editor/profile/directives/tight-button-bar.html",
      link: function ($scope) {

        $scope.getValue = function (b) {
          return $scope.key ? b[$scope.key] : b;
        };

        $scope.selected = function (b) {
          return _.contains($scope.ngModel, $scope.getValue(b));
        };

        $scope.toggle = function (b) {
          $scope.ngModel = $scope.ngModel || [];
          var dataValue = $scope.getValue(b);
          if (_.contains(dataValue)) {
            _.pull($scope.ngModel, dataValue);
          } else {
            $scope.ngModel.push(dataValue);
          }
        };
      }
    };
  }
]);
