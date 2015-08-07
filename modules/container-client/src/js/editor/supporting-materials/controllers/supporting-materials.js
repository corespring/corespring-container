/* global AddContentModalController, com */

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$scope',
    'ImageUtils',
    'ItemService',
    'SupportingMaterialsService',
    function(
      $scope,
      ImageUtils,
      ItemService,
      SupportingMaterialsService){

        $scope.deleteItem = function(data){
          console.log('deleteItem : ', data);
        }

        $scope.chooseItem = function(data){

        }

        $scope.addNew = function(){
          $scope.supportingMaterials[0].items.push({name: '??'});
        }

        $scope.supportingMaterials = [
          {
            name: 'Section 2',
            items: [
              {name: 'carrot'},
              {name: 'pear'}
            ]
          },
          {
            name: 'Section 1',
            items: [
              {name: 'apple'},
              {name: 'banana'}
            ]
          }
        ]

    }]);
