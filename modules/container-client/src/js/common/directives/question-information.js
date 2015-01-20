angular.module('corespring-common.directives')
  .directive('questionInformation', [
    '$sce',
    '$log',
    'DataQueryService',
    'ProfileFormatter',
    'ComponentService',
    'SupportingMaterialsService',
    'MathJaxService',
    function($sce, $log, DataQueryService, ProfileFormatter, ComponentService, SupportingMaterialsService, MathJaxService) {
      return {
        restrict: 'EA',
        scope: {
          item: "=ngModel"
        },
        template: [
          '<div ng-if="item" class="question-information">',
          '  <div class="col-sm-3">',
          '    <ul role="tablist" class="nav nav-pills nav-stacked">',
          '      <li role="presentation" ng-class="{active: activeTab == \'question\'}" ng-click=',
          '      "selectTab(\'question\')">',
          '        <a>Question</a>',
          '      </li>',
          '      <li role="presentation" ng-class="{active: activeTab == \'profile\'}" ng-click=',
          '      "selectTab(\'profile\')">',
          '        <a>Profile Information</a>',
          '      </li>',
          '      <li role="presentation" ng-show="item.supportingMaterials.length > 0">',
          '        <a data-toggle="dropdown" class="dropdown-toggle">Supporting Materials</a>',
          '        <ul role="menu" class="dropdown-menu">',
          '          <li ng-repeat="s in supportingMaterials" ng-model="s" ng-class=',
          '          "{divider: s.type == \'divider\', data: s.type == \'data\', active: s.index == activeSmIndex, \'dropdown-header\': s.type == \'header\'}">',
          '          {{s.type == \'header\' ? s.label : \'\'}}<a ng-if="s.type == \'data\'"',
          '            ng-click="selectSupportingMaterial(s.index)">{{s.label}}</a>',
          '          </li>',
          '        </ul>',
          '      </li>',
          '    </ul>',
          '  </div>',
          '  <div class="col-sm-8">',
          '    <div ng-show="activeTab == \'question\'" class="player-container">',
          '      <corespring-demo-player player-markup="item.xhtml" player-item="item" player-mode="playerMode">',
          '      </corespring-demo-player>',
          '    </div>',
          '    <div ng-show="activeTab == \'profile\'" class="profile">',
          '      <div profile-preview="" ng-model="item"></div>',
          '    </div>',
          '    <div ng-show="activeTab == \'supportingMaterial\'" class="supporting-material">',
          '      <h3>',
          '        {{selectedSupportingMaterialName}}',
          '      </h3>',
          '      <div style="height: 400px;" ng-if="getContentType() != \'text/html\'">',
          '        <iframe ng-src="{{selectedSupportingMaterialUrl}}"></iframe>',
          '      </div>',
          '      <div ng-if="getContentType() == \'text/html\'">',
          '        <div ng-bind-html-unsafe="selectedSupportingMaterialContent"></div>',
          '      </div>',
          '    </div>',
          '  </div>',
          '  <div class="clearfix"></div>',
          '</div>'
        ].join('\n'),
        link: function($scope, $element) {

          $scope.$watch('item', function(n) {
            if (n) {
              $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups($scope.item.supportingMaterials);
            }
          });

          $scope.activeTab = 'question';
          $scope.playerMode = "gather";

          $scope.selectTab = function(tab) {
            $scope.activeTab = tab;
            $scope.activeSmIndex = $scope.selectedSupportingMaterialUrl = $scope.selectedSupportingMaterialContent = undefined;
          };

          $scope.selectSupportingMaterial = function(smIndex) {
            $scope.activeTab = 'supportingMaterial';
            $scope.activeSmIndex = smIndex;

            $scope.selectedSupportingMaterialName = SupportingMaterialsService.getSupportingName($scope.item.supportingMaterials, smIndex);
            $scope.selectedSupportingMaterialUrl = SupportingMaterialsService.getSupportingUrl($scope.item.supportingMaterials, smIndex);
            $scope.selectedSupportingMaterialContent = SupportingMaterialsService.getContent($scope.item.supportingMaterials, smIndex);

            MathJaxService.parseDomForMath(100, $element[0]);
          };

          $scope.getContentType = function() {
            return SupportingMaterialsService.getContentType($scope.item.supportingMaterials, $scope.activeSmIndex);
          };


        }
      };
    }
  ]);