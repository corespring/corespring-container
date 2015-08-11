/* global AddContentModalController, com */

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$scope',
    '$modal',
    'ImageUtils',
    'ItemService',
    'SupportingMaterialsService',
    'LogFactory',
    function(
      $scope,
      $modal,
      ImageUtils,
      ItemService,
      SupportingMaterialsService,
      LogFactory)
      {
        var logger  = LogFactory.getLogger('supporting-materials');

        $scope.deleteItem = function(data){
          
          $scope.item.supportingMaterials = _.reject($scope.item.supportingMaterials, function(o){
            return o === data;
          });

          ItemService.saveSupportingMaterials($scope.item.supportingMaterials);
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

          modalInstance.result.then(function(createRequest) {

            function onCreate(newSupportingMaterial){
              $scope.item.supportingMaterials.push(newSupportingMaterial);
            }

            function onError(err){
              logger.warn(err);
            }

            SupportingMaterialsService.create(createRequest, onCreate, onError);
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
