angular.module('corespring-dev-editor.controllers')
  .controller('AssetsController', [
    '$log',
    '$scope',
    '$http',
    '$window',
    function($log, $scope, $http, $window) {

      $scope.removeFile = function(file) {
        if ($window.confirm('Are you sure you want to remove ' + file)) {
          $http.delete(file).then(function(res) {
            $scope.item.files = _.reject($scope.item.files, function(f) {
              return f.name === file;
            });
            if ($scope.selected === file) {
              $scope.selected = undefined;
            }
            $scope.$emit('assetDeleteCompleted');
          }, function() {
            alert('An error occured whilst deleting ' + file);
          });
        }
      };

      $scope.onFileUploadCompleted = function() {
        $scope.$emit('assetUploadCompleted');
      };

      $scope.calculateUrl = function(file) {
        return file.name;
      };

    }
  ]);