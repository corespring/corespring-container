(function () {

  "use strict";

  var link;

  link = function ($compile) {
    return function ($scope, $elem, attrs) {

      $scope.$watch('model.components', function (newValue) {
        if (!newValue) return;
      });

      $scope.selectComponent = function(comp) {
         $scope.selectedComponent = {
          id: comp.id,
          component: comp
        };
      };

      $scope.$watch('model.xhtml', function(newValue) {
        if (!newValue) return;
        var node = $($scope.model.xhtml);

        var orderedComponents = [];

        node.find("*[id]").each(function (idx, n) {
          var nid = $(this).attr('id');
          var clonedComponent = _.cloneDeep($scope.model.components[nid]);
          clonedComponent.id = nid;
          orderedComponents.push(clonedComponent);
        });

        $scope.orderedComponents = orderedComponents;
      });

      $scope.$watch('orderedComponents', function (newValue) {
        if (!$scope.model || !$scope.model.xhtml) return;
        console.log("Structure has changed");
        var node = $($scope.model.xhtml);
        var idx = 0;

        function swapNodes(a, b) {
          console.log("Swapping ", a, b);
          var aparent = a.parentNode;
          var asibling = a.nextSibling === b ? a : a.nextSibling;
          b.parentNode.insertBefore(a, b);
          aparent.insertBefore(b, asibling);
        }

        var nodeMap = {};
        node.find("*[id]").each(function (n) {
          var nid = $(this).attr('id');
          nodeMap[nid] = $(this).clone();
        });

        idx = 0;
        node.find("*[id]").each(function (n) {
          var leftId = $(this).attr('id');
          var rightId = $scope.orderedComponents[idx].id;
          if (leftId != rightId) {
            $(this).replaceWith(nodeMap[rightId]);
          }
          idx++;
        });

        $scope.model.xhtml = "<div>" + node.html() + "</div>";
      }, true);
      return;
    };
  };

  angular.module('corespring-editor.directives').directive('structureView', [
    '$compile', function ($compile) {
      var def;
      def = {
        link: link($compile),
        restrict: 'E',
        /*scope: {
          model: '=ngModel',
          selectedComponent: '=',
          componentSet: '='
        },*/
        template: [
          '<h1>Structure View</h1>',
          '<div class="btn-group">',
            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">Add...<span class="caret"></span></button>',
            '<ul class="dropdown-menu" role="menu" >',
              '<li ng-repeat="descriptor in componentSet">',
              '  <a ng-click="addComponent(descriptor)">',
              '    <img ng-src="{{descriptor.icon}}"/>',
              '    {{descriptor.name}}',
              '</a>',
              '</li>',
            '</ul>',
          '</div>',
          '<ul ui-sortable ng-model="orderedComponents">',
          '<li class="component-thumbnail "',
          ' ng-class="{active: selectedComponent.id==component.id}"',
          ' ng-click="selectComponent(component)" ',
          ' ng-repeat="component in orderedComponents">{{component.componentType}} [{{component.id}}]</li>',
          '</ul>',
        ].join('')
      };
      return def;
    }
  ]);
}).call(this);