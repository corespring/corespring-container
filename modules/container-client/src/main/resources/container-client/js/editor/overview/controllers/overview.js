var controller = function ($scope, DataQueryService) {

  $scope.unassigned = "Not Assigned";

  function priorUse(profile) {
    var str = "";
    if (profile) {
      if (profile.priorUse) {
        str += profile.priorUse;
      }
      if (profile.priorGradeLevel) {
        str += ", ";
        if (profile.priorGradeLevel.length > 1) {
          str += "Grades " + profile.priorGradeLevel.join(", ").replace('KG', 'K');
        } else {
          str += "Grade " + profile.priorGradeLevel[0];
        }
      }
      return str;
    } else {
      return undefined;
    }
  }

  $scope.$on('itemLoaded', function() {
    $scope.init();
  });

  $scope.init = function() {
    if ($scope.data.item) {
      $scope.profile = $scope.data.item.profile;
      $scope.taskInfo = $scope.profile ? $scope.profile.taskInfo : {};
      $scope.otherAlignments = $scope.profile ? $scope.profile.otherAlignments : {};
      $scope.contributorDetails = $scope.profile ? $scope.profile.contributorDetails : {};
      if ($scope.otherAlignments && $scope.otherAlignments.depthOfKnowledge) {
        DataQueryService.list("depthOfKnowledge", function(result) {
          $scope.depthOfKnowledge = _(result).find(function(e) {
            return e.key === $scope.otherAlignments.depthOfKnowledge;
          }).value;
        });
      } else {
        $scope.depthOfKnowledge = $scope.unassigned;
      }
      $scope.licenseTypeUrl = $scope.contributorDetails && $scope.contributorDetails.licenseType ?
        "/assets/images/licenseTypes/" + $scope.contributorDetails.licenseType.replace(" ", "-") + ".png" : undefined;
      $scope.priorUse = priorUse($scope.profile);
    }
  };

  $scope.init();

};

angular.module('corespring-editor.controllers')
  .controller('Overview',
    ['$scope',
     'DataQueryService',
      controller]);
