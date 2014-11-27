angular.module('corespring-editor.controllers').service('ComponentData', [function(){


  function ComponentData(){

  }

  return new ComponentData();
}]);

angular.module('corespring-editor.controllers')
  .controller('QuestionController',
  ['$scope', 'ComponentData', function($scope, ComponentData){


  $scope.$on('registerComponent', function(event, id, bridge){
    ComponentData.registerComponent(id, bridge);
  });

  $scope.$on('registerComponentPlaceholder', function(event, id, placeholder){
    ComponentData.registerComponentPlaceholder(id, placeholder);
  });

  ItemService.load(function(item){
      ComponentData.setModel(item.components);
  });
  function addContent(){}

  function addToEditor(){

    ComponentData.addComponent(componentType);
    addContent('<placeholder ...>');

  }
}]);
