(function() {

  var ComponentToWiggiwizFeatureAdapter = function($rootScope, $log) {

    function getTitle(component) {
      return _.isEmpty(component.title) ? component.name : component.title;
    }

    function getComponentId($node) {
      return parseInt($node.attr('id'), 10);
    }

    function fireComponentSelection($node) {
      $rootScope.selectedComponentId = getComponentId($node);
      $rootScope.$broadcast('componentSelected', {
        id: $node.attr('id')
      });
    }

    function fireComponentSelectionToggled($node) {
      $rootScope.selectedComponentId = $rootScope.selectedComponentId === getComponentId($node) ?
        undefined : getComponentId($node);

      $rootScope.$broadcast('componentSelectionToggled', {
        id: $node.attr('id')
      });
    }

    function fireComponentDeselection() {
      $rootScope.selectedComponentId = undefined;
      $rootScope.$broadcast('componentDeselected');
    }

    function tag(name,attributes){
      var result = [];
      result.push('<' + name);
      for(var prop in attributes){
        result.push(' ' + prop + '="' + attributes[prop] + '"');
      }
      result.push('></' + name + '>');
      return result.join('');
    }

    var service = {};
    service.componentToWiggiwizFeature = function(component, addToEditorCallback, deleteComponentCallback, reAddComponentCallback) {
      var componentType = component.componentType;
      return {
        attributeName: componentType,
        name: componentType,
        title: component.title,
        titleGroup: component.titleGroup,
        toolbar: '<button class="btn btn-default btn-sm btn-small">CB</button>',
        compile: true,
        draggable: true,
        deleteNode: function($node, services) {
          deleteComponentCallback($node.attr('id'));
        },
        reAddNode: function($node, scope) {
          reAddComponentCallback($node);
        },
        initialise: function($node, replaceWith) {
          var id = $node.attr('id');
          return replaceWith(tag('placeholder', {
            'component-type': component.componentType,
            'label': component.title + ': ' + id,
            'id': id,
            'class': component.componentType,
            'contenteditable': false
          }));
        },
        addToEditor: function(editor, addContent) {
          addToEditorCallback(editor, addContent, component);
        },
        getMarkUp: function($node, $scope) {
          var attributes = {id: $node.attr('id')};
          attributes[componentType] = '';
          return tag('div', attributes);
        }
      };
    };
    return service;
  };

  angular.module('corespring-editor.services')
    .service('ComponentToWiggiwizFeatureAdapter', ['$rootScope', '$log', ComponentToWiggiwizFeatureAdapter]);

})();
