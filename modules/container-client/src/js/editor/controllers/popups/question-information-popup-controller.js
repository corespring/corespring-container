angular.module('corespring-editor.controllers').controller('QuestionInformationPopupController', [
  '$scope',
  'LogFactory',
  '$modal',
  'item',
  function($scope, LogFactory, $modal,item) {
    $scope.item = item;
    $scope.tabs = { question: true, profile: true, supportingMaterial: true};
  }]);
