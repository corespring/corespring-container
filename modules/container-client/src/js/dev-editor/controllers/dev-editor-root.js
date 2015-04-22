angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$scope',
    '$window',
    'ItemService',
    'ComponentData',
    '$timeout',
    '$log',
    'iFrameService',
    'Msgr',
    function(
      $scope,
      $window,
      ItemService,
      ComponentData,
      $timeout,
      $log,
      iFrameService,
      Msgr) {

      $scope.onItemLoaded = function(item) {
        $scope.item = item;
        ComponentData.setModel(item.components);
        $scope.xhtml = item.xhtml;
        $scope.json = JSON.stringify(item.components, undefined, 2);
        $scope.customScoringJs = item.customScoring;
        $scope.components = _.cloneDeep(item.components);
      };

      $scope.save = function() {
        if($scope.xhtml !== $scope.item.xhtml) {
          $scope.item.xhtml = $scope.xhtml;
          ItemService.saveXhtml($scope.item.xhtml, function(){
            $log.info('xhtml saved');
          });
        }

        if(!_.isUndefined($scope.components) && !_.isEqual($scope.item.components, $scope.components)) {
          $scope.item.components  = $scope.components;
          ItemService.saveComponents($scope.item.components, function() {
            $log.info('components saved');
          });
        }

        if($scope.item.customScoring !== $scope.customScoringJs) {
          $scope.item.customScoring = $scope.customScoringJs;
          ItemService.saveCustomScoring($scope.item.customScoring, function() {
            $log.info('custom scoring saved');
          });
        }
      };

      $scope.aceJsonChanged = function() {
        try {
          var update = JSON.parse($scope.json);
          $scope.components = update;
          $timeout(function() {
            $scope.$digest();
          });
        } catch(e) {
          $log.error('There was a problem parsing $scope.json', e);
        }
      };

      $scope.onItemLoadError = function(err) {
        window.alert("There was an error. Please try later. Thanks!");
      };

      $scope.$on('registerComponent', function(event, id, componentBridge) {
        ComponentData.registerComponent(id, componentBridge);
      });

      ItemService.load($scope.onItemLoaded, $scope.onItemLoadError);

      function byPassIframeLaunchMechanism(){
        var bypass = $window.location.search.indexOf('bypass-iframe-launch-mechanism') !== -1;
        return bypass;
      }

      if (iFrameService.isInIFrame() && !byPassIframeLaunchMechanism()) {
        Msgr.on('initialise', function(data) {
          $log.log('on initialise', data);
          Msgr.send('rendered');
        });

        //send msg "ready" to instance
        //this will result in msg "initialise" being sent back to us
        $log.log('sending ready');
        Msgr.send('ready');
      }
    }
  ]
);
