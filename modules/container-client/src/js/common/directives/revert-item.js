angular.module('corespring-common.directives').directive('revertItem', [
  '$rootScope',
  'ItemService',
  function($rootScope,ItemService) {
    "use strict";
    return {
      link: function($scope) {
        $scope.initialItem = null;

        $scope.revertItem = function(){
          if($scope.initialItem){
            saveItem($scope.initialItem);
          }
        };

        function saveItem(item) {
          if(item.components) {ItemService.saveComponents(item.components);}
          if(item.profile) {ItemService.saveProfile(item.profile);}
          if(item.summaryFeedback) {ItemService.saveSummaryFeedback(item.summaryFeedback);}
          if(item.supportingMaterials) {ItemService.saveSupportingMaterials(item.supportingMaterials);}
          if(item.xhtml) {ItemService.saveXhtml(item.xhtml);}
        }

        ItemService.load(
          function onItemLoadSuccess(item){
            $scope.initialItem = _.cloneDeep(item);

            $(document).keyup(function(evt){
              if(evt.ctrlKey && evt.shiftKey && evt.altKey && evt.keyCode === 90) { //shift-ctrl-alt-z
                $scope.revertItem();
              }
            });
          },
          function onItemLoadError(err){
          });
      }
    };
  }
]);
