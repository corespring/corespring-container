angular.module('corespring-editor.directives')
  .directive('supportingmetadata', [
    '$timeout', 
    'SupportingMaterialsService',
    'LogFactory',
    function($timeout, SupportingMaterialsService, LogFactory) {

      var logger = LogFactory.getLogger('supportingmetadata');

      function link($scope, $element, $attr, ngModel) {

        $scope.sourceIsEditable = $attr.sourceIsEditable !== 'false';

        var other = $scope.other = 'Other';
        var none = 'none selected';
        $scope.metadataForm.name.$error = null;

        function nameIsTaken() {
          return _.contains($scope.existingNames, $scope.name);
        }

        $scope.checkNameIsAvailable = function() {
          if (nameIsTaken()) {
            $scope.metadataForm.name.$valid = false;
            $scope.metadataForm.name.$error = 'That name already exists';
          } else {
            $scope.metadataForm.name.$valid = true;
            $scope.metadataForm.name.$error = null;
          }
        };

        var defaultTypes = [
          'Rubric',
          'Scoring Guide',
          'Student Materials',
          'Student Work Examples'];

        $scope.materialTypes = _.union([none], defaultTypes, [other]);

        ngModel.$render = function(){
          var data = ngModel.$viewValue || {};

          if(!data.materialType){
            $scope.materialType = none;
          } else {
            $scope.materialType = _.contains(defaultTypes, data.materialType) ? data.materialType : other;
          }

          if($scope.materialType === other){
            $scope.otherMaterialType = data.materialType;
          }
        };

        function isFormValid() {

          if (_.isEmpty($scope.name)) {
            return false;
          }

          if (nameIsTaken()) {
            return false;
          }

          if (_.isEmpty($scope.materialType)) {
            return false;
          }

          if ($scope.materialType === none) {
            return false;
          }

          if ($scope.materialType === other && _.isEmpty($scope.otherMaterialType)) {
            return false;
          }

          if(!$scope.sourceIsEditable){
            return true;
          }

          if (!$scope.source) {
            return false;
          }

          if ($scope.source === 'binary' && !$scope.fileToUpload) {
            return false;
          }

          return true;
        }

        function getMaterialType(){
          return $scope.materialType === other ? $scope.otherMaterialType : $scope.materialType;
        }

        function updateModel() {
          $scope.isValid = isFormValid();

          logger.debug('isFormValid? ', $scope.isValid);

          if($scope.isValid){
            var out = {
              name: $scope.name,
              materialType: getMaterialType(),
              source: $scope.source
            };
            
            if($scope.source === 'binary' && $scope.sourceIsEditable){
              out.file = $scope.fileToUpload;
            }

            ngModel.$setViewValue(out);
          }
        }

        $scope.$watch('name', function() {
          updateModel();
        });

        $scope.$watch('materialType', function() {
          updateModel();
        });

        $scope.$watch('otherMaterialType', function() {
          updateModel();
        });

        $scope.$watch('source', function(src) {
          if (src === 'html') {
            $scope.fileToUpload = null;
            $scope.$broadcast('clearFile');
          }
          updateModel();
        });

        $scope.$on('fileChange', function(ev, file) {
          $scope.fileToUpload = file;
          updateModel();
        });

      }

      return {
        restrict: 'A',
        require: '^ngModel',
        link: link,
        scope: {
          ngModel: '=',
          focusTitle: '=',
          existingNames: '=',
          isValid: '=?'
        },

        templateUrl: "/editor/supporting-materials/directives/supporting-metadata.html"
      };
    }
  ])
  .directive('filechange', function() {
    return {
      restrict: 'A',
      link: function($scope, element) {

        $scope.$on('clearFile', function() {
          element.val(null);
        });

        element.bind('change', function() {
          $scope.$emit('fileChange', $(element)[0].files[0]);
          $scope.$apply();
        });
      }
    };
  });