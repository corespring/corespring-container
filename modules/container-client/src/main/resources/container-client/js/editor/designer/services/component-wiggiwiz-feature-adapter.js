(function() {

  var ComponentToWiggiwizFeatureAdapter = function($log) {
    var service = {};
    service.componentToWiggiwizFeature = function(component, $scope) {
      var componentType = component.componentType;
      return {
        name: componentType,
        toolbar: '<button class="btn btn-default btn-sm btn-small">CB</button>',
        clickable: true,
        compile: true,
        initialise: function($node, replaceWith) {
          var id = $node.attr('id');
          return replaceWith('<placeholder label="' + component.name + ': ' + id + '" id="' + id + '"></placeholder>');
        },
        addToEditor: function(editor, addContent) {
          var id = ++$scope.lastId;
          $scope.item.components[id] = component.defaultData;
          addContent($('<placeholder id="' + id + '" label="' + component.name + '">'));
        },
        onDblClick: function($node, $scope, editor) {
          var data = {};
          var content = '<' + componentType + '-config id="' + $node.attr('id') + '"></' + componentType + '-config>';
          editor.showEditPane(data, 'Edit multiple-choice (' + $node.attr('id') + ')', content, function() {
            $log.debug('on update...');
          }, {});
        },
        getMarkUp: function($node, $scope) {
          var id;
          if ($scope && $scope.$$childHead) {
            id = $scope.$$childHead.id;
          } else {
            id = $node.attr('id');
          }
          return '<' + componentType + ' id = "' + id + '"></' + componentType + '>';
        }
      };
    };
    return service;
  };

  angular.module('corespring-editor.services')
    .service('ComponentToWiggiwizFeatureAdapter', ['$log',
      ComponentToWiggiwizFeatureAdapter
    ]
    );

})();
