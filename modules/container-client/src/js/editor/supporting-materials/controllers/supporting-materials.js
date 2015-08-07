/* global AddContentModalController, com */

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$scope',
    '$modal',
    'ImageUtils',
    'ItemService',
    'MaterialsService',
    'LogFactory',
    function(
      $scope,
      $modal,
      ImageUtils,
      ItemService,
      MaterialsService,
      LogFactory)
      {

        var logger  = LogFactory.getLogger('supporting-materials');

        $scope.deleteItem = function(data){
          console.log('deleteItem : ', data);
        };

        $scope.chooseItem = function(data){
          console.log('chooseItem : ', data);
        };

        $scope.addNew = function() {
          var modalInstance = $modal.open({
            templateUrl: '/templates/popups/addSupportingMaterial',
            controller: 'AddSupportingMaterialPopupController',
            backdrop: 'static',
            resolve: {
              materialNames: function(){
                return _.pluck($scope.item.supportingMaterials, 'name');
              } 
            }
          });

          modalInstance.result.then(function(newMaterial) {

            function onCreate(updatedMaterials){
              $scope.item.supportingMaterials = updatedMaterials;
            }

            function onError(err){
              logger.warn(err);
            }

            MaterialsService.create(newMaterial, onCreate, onError);
          });
        };

        function onLoad(data){
          $scope.item = data;

          if(!$scope.item.supportingMaterials){
            $scope.item.supportingMaterials = [];
          }
        }

        function onError(err){
          logger.error(err);
        }

        function init(){
          ItemService.load(onLoad,onError);
        }

        init();

    }]);
