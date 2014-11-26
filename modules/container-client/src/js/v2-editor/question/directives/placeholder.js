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
          var component = ComponentRegister.loadedData[$scope.id];
          if (component && component.data && component.data.clean && $scope.componentPreview) {
            delete component.data.clean;
            log.debug('markDirty ', $scope.componentPreview);
            $scope.componentPreview.setDataAndSession(component);
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
         * The placeholder intercepts the 'registerComponent' event 
         * and sets the data
         */
        $scope.$on('registerComponent', function(event, id, api ){
          $scope.componentBridge = api;
          $scope.componentBridge.setDataAndSession($scope.dataAndSession);
        });

        //1. register the placeholder 
        ComponentRegister.registerComponent($scope.id, $scope);

        $scope.loadedData = ComponentRegister.loadedData;

        $scope.$watch('loadedData.' + $scope.id, function(newData, oldData) {
          log.debug('data has changed!', newData);

          var isEqual = _.isEqual(newData, oldData);

          if(isEqual){
            log.debug('data is the same - skip the update');
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
            log.warn('[placeholder] can\'t find component of type: ', $scope.componentType);
            return;
          }

          var config = ComponentConfig.get($scope.componentType);

          $scope.showIcon = (config.icon !== undefined) && (dataAndSession.data.clean === true);
          $scope.icon = config.icon;
          $scope.name = config.title;

          if ($scope.showIcon) {
            $holder.html('<span class="title">' + $scope.name + '</span>');
            $holder.css('background-image', 'url(' + $scope.icon + ')');
          } else {
            $holder.css('background-image', 'none');
            $holder.html('<' + $scope.componentType + ' id="' + $scope.id + '"></' + $scope.componentType + '>');
             
            $compile($holder)($scope.$new());
          }
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
        templateUrl: '/v2-editor/question/directives/placeholder.html',
      };

    }]);
