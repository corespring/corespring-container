 angular.module('corespring-editor.directives')
  .constant('SM_LIST_EVENTS', {
    ITEM_SELECTED: 'sm-list.item-selected' 
  })
  .controller('SmListController', ['$scope', '$timeout', 'SM_LIST_EVENTS',function SmListController($scope, $timeout, EVENTS){
      this.chooseItem = function(item) {
        $scope.chooseItem()(item);
        $scope.$broadcast('itemSelected', item);
      };

      this.deleteItem = function(item) {
        
        $scope.deleteItem()(item, function(){
          var nextItem;
          if ($scope.ngModel && $scope.ngModel.length > 0) {
            nextItem = $scope.ngModel[0];
          } else {
            nextItem = null;
          }

          $timeout(function(){
            this.chooseItem(nextItem);
          }.bind(this));
        }.bind(this));

        $scope.$broadcast( EVENTS.ITEM_SELECTED, null);

      };
   }])
   .directive('smList', ['$timeout', 'LogFactory', 'SmUtils', 'SM_LIST_EVENTS',function($timeout, LogFactory, SmUtils, EVENTS) {

     var logger = LogFactory.getLogger('sm-list');

     function link($scope, $element, $attrs, ngModel) {

      function watchOnlyNameAndType($scope) {
        if(!$scope.ngModel){
          return;
        }
        return $scope.ngModel.map(function(m) {
         return {
           name: m.name,
           materialType: m.materialType
         };
        });
      }

      function onUpdate(update) {
        logger.debug('$watch', ngModel.$viewValue);
        $scope.sections = SmUtils.group(ngModel.$viewValue, $attrs.groupBy || 'materialType');
      }

      $scope.$watch(watchOnlyNameAndType, onUpdate, true);

      $scope.$watch('selectedItem', function(i){
        $timeout(function(){
          $scope.$broadcast(EVENTS.ITEM_SELECTED, i);
        });
      });
     }

     return {
       restrict: 'A',
       controller: 'SmListController',
       require: '^ngModel',
       scope: {
         ngModel: '=',
         selectedItem: '=',
         deleteItem: '&',
         chooseItem: '&'
       },
       link: link,
       template: ['<div class="sm-list">',
         '  <ul class="ul-sections">',
         '    <li ng-repeat="s in sections" ng-model="s" sm-section>',
         '    </li>',
         '  </ul>',
         '</div>'
       ].join('')
     };
   }])
   .directive('smSection', [function() {
     return {
       restrict: 'A',
       scope: {
         ngModel: '='
       },
       template: ['<ul>',
         '  <li class="sm-section-header">{{ngModel.name || \'Other\'}}</li>',
         '  <li class="sm-item" ng-repeat="i in ngModel.items"',
         '     sm-item ng-model="i"></li>',
         '</ul>'
       ].join('')
     };
   }])
   .directive('smItem', ['SM_LIST_EVENTS',function(EVENTS) {
     function link($scope, $element, $attrs, smListController) {

       $scope.$on(EVENTS.ITEM_SELECTED, function($event, item) {
         $scope.selected = item === $scope.ngModel;
       });

       $scope.deleteItem = function($event) {
         smListController.deleteItem($scope.ngModel);
       };

       $scope.chooseItem = function() {
         smListController.chooseItem($scope.ngModel);
       };
     }

     return {
       restrict: 'A',
       require: '^smList',
       replace: true,
       scope: {
         ngModel: '='
       },
       link: link,
       template: [
            '<li ng-class="{active: selected}" class="sm-item">',
            '  <a ng-click="chooseItem()">{{ngModel.name}}</a>',
            '  <i ng-click="deleteItem()" class="fa fa-trash-o pull-right"></i>',
            '</li>'
       ].join('')
     };

   }]);