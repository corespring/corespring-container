angular.module('corespring-editor.profile.directives')
  .directive('additionalCopyrightInformationForProfile', [
  'DataQueryService',
  function(DataQueryService) {
    return {
      restrict: 'AE',
      scope: {
        copyrights: '=',
        prompt: '@'
      },
      replace: true,
      templateUrl: "/editor/profile/directives/additional-copyright-information-for-profile.html",
      link: function($scope) {

        $scope.hasCopyrightItems = function() {
          return $scope.copyrights && $scope.copyrights.length > 0;
        };

        $scope.$watch('copyrights', function() {
          $scope.required = $scope.hasCopyrightItems() ? 'yes' : 'no';
        });

        $scope.addCopyrightItem = function() {
          $scope.copyrights.push({});
        };

        $scope.removeCopyrightItem = function(item) {
          $scope.copyrights = _.remove($scope.copyrights, item);
          if (0 === $scope.copyrights.length) {
            $scope.required = 'no';
          }
        };

        $scope.clearCopyrightItems = function() {
          $scope.copyrights.splice(0);
        };

        function years(fromYear, toYear){
          var direction = fromYear > toYear ? -1 : 1;
          return _.range( fromYear, toYear, direction).map(function(year){
            return year.toString();
          });
        }

        $scope.copyrightYearDataProvider = years(new Date().getFullYear(), 1939);

        DataQueryService.list("licenseTypes", function(result) {
          $scope.licenseTypeDataProvider = result;
        });

        DataQueryService.list("mediaType", function(result) {
          $scope.mediaTypeDataProvider = result;
        });

        $scope.getLicenseTypeUrl = function(licenseType) {
          return licenseType ? "/assets/images/licenseTypes/" + licenseType.replace(" ", "-") + ".png" : undefined;
        };

        $scope.$watch("required", function(newValue, oldValue) {
          if (newValue === oldValue) {
            return;
          }
          if ('yes' === newValue) {
            if (!$scope.hasCopyrightItems()) {
              $scope.addCopyrightItem();
            }
          } else {
            $scope.clearCopyrightItems();
          }
        });

      }
    };
  }
]);