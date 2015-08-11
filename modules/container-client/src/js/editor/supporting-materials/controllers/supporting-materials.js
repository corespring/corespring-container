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

          function onDelete(){
            logger.info('delete complete');
          }

          function onError(){
            logger.error('delete failed');
          }

          SupportingMaterialsService.delete(data, onDelete, onError);
        };

        function mainFile(m){
          return _.find(m.files, function(f){
            return f.isMain === true;
          });
        }
        
        function isMainHtml(selected){
          if(!selected){
            return false;
          }
          var main = mainFile(selected);
          return main && main.content !== undefined;
        }

        $scope.choose = function(data){
          $scope.selectedMaterial = data;
        };

        function mkMetadata(m){
          return {
            name: m.name,
            materialType: m.materialType
          };
        }

        $scope.$watch('selectedMaterial', function(m){
          if(!m){
            return;
          }

          $scope.mainFile = mainFile(m);
          $scope.isHtml = isMainHtml(m);
          $scope.isBinary = !$scope.isHtml;
          $scope.selectedMetadata = mkMetadata(m);

          if($scope.isBinary && $scope.mainFile){
            $scope.binaryPreviewUrl = SupportingMaterialsService.getBinaryUrl(m, $scope.mainFile);
          }
        });

        $scope.$watch('selectedMetadata', function(newValue){
          if(newValue){
            $scope.selectedMaterial.name = newValue.name;
            $scope.selectedMaterial.materialType = newValue.materialType;
          }
        }, true);


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

        $scope.$watch('item.supportingMaterials', function(materials){
          var unselectedMaterials = _.reject(materials, function(m){
            return m === $scope.selectedMaterial;
          });

          $scope.materialNames = _.pluck(unselectedMaterials, 'name');
        });

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
