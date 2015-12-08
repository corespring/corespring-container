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

            var typeError = ImageUtils.acceptableType(
              file.type, 
              ImageUtils.imageTypes()
            );
            
            if(typeError){ 
              onComplete(typeError);
              return;
            }

            if (ImageUtils.bytesToKb(file.size) > 500) {
              onComplete(ImageUtils.fileTooBigError(file.size, 500));
              return;
            }

            SupportingMaterialsService.addAsset(
              $scope.selectedMaterial.name,
              file, 
              function(err, data){
                emitItemChanged();
                onComplete(err, data);
              },
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
          
        function removeMaterial(m, done){
          $scope.item.supportingMaterials = _.reject($scope.item.supportingMaterials, function(o){
            return o === m;
          });

          function onDelete(){
            logger.info('delete complete');
            $scope.selectedMaterial = null;
            $scope.binaryPreviewUrl = null;
            emitItemChanged(); 
            done();
          }

          function onError(){
            logger.error('delete failed');
          }

          SupportingMaterialsService.delete(m, onDelete, onError);
        }

        $scope.deleteMaterial = function(m, done){

          var modalInstance = $modal.open({
            templateUrl: '/templates/popups/removeSupportingMaterial',
            controller: 'RemoveSupportingMaterialPopupController',
            backdrop: 'static',
            resolve: {
              name: function(){
                return m.name;
              }
            }
          });

          modalInstance.result.then(function(removeConfirmed) {
            removeMaterial(m, done);
          });
        };

        function emitItemChanged(){
          $scope.$emit('itemChanged', {partChanged: 'supporting-materials'});
        }

        function isMainHtml(main){
          if(!main){
            return false;
          }
          return main.contentType === 'text/html';
        }

        $scope.chooseMaterial = function(m){
          $scope.selectedMaterial = m;
        };

        $scope.$watch('selectedMaterial', function(m){
          if(!m){
            return;
          }

          $scope.mainFile = SmUtils.mainFile(m);
          $scope.isHtml = isMainHtml($scope.mainFile);
          $scope.isBinary = !$scope.isHtml;

          if($scope.mainFile && $scope.isBinary){
            $scope.binaryPreviewUrl = SupportingMaterialsService.getBinaryUrl(m, $scope.mainFile);
          }
        });

        var saveHtmlDebounced = editorDebounce(function(markup){
          SupportingMaterialsService.updateContent($scope.selectedMaterial.name,
            $scope.mainFile.name, markup, 
            function(){
              emitItemChanged(); 
            }, 
            function(){
              console.error('update content not ok', arguments);
            });
        }, 400, true);

        $scope.$watch('mainFile.content', function(markup, oldMarkup){
          if($scope.selectedMaterial && $scope.mainFile && markup && oldMarkup && markup !== oldMarkup){
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
              emitItemChanged(); 
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
