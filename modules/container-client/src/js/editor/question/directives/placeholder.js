/**
 * A placeholder that sits inside the editor and gives the user a preview
 * of the component.
 */
angular.module('corespring-editor.directives')
  .directive('placeholder', [
    '$compile',
    '$timeout',
    'LogFactory',
    'ComponentConfig',
    function(
      $compile,
      $timeout,
      LogFactory,
      ComponentConfig) {

      var logger = LogFactory.getLogger('placeholder');

      function link($scope, $element, $attrs) {

        function init(){
          logger.debug($scope.id, 'init...');
          $scope.config = ComponentConfig.get($scope.componentType);
          $scope.$emit('registerPlaceholder', $scope.id, $scope);
        }

        function renderPlayerComponent() {
          if (!$scope.id || !$scope.componentType) {
            return;
          }

          logger.debug('renderPlayerComponent: id:',
            $scope.id,
            'type:',
            $scope.componentType);

          var $holder = $element.find('.holder');

          if (!$holder || $holder.length === 0) {
            logger.warn('can\'t find holder');
            return;
          }

          $holder.html(
            ['<' + $scope.componentType + ' id="' , $scope.id , '">',
              '</', $scope.componentType, '>'].join(''));
          logger.debug('$compile component: ', $scope.id);
          $compile($holder)($scope.$new(true));
        }

        function setDataAndSession() {
          if (!$scope.componentBridge) {
            logger.warn($scope.id, 'bridge not ready!');
            return;
          }

          if (!$scope.componentModel) {
            logger.warn($scope.id, 'no component model not ready!');
            return;
          }

          /**
           * In the placeholder we don't care about the session.
           * So always pass in {}
           */
          $scope.componentBridge.setDataAndSession({
            data: $scope.componentModel,
            session: {}
          });
        }

        function markDirty() {
          if ($scope.componentModel) {
            delete $scope.componentModel.clean;
          }
        }

        function afterTooltipRemoved(callback) {
          return function($event) {
            $event.stopPropagation();
            $timeout(function () {
              //the angular-ui bootstrap tooltip has no api to close it
              //this requires to add an event to the triggers for tooltip, see layout.jade
              $element.find('[tooltip]').trigger('ng-ui-tooltip-close');
              $timeout(callback, 10);
            }, 10);
          };
        }

        $scope.deleteNode = afterTooltipRemoved(function() {
           $scope.$emit('wiggi-wiz.delete-node', $element);
        });

        $scope.editNode = afterTooltipRemoved(function() {
          markDirty();
          $scope.$emit( 'edit-node', $scope.id, $scope.componentModel, $scope.config);
        });

        /**
         * The placeholder intercepts the 'registerComponent' event from
         * the component and sets the data.
         */
        $scope.$on('registerComponent', function($event, id, bridge) {
          logger.debug('handler registerComponent', id);
          $event.stopPropagation();
          $event.preventDefault();
          $scope.componentBridge = bridge;
          setDataAndSession();
        });


        $scope.$watch('componentModel', function(newValue, oldValue) {
          if (_.isEqual(newValue, oldValue)) {
            logger.debug($scope.id, 'skip update - data is the same');
            return;
          }

          $scope.componentModel = newValue;
          setDataAndSession();
        }, true);

        $scope.$watch('componentModel.clean', function(clean) {
          $scope.showIcon = $scope.componentModel.isTool || ($scope.config && $scope.config.icon && clean);
        });

        /* expected by the handler for registerPlaceholder */
        $scope.setComponent = function(componentModel) {
          $scope.componentModel = componentModel;
          renderPlayerComponent();
        };


        init();
      }

      return {
        restrict: 'E',
        replace: false,
        link: link,
        scope: {
          label: '@',
          componentType: '@',
          id: '@',
          configurable: '@'
        },
        templateUrl: '/editor/question/directives/placeholder.html'
      };

    }
  ]);
