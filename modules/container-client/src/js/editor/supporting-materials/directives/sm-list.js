 angular.module('corespring-editor.directives')
    .directive('smList', ['LogFactory', 'SmUtils', function(LogFactory, SmUtils){

      var logger = LogFactory.getLogger('sm-list');

      function link($scope, $element, $attrs, ngModel){

        $scope.$watch('ngModel', function(update){
          logger.debug('$watch', ngModel.$viewValue);
          $scope.sections = SmUtils.group(ngModel.$viewValue, $attrs.groupBy || 'materialType');
        }, true);
      }

      function SmListController($scope){

        this.chooseItem = function(item){
          $scope.chooseItem()(item);
        };

        this.deleteItem = function(item){
          $scope.deleteItem()(item);
        };
      }

      return {
        restrict: 'A',
        controller: SmListController,
        require: '^ngModel',
        scope: {
          ngModel: '=',
          deleteItem: '&',
          chooseItem: '&'
        },
        link: link,
        template: ['<div class="sm-list">',
                   '  <ul class="ul-sections">',
                   '    <li ng-repeat="s in sections" ng-model="s" sm-section>',
                   '    </li>',
                   '  </ul>',
                   '</div>'].join('')
      };
    }
  ]);

 angular.module('corespring-editor.directives')
  .directive('smSection', [function(){
      function link($scope, $element, $attrs){
        console.log('smSection');
      }

      return {
        restrict: 'A',
        scope: {
          ngModel: '=',
        },
        link: link,
        template: ['<ul>',
                  '  <li class="sm-section-header">{{ngModel.name}}</li>',
                  '  <li class="sm-item" ng-repeat="i in ngModel.items" sm-item ng-model="i"></li>',
                  '</ul>'].join('')
      };

  }]);

 angular.module('corespring-editor.directives')
  .directive('smItem', [function(){
      function link($scope, $element, $attrs, smListController){

        $scope.deleteItem = function($event){
          smListController.deleteItem($scope.ngModel);
        };

        $scope.chooseItem = function(){
          smListController.chooseItem($scope.ngModel);
        };
      }

      return {
        restrict: 'A',
        require: '^smList',
        scope: {
          ngModel: '=',
        },
        link: link,
        templateUrl: '/editor/supporting-materials/directives/sm-item.html'
      };

  }]);
