(function() {

  var ComponentToWiggiwizFeatureAdapter = function($log) {
    var service = {};
    service.componentToWiggiwizFeature = function(component, addToEditorCallback, deleteComponentCallback) {
      var componentType = component.componentType;
      return {
        name: componentType,
        title: component.title,
        titleGroup: component.titleGroup,
        toolbar: '<button class="btn btn-default btn-sm btn-small">CB</button>',
        clickable: true,
        compile: true,
        deleteNode: function($node, services) {
          deleteComponentCallback($node.attr('id'));
          $node.remove();
        },
        initialise: function($node, replaceWith) {
          var id = $node.attr('id');
          return replaceWith('<placeholder label="' + component.title + ': ' + id + '" id="' + id + '"></placeholder>');
        },
        addToEditor: function(editor, addContent) {
          addToEditorCallback(editor, addContent, component);
        },
        onDblClick: function($node, $scope, editor) {
          var data = {};
          var content = '<' + componentType + '-config id="' + $node.attr('id') + '"></' + componentType + '-config>';
          editor.showEditPane(data, 'Edit ' + component.name + ' (' + $node.attr('id') + ')', content, function() {
            $log.debug('on update...');
          }, {});
        },
        getMarkUp: function($node, $scope) {
          var id = $node.attr('id');
          return '<' + componentType + ' id = "' + id + '"></' + componentType + '>';
        }
      };
    };
    return service;
  };

  angular.module('corespring-editor.services')
    .service('ComponentToWiggiwizFeatureAdapter', ['$log', ComponentToWiggiwizFeatureAdapter]);

})();