(function() {

  var ComponentToWiggiwizFeatureAdapter = function() {

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
        compile: true,
        draggable: true,
        insertInline: component.insertInline,
        name: componentType,
        title: component.title,
        titleGroup: component.titleGroup,
        toolbar: '<button class="btn btn-default btn-sm btn-small">CB</button>',
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
    .service('ComponentToWiggiwizFeatureAdapter', [ComponentToWiggiwizFeatureAdapter]);

})();
