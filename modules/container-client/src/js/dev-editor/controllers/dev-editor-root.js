angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$scope',
    'ItemService',
    'ComponentData',
    '$timeout',
    '$log',
    function($scope, ItemService, ComponentData, $timeout, $log) {

      $scope.onItemLoaded = function(item) {
        $scope.item = item;
        ComponentData.setModel(item.components);
        $scope.xhtml = item.xhtml;
        $scope.json = JSON.stringify(item.components, undefined, 2);
        $scope.customScoringJs = item.customScoring;
      };

      $scope.save = function() {
        if($scope.xhtml !== $scope.item.xhtml) {
          $scope.item.xhtml = $scope.xhtml;
          ItemService.saveXhtml($scope.item.xhtml, function(){
            $log.info('xhtml saved');
          });
        }

        if(!_.isEqual($scope.item.components, $scope.components)) {
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
    }
  ]
);
