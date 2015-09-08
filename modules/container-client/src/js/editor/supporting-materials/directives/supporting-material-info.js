angular.module('corespring-editor.directives')
  .directive('supportingMaterialInfo', [
    'SupportingMaterialsService',
    'SmUtils',
    'LogFactory',
    function(SupportingMaterialsService, SmUtils, LogFactory) {
  
      function link($scope, $elem, $attr, ngModel){


        ngModel.$render = function(){

          var data = ngModel.$viewValue; 
          
          $scope.fileSize = '';

          if(!data){
            return;
          }

          var mainFile = SmUtils.mainFile(data);
          if(mainFile.contentType !== 'text/html'){
            if(mainFile.contentLength){
              $scope.fileSize = SmUtils.fomatKB(mainFile.contentLength); 
            } else {
              SupportingMaterialsService.getFileSizeInKB(data, mainFile, function(size){
                $scope.fileSize = SmUtils.formatKB(size);
              }, function(){
                $scope.fileSize = 'unknown'; 
              });
            }
          } else {
            $scope.fileSize = 'n/a';
          }
        };
      }

      return {
        restrict: 'A',
        scope: {
          ngModel: '='
        },
        require: '^ngModel',
        link: link,
        templateUrl: '/editor/supporting-materials/directives/supporting-material-info.html'
      };     
    }]);