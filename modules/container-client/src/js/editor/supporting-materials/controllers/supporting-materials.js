/* global AddContentModalController, com */
angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$scope',
    '$modal',
    'ImageUtils',
    'ItemService',
    'SupportingMaterialsService',
    'EditorConfig',
    'LogFactory',
    'editorDebounce',
    'SmUtils',
    function(
      $scope,
      $modal,
      ImageUtils,
      ItemService,
      SupportingMaterialsService,
      EditorConfig,
      LogFactory,
      editorDebounce,
      SmUtils)
      {
        var logger  = LogFactory.getLogger('supporting-materials');

        $scope.extraFeatures = {
          definitions: [
            EditorConfig.mathJaxFeatureGroup(),
            EditorConfig.footnotesFeatureGroup()
          ]
        };

        $scope.overrideFeatures = EditorConfig.overrideFeatures;
        
        $scope.imageService = {

          addFile: function(file, onComplete, onProgress){

            if (ImageUtils.bytesToKb(file.size) > 500) {
              onComplete(ImageUtils.fileTooBigError(file.size, 500));
              return;
            }

            SupportingMaterialsService.addAsset(
              $scope.selectedMaterial.name,
              file, 
              onComplete, 
              onProgress);
          },
          changeSrcPath: function(src){
            return SupportingMaterialsService.getAssetUrl(
              $scope.selectedMaterial.name,
              src);
          },
          deleteFile: function(assetName){
            SupportingMaterialsService.deleteAsset(
              $scope.selectedMaterial.name,
              assetName
              );
          }
        };

        $scope.deleteMaterial = function(m, done){
          
          $scope.item.supportingMaterials = _.reject($scope.item.supportingMaterials, function(o){
            return o === m;
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

          SupportingMaterialsService.delete(m, onDelete, onError);
        };

        function isMainHtml(selected){
          if(!selected){
            return false;
          }
          var main = SmUtils.mainFile(selected);
          return main && main.content !== undefined;
        }

        $scope.chooseMaterial = function(m){
          $scope.selectedMaterial = m;
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

        var saveHtmlDebounced = editorDebounce(function(markup){
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
              $scope.chooseMaterial(newSupportingMaterial);
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
