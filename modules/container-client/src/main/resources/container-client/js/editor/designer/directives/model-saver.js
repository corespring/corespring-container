/**
model-saver(ng-model="item", saving="saveInProgress", save-error="saveError")
  #saved
    | All changes saved
  #save-in-progress
    | Saving...
  #save-error
    | There was an error saving your content
*/

angular.module('corespring-editor.directives').directive('modelSaver', [
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

      var promises = [];

      log('link');

      $scope.triggerSave = function() {
        log('triggering save');
        $scope.saveTrigger();
      };

      var throttled = _.throttle($scope.triggerSave, 500, {
        trailing: true,
        leading: false
      });

      var lastChange;

      $scope.$watch('ngModel', function(newValue, oldValue) {

        /**
         * Returns component ids which have been changed (but not newly added) in the model.
         */
        function dirtyComponentIds(newValue, oldValue) {
          return _.isEmpty(oldValue) ? [] : _.filter(_.keys(newValue.components), function(key) {
            var component = newValue.components[key];
            return _.contains(_.keys(oldValue.components), key) &&
              !(_.isEqual(component, oldValue.components[key]));
          });
        }

        log('ngModel changed');

        _.forEach(dirtyComponentIds(newValue, oldValue), function(id) {
          delete newValue.components[id].clean;
        });

        var now = new Date().getTime();

        if (newValue && oldValue && !_.isEmpty(oldValue)) {
          var diff = now - lastChange;

          log('diff', diff);
          if (diff < 1000) {
            _.forEach(promises, function(p) {
              $timeout.cancel(p);
            });
            promises = [];
          }

          promises.push($timeout(function() {
            log('-------------> deferred save...');
            $scope.triggerSave();

          }, 500));

          lastChange = now;
        }
      }, true);

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

    function compile($element, $attrs) {
      return link;
    }

    return {
      restrict: 'E',
      compile: compile,
      scope: {
        saving: '=',
        saveError: '=',
        ngModel: '=',
        saveTrigger: '&'
      }
    };
  }
]);