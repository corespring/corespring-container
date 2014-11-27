angular.module('corespring-editor.directives')
  .directive('placeholder', [
    '$rootScope',
    '$compile',
    'LogFactory',
    'ComponentRegister',
    'ComponentConfig',
    function(
      $rootScope,
      $compile,
      LogFactory,
      ComponentRegister,
      ComponentConfig) {

       var log = LogFactory.getLogger('placeholder');

      function link($scope, $element, $attrs) {

        function markDirty() {
          if ($scope.dataAndSession && $scope.dataAndSession.data) {
            delete $scope.dataAndSession.data.clean;
          }
        }

        function removeTooltip() {
          $scope.$broadcast('$destroy');
        }
        
        $scope.deleteNode = function($event) {
          $event.stopPropagation();
          removeTooltip();
          $scope.$emit('wiggi-wiz.delete-node', $element);
        };

        $scope.editNode = function($event) {
          markDirty();
          $event.stopPropagation();
          removeTooltip();
          $scope.$emit('wiggi-wiz.call-feature-method', 'editNode', $element);
        };

        $scope.setDataAndSession = function(dataAndSession){
          $scope.dataAndSession =  dataAndSession;
          log.debug('setDataAndSession - call renderPlayerComponent');
          renderPlayerComponent(dataAndSession);
        };

        /**
         * The placeholder intercepts the 'registerComponent' event from 
         * the component and sets the data.
         */
        $scope.$on('registerComponent', function(event, id, api ){
          $scope.componentBridge = api;
          $scope.componentBridge.setDataAndSession($scope.dataAndSession);
        });

        //1. register the placeholder for this id..
        ComponentRegister.registerComponent($scope.id, $scope);

        $scope.config = ComponentConfig.get($scope.componentType);

        $scope.loadedData = ComponentRegister.loadedData;

        $scope.$watch('dataAndSession.data.clean', function(clean){
          $scope.showIcon = $scope.config && $scope.config.icon && clean;
        }); 

        $scope.$watch('loadedData.' + $scope.id, function(newData, oldData) {
          log.debug( $scope.id + ' - data has changed!', newData);

          var isEqual = _.isEqual(newData, oldData);

          if(isEqual){
            log.debug( $scope.id + ' - data is the same - skip the update');
            return;
          }

          if($scope.componentBridge){
            $scope.componentBridge.setDataAndSession(newData);
          }
        }, true);

        function renderPlayerComponent(dataAndSession) {
          if (!$scope.id || !$scope.componentType) {
            return;
          }

          log.debug('renderPlayerComponent: id:', $scope.id, 'type:', $scope.componentType);

          var $holder = $element.find('.holder');

          if (!$holder || $holder.length === 0) {
            log.warn('can\'t find holder');
            return;
          }

          if (!dataAndSession) {
            log.warn('can\'t find component of type: ', $scope.componentType);
            return;
          }

          $holder.html('<' + $scope.componentType + ' id="' + $scope.id + '"></' + $scope.componentType + '>');
          $compile($holder)($scope.$new());
        }

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
        templateUrl: '/v2-editor/question/directives/placeholder.html'
      };

    }]);
