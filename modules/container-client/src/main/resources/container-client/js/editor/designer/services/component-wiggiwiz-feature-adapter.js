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

    var service = {};
    service.componentToWiggiwizFeature = function(component, addToEditorCallback, deleteComponentCallback, reAddComponentCallback) {
      var componentType = component.componentType;
      return {
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
          return replaceWith('<placeholder' +
            ' component-type="' + component.componentType +
            '" label="' + component.title + ': ' + id +
            '" id="' + id +
            '" contenteditable="' + false +
            '"></placeholder>');
        },
        addToEditor: function(editor, addContent) {
          addToEditorCallback(editor, addContent, component);
        },
        editNode: function($node, $scope, editor) {
          var data = {};
          var content = [
            '<div class="navigator-toggle-button-row">',
            '  <div class="navigator-title">' + getTitle(component) + '</div>',
            '</div>',
            '<div class="config-panel-container">',
            '<' + componentType + '-config id="' + $node.attr('id') + '"></' + componentType + '-config>',
            '</div>'
          ].join('\n');

          $scope.$emit('open-config-panel');

          data.defaultData = component.defaultData;

          editor.showEditPane(data, getTitle(component), content, function() {
            $log.debug('on update...');
          }, {}, function() {
            /** Deselect component when config dismissed **/
            fireComponentDeselection($node);
          });

          fireComponentSelection($node);
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
    .service('ComponentToWiggiwizFeatureAdapter', ['$rootScope', '$log', ComponentToWiggiwizFeatureAdapter]);

})();
