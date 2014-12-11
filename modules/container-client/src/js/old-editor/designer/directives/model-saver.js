/**
model-saver(ng-model="item", saving="saveInProgress", save-error="saveError")
  #saved
    | All changes saved
  #save-in-progress
    | Saving...
  #save-error
    | There was an error saving your content
*/

angular.module('corespring-v1-editor.directives').directive('modelSaver', [
  '$log',
  '$timeout',
  '$compile',
  function($log, $timeout, $compile) {

    function link($scope, $element) {

      var log = $log.debug.bind($log, '[model-saver] -');

      $scope.innerSaveInProgress = true;

      var html = $element.html();
      var $node = $('<div style="visibility: hidden">').append(html);
      $node.find('#saved').attr('ng-show', '!innerSaveInProgress && !saveError');
      $node.find('#save-in-progress').attr('ng-show', 'innerSaveInProgress');
      $node.find('#save-error').attr('ng-show', 'saveError && !innerSaveInProgress');
      $element.replaceWith($node);
      $element = $node;
      $compile($node)($scope);

      $scope.triggerSave = function() {
        log('triggering save');
        $scope.saveTrigger();
      };

      $scope.$watch('ngModel', _.throttle($scope.triggerSave, 500, {
        trailing: true,
        leading: false
      }), true);

      $scope.$watch('saving', function(n, o) {
        if (n) {
          $scope.innerSaveInProgress = true;
        } else {
          $timeout(function() {
            $scope.innerSaveInProgress = false;
          }, 200);
        }

        log('saving: ', n);
      });

      $scope.$watch('saveError', function(n, o) {
        log('saveError: ', n);
      });

      $timeout(function() {
        $element.css('visibility', 'visible');
      }, 400);
    }

    return {
      restrict: 'E',
      link: link,
      scope: {
        saving: '=',
        saveError: '=',
        ngModel: '=',
        saveTrigger: '&'
      }
    };
  }
]);