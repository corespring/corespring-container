/* global AddContentModalController, com */
angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$scope',
    '$modal',
    'ImageUtils',
    'ItemService',
    'SupportingMaterialsService',
    'LogFactory',
    'editorDebounce',
    'SmUtils',
    function(
      $scope,
      $modal,
      ImageUtils,
      ItemService,
      SupportingMaterialsService,
      LogFactory,
      debounce,
      SmUtils)
      {
        var logger  = LogFactory.getLogger('supporting-materials');

        $scope.imageService = {

          addFile: function(file, onComplete, onProgress){
            SupportingMaterialsService.addAsset(
              file, 
              $scope.selectedMaterial.name,
              onComplete, 
              onProgress);
          },
          changeSrcPath: function(src){
            return SupportingMaterialsService.getAssetUrl(
              src,
              $scope.selectedMaterial.name);
          },
          deleteFile: function(assetName){
            SupportingMaterialsService.deleteAsset(
              assetName,
              $scope.selectedMaterial.name);
          }
        };

        $scope.deleteItem = function(data, done){
          
          $scope.item.supportingMaterials = _.reject($scope.item.supportingMaterials, function(o){
            return o === data;
          });

          function onDelete(){
            logger.info('delete complete');
            $scope.selectedMaterial = null;
            $scope.binaryPreviewUrl = null;
            done();
          }

          function onError(){
            logger.error('delete failed');
          }

          SupportingMaterialsService.delete(data, onDelete, onError);
        };

        function isMainHtml(selected){
          if(!selected){
            return false;
          }
          var main = SmUtils.mainFile(selected);
          return main && main.content !== undefined;
        }

        $scope.choose = function(data){
          $scope.selectedMaterial = data;
        };

        $scope.$watch('selectedMaterial', function(m){
          if(!m){
            return;
          }

          $scope.mainFile = SmUtils.mainFile(m);
          $scope.isHtml = isMainHtml(m);
          $scope.isBinary = !$scope.isHtml;

          if($scope.isBinary && $scope.mainFile){
            $scope.binaryPreviewUrl = SupportingMaterialsService.getBinaryUrl(m, $scope.mainFile);
          }
        });

        var saveHtmlDebounced = debounce(function(markup){
          SupportingMaterialsService.updateContent($scope.selectedMaterial.name, $scope.mainFile.name, markup, 
            function(){
              console.log('update content ok');
            }, 
            function(){
              console.error('update content not ok', arguments);
            });
        }, 400, true);

        $scope.$watch('mainFile.content', function(markup, oldMarkup){
          if($scope.selectedMaterial && $scope.mainFile && markup && oldMarkup){
            saveHtmlDebounced(markup);
          }
        });

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
              $scope.choose(newSupportingMaterial);
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

        ItemService.load(onLoad,onError);

    }]);
