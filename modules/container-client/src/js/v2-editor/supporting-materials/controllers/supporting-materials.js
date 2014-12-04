angular.module('corespring-editor.controllers').controller('SupportingMaterials',[
'$scope',
'$log',
'$stateParams',
 function($scope, $log, $stateParams){
  var log = $log.debug.bind(null, '[supporting-materials]');
  log('!!!', $stateParams);

}]);
