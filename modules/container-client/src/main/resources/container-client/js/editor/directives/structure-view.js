(function () {

  "use strict";

  var link;

  link = function ($compile, $log) {
    return function ($scope, $elem, attrs) {

      $scope.sortableOptions = {
        start:  function() {
          // we need to manually destroy any tooltips cause ui-sortable doesn't work together nicely with bootstrap tooltip
          $($elem).find('li').tooltip('destroy');
        }
      };

      $scope.selectComponent = function (comp) {
        var selected = $scope.model.components[comp.id];
        $scope.selectedComponent.id = comp.id;
        $scope.selectedComponent.component = selected;
      };

      $scope.removeComponent = function (comp) {
        delete $scope.model.components[comp.id];
        var node = $($scope.model.xhtml);
        node.find("[id='" + comp.id + "']").remove();
        $scope.model.xhtml = "<div>" + node.html() + "</div>";
      };

      $scope.$watch('model.xhtml', function (newValue) {
        if (!newValue) {return;}
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
        if (!$scope.model || !$scope.model.xhtml) {return;}
        console.log("Structure has changed");
        var node = $($scope.model.xhtml);
        var idx = 0;

        var nodeMap = {};
        node.find("*[id]").each(function (n) {
          var nid = $(this).attr('id');
          nodeMap[nid] = $(this).clone();
        });

        idx = 0;
        node.find("*[id]").each(function (n) {
          var leftId = $(this).attr('id');
          var rightId = $scope.orderedComponents[idx].id;
          if (leftId !== rightId) {
            $(this).replaceWith(nodeMap[rightId]);
          }
          idx++;
        });

        $scope.model.xhtml = "<div>" + node.html() + "</div>";
      }, true);

      $scope.loadIcon = function(type){
        return $scope.getIconUrl({ type: type });
      };


      $scope.getComponentTypeLabel = function(type){

        switch(type){
          case "corespring-drag-and-drop" : 
            return "Drag and Drop";
          case "corespring-multiple-choice" : 
            return "Multiple Choice";
          case "corespring-inline-choice" : 
            return "Inline Choice";
          default: 
            return type;
        }
      };

    };
  };

  angular.module('corespring-editor.directives').directive('structureView', [
    '$compile', '$log', function ($compile, $log) {
      var def;
      def = {
        link: link($compile, $log),
        restrict: 'E',
        scope: {
           getIconUrl: '&',
           model : '=ngModel',
           selectedComponent: '='
        },
        template: [
          '<ul ui-sortable="sortableOptions" ng-model="orderedComponents">',
          '<li class="component-thumbnail"',
          ' ng-click="selectComponent(component)"',
          ' ng-class="{last:$last, active: selectedComponent.id==component.id}"',
          '  corespring-tooltip="{{ getComponentTypeLabel(component.componentType) }}"',
          '  ng-repeat="component in orderedComponents">',
          '  <table >',
          '    <tr>',
          '      <td>',
          '        <div class="counter">{{ $index + 1 }}.</div>',
          '        <div class="score-label">Score:</div>',
          '        <div class="score">{{component.weight}}</div>',
          '      </td>',
          '      <td>',
          '        <img ng-src="{{loadIcon(component.componentType)}}"/>',
          '      </td>',
          '      <td class="right">',
          '        <div class="grip-tape"></div>',
          '        <div class="delete"><i ng-click="removeComponent(component)" class="glyphicon glyphicon-remove"></i></div>',
          '      </td>',
          '    </tr>',
          '   </table>',
          '</li>',
          '</ul>',
        ].join('')
      };
      return def;
    }
  ]);
}).call(this);