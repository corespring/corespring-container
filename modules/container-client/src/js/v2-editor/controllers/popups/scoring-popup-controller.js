angular.module('corespring-editor.controllers').controller('ScoringPopupController', [
  '$scope',
  '$modal',
  'LogFactory',
  'ItemService',
  'DesignerService',
  function($scope, $modal, LogFactory, ItemService, DesignerService){
   
    function sizeToString(size) {
      if (size > 1) {
        return 'many';
      } else if (size === 1) {
        return 'one';
      } else {
        return 'none';
      }
    }

    $scope.componentSize = sizeToString(0);
  
    $scope.$watch('item.components', function(components) {
      $scope.componentSize = sizeToString(_.size(components));
    });
 
    var logger = LogFactory.getLogger('ScoringPopupController');

    function onComponentsLoadError(error) {
      throw new Error("Error loading components");
    }

    function onComponentsLoaded(uiComponents) {
      $scope.interactions = uiComponents.interactions;
      $scope.widgets = uiComponents.widgets;
    }

    function onItemLoaded(item){
      $scope.item = item;
    }

    function onItemLoadError(err){
      logger.error(err);
    }

    DesignerService.loadAvailableUiComponents(onComponentsLoaded, onComponentsLoadError);
    ItemService.load(onItemLoaded, onItemLoadError) ;
  }]);
