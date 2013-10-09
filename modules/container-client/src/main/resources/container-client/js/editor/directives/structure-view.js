(function () {

  var link;

  link = function ($compile) {
    return function ($scope, $elem, attrs) {
      $scope.$watch('model.components', function (newValue) {
        if (!newValue) return;
        $scope.nodeSeq = _.map($scope.model.components, function (v, k) {
          return k;
        });
      });
      $scope.$watch('nodeSeq', function (newValue) {
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

        var idx = 0;
        node.find("*[id]").each(function (n) {
          var nid = $(this).attr('id');
          if (nid != $scope.nodeSeq[idx]) {
            $(this).replaceWith(nodeMap[$scope.nodeSeq[idx]]);
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
        template: [
          '<h1>Structure View</h1>',
          '<ul ui-sortable ng-model="nodeSeq">',
          '<li class="component-thumbnail " ng-class="{active: selectedComponent.id==id}" ng-click="selectComponent(id)" ng-repeat="(id, component) in model.components">{{component.componentType}} [{{id}}]</li>',
          '</ul>',
        ].join('')
      };
      return def;
    }
  ]);


}).call(this);