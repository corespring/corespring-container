angular.module('corespring-dev-editor.controllers')
  .controller('AssetsController', [
    '$log',
    '$scope',
    '$http',
    function($log, $scope, $http) {

      $scope.removeFile = function(file) {
        console.log(file);
        if (confirm('Are you sure you want to remove ' + file)) {
          $http.delete(file).then(function(res) {
            $scope.item.files = _.reject($scope.item.files, function(f) {
              return f.name === file;
            });
            $scope.$emit('assetDeleteCompleted');
          }, function() {
            alert('An error occured whilst deleting ' + file);
          });
        }
      };

      $scope.onFileUploadCompleted = function(file) {
        $scope.$emit('assetUploadCompleted');
      };

      $scope.calculateUrl = function(file) {
        return file.name;
      };

    }
  ]);