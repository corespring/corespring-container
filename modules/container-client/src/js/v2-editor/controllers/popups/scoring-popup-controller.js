angular.module('corespring-editor.controllers').controller('ScoringPopupController', [
  '$scope',
  '$modalInstance',
  'LogFactory',
  'DesignerService',
  'components',
  'xhtml',
  function($scope, $modalInstance, LogFactory, DesignerService, components, xhtml){

    function sizeToString(size) {
      if (size > 1) {
        return 'many';
      } else if (size === 1) {
        return 'one';
      } else {
        return 'none';
      }
    }

    var logger = LogFactory.getLogger('ScoringPopupController');
    
    $scope.components = components;
    $scope.componentSize = sizeToString(_.keys(components).length);
    $scope.xhtml = xhtml;

    function onComponentsLoadError(error) {
      throw new Error("Error loading components");
    }

    function onComponentsLoaded(uiComponents) {
      $scope.interactions = uiComponents.interactions;
      $scope.widgets = uiComponents.widgets;
    }

    DesignerService.loadAvailableUiComponents(onComponentsLoaded, onComponentsLoadError);

    $scope.ok = function(){
      $modalInstance.close(components);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };
  }]);
