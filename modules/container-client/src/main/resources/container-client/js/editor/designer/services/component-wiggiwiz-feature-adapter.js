(function() {

  var ComponentToWiggiwizFeatureAdapter = function($rootScope, $log) {

    function getTitle(component) {
      return _.isEmpty(component.title) ? component.name : component.title;
    }

    function fireComponentSelection($node) {
      $rootScope.selectedComponentId = parseInt($node.attr('id'), 10);
      $rootScope.$broadcast('componentSelected', {
        id: $node.attr('id')
      });
    }

    function fireComponentSelectionToggled($node) {
      if ($rootScope.selectedComponentId === parseInt($node.attr('id'), 10)) {
        $rootScope.selectedComponentId = undefined;
      } else {
        $rootScope.selectedComponentId = parseInt($node.attr('id'), 10);
      }
      $rootScope.$broadcast('componentSelectionToggled', {
        id: $node.attr('id')
      });
    }

    function fireComponentDeselection() {
      $rootScope.selectedComponentId = undefined;
      $rootScope.$broadcast('componentDeselected');
    }

    var service = {};
    service.componentToWiggiwizFeature = function(component, addToEditorCallback, deleteComponentCallback) {
      var componentType = component.componentType;
      return {
        name: componentType,
        title: component.title,
        titleGroup: component.titleGroup,
        toolbar: '<button class="btn btn-default btn-sm btn-small">CB</button>',
        compile: true,
        deleteNode: function($node, services) {
          deleteComponentCallback($node.attr('id'));
          $node.remove();
        },
        initialise: function($node, replaceWith) {
          var id = $node.attr('id');
          return replaceWith('<placeholder component-type="' + component.componentType + '" label="' + component.title + ': ' + id + '" id="' + id + '"></placeholder>');
        },
        addToEditor: function(editor, addContent) {
          addToEditorCallback(editor, addContent, component);
        },
        onDblClick: function($node, $scope, editor) {
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
        onClick: function($node, $scope) {

          /** Use timer trickery to only execute provided function on single click **/
          function onSingleClick(fn) {
            if ($scope.clickTimer) {
              clearTimeout($scope.clickTimer);
              $scope.clickTimer = undefined;
            } else {
              $scope.clickTimer = setTimeout(function() {
                fn();
                $scope.clickTimer = undefined;
              }, 200);
            }
          }

          onSingleClick(function() {
            fireComponentSelectionToggled($node);
          });
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
