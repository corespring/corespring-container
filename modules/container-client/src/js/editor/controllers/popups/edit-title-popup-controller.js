angular.module('corespring-editor.controllers').controller('EditTitlePopupController', [
  '$scope',
  '$modalInstance',
  'title',
  '$timeout',
  function($scope, $modalInstance, title, $timeout){

    $scope.title = title;

    $scope.ok = function(){
      $modalInstance.close($scope.title);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss('cancel') ;
    };

    $scope.$on('edit-title-enter-key', function(){
      $scope.ok();
    });

    $modalInstance.opened.then(function(){
      $scope.ready = true;
    });

  }]);

angular.module('corespring-editor.controllers')
.directive('editTitleInput', ['$timeout', function($timeout){

    return {
      restrict: 'C',
      link: function($scope, $element){
        
        function onKeydown(e){
          $scope.$apply(function(){
            if(e.keyCode === 13){
              e.preventDefault();
              $scope.$emit('edit-title-enter-key');
            }
          });
        }

        $scope.selectTitle = function(){
          $timeout(function(){
            $element.select();
          });
        };

        $element
          .off('keydown')
          .on('keydown', onKeydown);

        $scope.$watch('ready', function(ready){
          if(ready){
            $scope.selectTitle();
          }
        });
      }
    };
  }]);
