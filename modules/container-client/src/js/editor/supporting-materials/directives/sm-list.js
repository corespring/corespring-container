 angular.module('corespring-editor.directives')
    .directive('smList', [function(){

      function link($scope, $element, $attrs){

        $scope.$on('sm.deleteItem', function($event, ngModel){
          $scope.deleteItem()(ngModel);
        });

        $scope.$on('sm.chooseItem', function($event, ngModel){
          $scope.chooseItem()(ngModel);
        });
      }

      return {
        restrict: 'A',
        scope: {
          ngModel: '=',
          deleteItem: '&'
        },
        link: link,
        template: ['<div class="sm-list">',
                   '  <ul class="ul-sections">',
                   '    <li ng-repeat="s in ngModel" ng-model="s" sm-section>',
                   '    </li>',
                   '  </ul>',
                   '</div>'].join('')
        //templateUrl: '/editor/supporting-materials/directives/sm-list.html'
      };
    }
  ]);

 angular.module('corespring-editor.directives')
  .directive('smSection', [function(){
      function link($scope, $element, $attrs){
        console.log('smSection');
        console.log()
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
        //templateUrl: '/editor/supporting-materials/directives/sm-section.html'
      };

  }]);

 angular.module('corespring-editor.directives')
  .directive('smItem', [function(){
      function link($scope, $element, $attrs){

        console.log('smItem');

        $scope.deleteItem = function($event){
          console.log('d', arguments);
          $scope.$emit('sm.deleteItem', $scope.ngModel);
        }

        $scope.chooseItem = function(){
          $scope.$emit('sm.chooseItem', $scope.ngModel);
        }
      }

      return {
        restrict: 'A',
        scope: {
          ngModel: '=',
        },
        link: link,
        templateUrl: '/editor/supporting-materials/directives/sm-item.html'
      };

  }]);
