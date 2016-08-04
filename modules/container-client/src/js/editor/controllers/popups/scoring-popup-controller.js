angular.module('corespring-editor.controllers').controller('ScoringPopupController', [
  '$modalInstance',
  '$scope',
  'DesignerService',
  'LogFactory',
  'components',
  'itemConfig',
  'SCORING_TYPE',
  'xhtml',
  function(
    $modalInstance,
    $scope,
    DesignerService,
    LogFactory,
    components,
    itemConfig,
    SCORING_TYPE,
    xhtml
  ) {

    var logger = LogFactory.getLogger('ScoringPopupController');

    $scope.SCORING_TYPE = SCORING_TYPE;

    $scope.sizeToString = function(size) {
      if (size > 1) {
        return 'many';
      } else if (size === 1) {
        return 'one';
      } else {
        return 'none';
      }
    };

    $scope.components = components;
    $scope.componentSize = $scope.sizeToString(_.keys(components).length);
    $scope.itemConfig = _.defaults(itemConfig, {scoringType: SCORING_TYPE.WEIGHTED});
    $scope.xhtml = xhtml;

    $scope.onComponentsLoadError = function(error) {
      throw new Error("Error loading components");
    };

    $scope.onComponentsLoaded = function(uiComponents) {
      $scope.interactions = uiComponents.interactions;
      $scope.widgets = uiComponents.widgets;
    };

    DesignerService.loadAvailableUiComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);

    $scope.close = function() {
      $modalInstance.close();
    };

  }]);