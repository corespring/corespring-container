angular.module('corespring-common.directives')
  .directive('questionInformation', [
    '$sce',
    '$log',
    'DataQueryService',
    'ProfileFormatter',
    'ComponentService',
    'SupportingMaterialsService',
    'MathJaxService',
    function($sce, $log, DataQueryService, ProfileFormatter, ComponentService, SupportingMaterialsService, MathJaxService) {
      return {
        restrict: 'EA',
        scope: {
          item: "=ngModel"
        },
        templateUrl: "/common/directives/question-information.html",
        link: function($scope, $element) {

          $scope.$watch('item', function(n) {
            if (n) {
              $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups($scope.item.supportingMaterials);
            }
          });

          $scope.activeTab = 'question';
          $scope.playerMode = "gather";

          $scope.selectTab = function(tab) {
            $scope.activeTab = tab;
            $scope.activeSmIndex = $scope.selectedSupportingMaterialUrl = $scope.selectedSupportingMaterialContent = undefined;
          };

          $scope.selectSupportingMaterial = function(smIndex) {
            $scope.activeTab = 'supportingMaterial';
            $scope.activeSmIndex = smIndex;

            $scope.selectedSupportingMaterialName = SupportingMaterialsService.getSupportingName($scope.item.supportingMaterials, smIndex);
            $scope.selectedSupportingMaterialUrl = SupportingMaterialsService.getSupportingUrl($scope.item.supportingMaterials, smIndex);
            $scope.selectedSupportingMaterialContent = SupportingMaterialsService.getContent($scope.item.supportingMaterials, smIndex);

            MathJaxService.parseDomForMath(100, $element[0]);
          };

          $scope.getContentType = function() {
            return SupportingMaterialsService.getContentType($scope.item.supportingMaterials, $scope.activeSmIndex);
          };


        }
      };
    }
  ]);