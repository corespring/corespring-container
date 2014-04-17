angular.module('corespring-catalog.directives').directive('catalogview', [ '$sce', function($sce) {

  function priorUse(profile) {
    var str = "";
    if (profile) {
      if (profile.priorUse) {
        str += profile.priorUse;
      }
      if (profile.priorGradeLevel) {
        str += ", ";
        if (profile.priorGradeLevel.length > 1) {
          str += "Grades " + profile.priorGradeLevel.join(", ").replace('KG', 'K');
        } else {
          str += "Grade " + profile.priorGradeLevel[0];
        }
      }
      return str;
    } else {
      return undefined;
    }
  }

  // margin-right: 3px;

  var css = [
    '<style type="text/css">',
    '  .catalog-nav {',
    '      position: relative',
    '      width: 100%;',
    '      background-color: #847d84;',
    '      background-image: -moz-linear-gradient(top, #433f43, #777177);',
    '      background-image: -ms-linear-gradient(top, #433f43, #777177);',
    '      background-image: -webkit-linear-gradient(top, #433f43, #777177);',
    '      border-bottom: 1px solid #433f43 !important;',
    '      height: 40px;',
    '      text-shadow: 2px 2px 3px rgba(255, 255, 255, 0.1);',
    '  }',
    '  .catalog-tabs-container {',
    '      padding: 6px;',
    '  }',
    '  .catalog-tabs-container .catalog-tabs {',
    '      position: absolute;',
    '      top: 15px;',
    '  }',
    '  .catalog-tabs .catalog-tab {',
    '      display: inline-block;',
    '  }',
    '  .catalog-tabs .catalog-print-preview-tab {',
    '      display: inline-block;',
    '      vertical-align: bottom;',
    '  }',
    '  .catalog-tabs .catalog-print-preview-tab a {',
    '      padding: 6px 12px;',
    '  }',
    '  .catalog-tabs .catalog-tab.supporting-material-tab {',
    '      margin-right: 3px;',
    '  }',
    '  .catalog-tabs .catalog-tab a {',
    '      background-color: #e1e1e1;',
    '      border-radius: 4px 4px 0px 0px;',
    '      color: rgba(0, 0, 0, 0.6);',
    '      padding: 6px 12px;',
    '      font-weight: bold;',
    '      border-color: #433f43;',
    '  }',
    '  .catalog-tabs .catalog-tab.active a {',
    '      color: #000000;',
    '      cursor: default;',
    '      background-color: white;',
    '      text-transform: uppercase;',
    '      border-color: #433f43 #433f43 #ffffff;',
    '  }',
    '  .catalog-tabs .catalog-tab.active a:hover {',
    '      text-decoration: none;',
    '  }',
    '  .catalog-tabbed-content-container {',
    '      padding: 0;',
    '      margin: 20px;',
    '  }',
    '  .catalog-tabbed-content-container .catalog-tabbed-content {',
    '      display: none;',
    '  }',
    '  .catalog-tabbed-content-container .catalog-tabbed-content.active {',
    '      display: inherit;',
    '  }',
    '</style>'
  ].join('\n');

  return {
    restrict: 'AE',
    scope: {
      item: '=item'
    },
    template: [
      css,
      '<div class="catalog-nav">',
      '  <div class="catalog-tabs-container">',
      '    <ul class="catalog-tabs">',
      '      <li class="catalog-tab" ng-class="{ active: isActive(\'preview\') }">',
      '        <a ng-click="changeTab(\'preview\')">Preview</a>',
      '      </li>',
      '      <li class="catalog-tab" ng-class="{ active: isActive(\'profile\') }">',
      '        <a ng-click="changeTab(\'profile\')">Profile</a>',
      '      </li>',
      '      <li class="catalog-tab supporting-material-tab" ng-class="{ active: isActive(\'supportingMaterial\', $index) }" ng-repeat="supportingMaterial in item.supportingMaterials">',
      '        <a ng-click="changeTab(\'supportingMaterial\', $index)">{{supportingMaterial.name}}</a>',
      '      </li>',
      '      <li class="catalog-print-preview-tab">',
      '        <a ng-click="print()">',
      '          <img src="images/print.png"/>',
      '        </a>',
      '      </li>',
      '    </ul>',
      '  </div>',
      '</div>',
      '<ul class="catalog-tabbed-content-container">',
      '  <li class="catalog-tabbed-content preview" ng-class="{ active: isActive(\'preview\') }">',
      '    <div ng-controller="ClientSidePreview">',
      '      <player-control-panel player-settings="session.settings"/>',
      '      <corespring-player player-mode="editor" player-markup="data.item.xhtml" player-item="data.item" player-session="rootModel.session" player-outcomes="outcome">',
      '      </corespring-player>',
      '      <div class="button-holder">',
      '        <button class="btn btn-primary" ng-click="submit()" ng-disabled="!canSubmit()">Submit</button>',
      '        <button class="btn btn-warning" ng-click="resetPreview()">Reset</button>',
      '        <hr/>',
      '        <div id="score">',
      '          <h4>You scored: {{score.summary.percentage}}%</h4>',
      '        </div>',
      '      </div>',
      '    </div>',
      '  </li>',
      '  <li class="catalog-tabbed-content profile" ng-class="{ active: isActive(\'profile\') }">',
      '    <div class="row">',
      '      <div class="attribute">',
      '        <span class="label">{{i18n.ccss.label}}</span>',
      '        <ul class="standards">',
      '          <li ng-repeat="standard in profile.standards">',
      '            <span class="standard">{{standard}}</span>',
      '          </li>',
      '          <li ng-show="!profile.standards || profile.standards.length == 0">',
      '            <span class="standard">{{unassigned}}</span>',
      '          </li>',
      '        </ul>',
      '      </div>',
      '      <div class="attribute times-administered">',
      '        <span class="label">{{i18n.timesAdministered.label}}:</span> {{timesAdministered}}',
      '      </div>',
             // TODO: Display community rating when we've figured that out
      '      <div class="attribute community-rating" ng-show="false">',
      '        <span class="label">{{i18n.communityRating.label}}:</span> {{communityRating}}',
      '      </div>',
      '    </div>',
      '    <hr/>',
      '    <div class="row">',
      '      <div class="attribute description">',
      '        <span class="label">{{i18n.description.label}}:</span> {{taskInfo.description || unassigned}}',
      '      </div>',
      '      <div class="attribute title">',
      '        <span class="label">{{i18n.title.label}}:</span> {{taskInfo.title || unassigned}}',
      '      </div>',
      '    </div>',
      '    <hr/>',
      '    <div class="row">',
      '      <div class="attribute subjects">',
      '        <ul>',
      '          <li class="subject primary">{{taskInfo.subjects.primary.subject || unassigned}}</li>',
      '          <li class="subject related">{{taskInfo.subjects.related.subject || unassigned}}</li>',
      '        </ul>',
      '      </div>',
      '      <div class="attribute blooms-taxonomy">',
      '        <span class="value">{{otherAlignments.bloomsTaxonomy || unassigned}}</span>',
      '        <span class="label">{{i18n.bloomsTaxonomy.label}}</span>',
      '      </div>',
      '      <div class="attribute depth-of-knowledge">',
      '        <span class="label">{{i18n.depthOfKnowledge.label}}</span> {{depthOfKnowledge}}',
      '      </div>',
      '    </div>',
      '    <div class="row">',
      '      <div class="attribute question-types">',
      '        <div class="label">{{i18n.questionTypes.label}}</div>',
      '        <div class="question-type">{{taskInfo.itemType || unassigned}}</div>',
      '      </div>',
      '      <div class="attribute key-skills">',
      '        <div class="label">{{i18n.keySkills.label}}</div>',
      '        <div>{{otherAlignments.keySkills.join(', ') || unassigned}}</div>',
      '      </div>',
      '    </div>',
      '    <hr/>',
      '    <div class="row">',
      '      <div class="attribute license">',
      '        <span class="label">{{i18n.license.label}}</span>',
      '        <img ng-show="licenseTypeUrl" src="{{licenseTypeUrl}}" />',
      '        <div class="unassigned" ng-show="!licenseTypeUrl">{{unassigned}}</div>',
      '      </div>',
      '      <div class="attribute copyright-year">',
      '        <span class="label">{{i18n.copyrightYear.label}}</span>',
      '        <span class="year">{{contributorDetails.copyright.year || unassigned}}</span>',
      '      </div>',
      '    </div>',
      '    <h3>',
      '      <a ng-click="expandAdditionalInformation=!expandAdditionalInformation">',
      '        <i class="fa fa-{{!!expandAditionalInformation ? \'minus\' : \'plus\'}}-square-o" style="margin-right: 6px;"></i>',
      '      </a>',
      '      {{i18n.additionalInformation}}',
      '    </h3>',
      '    <div class="additional-information" ng-show="expandAdditionalInformation">',
      '      <hr/>',
      '      <div class="row">',
      '        <div class="attribute prior-use">',
      '          <div class="label">{{i18n.priorUse.label}}</div>',
      '          <div class="prior-use">{{priorUse || unassigned}}</div>',
      '        </div>',
      '        <div class="attribute reviews-passed">',
      '          <div class="label">{{i18n.reviewsPassed.label}}</div>',
      '          <div class="reviews-passed">{{profile.reviewsPassed.join(', ') || unassigned}}</div>',
      '        </div>',
      '      </div>',
      '      <div class="row">',
      '        <div class="attribute difficulty-level">',
      '          <div class="label">{{i18n.difficultyLevel.label}}</div>',
      '          <div class="difficulty-level">{{profile.difficultyLevel || unassigned}}</div>',
      '        </div>',
      '        <div class="attribute lexile-score">',
      '          <div class="label">{{i18n.lexileScore.label}}</div>',
      '          <div class="lexile-score">{{profile.lexile && profile.lexile + "L" || unassigned}}</div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <hr/>',
      '    <div class="row">',
      '      <div class="attribute item-id">',
      '        <span class="label">{{i18n.itemId.label}}</span>',
      '        <span class="value">{{itemId}}</span>',
      '      </div>',
      '    </div>',
      '  </li>',
      '  <li class="catalog-tabbed-content supporting-material" ng-class="{ active: isActive(\'supportingMaterial\', $index) }" ng-repeat="supportingMaterial in item.supportingMaterials">',
      '    <div style="height: 100%;" ng-show="isMarkup($index)" ng-bind-html-unsafe="getMarkup($index)"/>',
      '    <div style="height: 100%;" ng-show="!isMarkup($index)">',
      '      <iframe ng-src="{{supportingUrl($index)}}" width="100%" height="100%"/>',
      '    </div>',
      '  </li>',
      '</ul>'
    ].join('\n'),
    link: function($scope) {

      $scope.activeTab = 'preview';
      $scope.supportingMaterialIndex = undefined;

      $scope.isActive = function(tab, index) {
        return $scope.activeTab === tab &&
          ($scope.activeTab === 'supportingMaterials', $scope.supportingMaterialIndex === index);
      };

      $scope.changeTab = function(tab, index) {
        if (!$scope.isActive(tab, index)) {
          $scope.activeTab = tab;
          $scope.supportingMaterialIndex = index;
        }
      };

      $scope.print = function() {
        window.alert('Coming soon.');
      };

      function fileIndex(index) {
        return _.findIndex($scope.item.supportingMaterials[index].files, function(file) {
          return file.isMain;
        });
      }

      $scope.isMarkup = function(index) {
        return $scope.item.supportingMaterials[index].files[fileIndex(index)].contentType === 'text/html';
      };

      $scope.getMarkup = function(index) {
        return $scope.item.supportingMaterials[index].files[fileIndex(index)].content;
      };

      $scope.supportingUrl = function(index) {
        function getUrl(supportingMaterials, index) {
          if (supportingMaterials) {
            return supportingMaterials[index].name + "/" + supportingMaterials[index].files[fileIndex(index)].name;
          } else {
            return undefined;
          }
        }

        if ($scope.item) {
          return $sce.trustAsResourceUrl(getUrl($scope.item.supportingMaterials, index));
        } else {
          return undefined;
        }
      };

      $scope.$watch('item', function() {
        if ($scope.item && $scope.item._id) {
          $scope.itemId = $scope.item._id.$oid;
        }
        if ($scope.item.profile) {
          $scope.profile = $scope.item.profile;
          $scope.priorUse = priorUse($scope.profile);

          if ($scope.profile.taskInfo) {
            $scope.taskInfo = $scope.profile.taskInfo;
          }
          if ($scope.profile.contributorDetails) {
            $scope.contributorDetails = $scope.profile.contributorDetails;
          }
        }
      });

      $scope.i18n = {
        additionalInformation: "Additional Information",
        bloomsTaxonomy: { label: "Bloom's" },
        ccss: { label: "CCSS" },
        communityRating: { label: "Community Rating" },
        copyrightYear: { label: "Copyright Year" },
        description: { label: "Description" },
        depthOfKnowledge: { label: "Depth of Knowledge" },
        difficultyLevel: { label: "Difficulty Level" },
        itemId: { label: "Item ID #" },
        keySkills: { label: "Key Skills" },
        lexileScore: { label: "Lexile Score" },
        license: { label: "License" },
        priorUse: { label: "Prior Use" },
        questionTypes: { label: "Question Type(s)" },
        reviewsPassed: { label: "Reviews Passed" },
        timesAdministered: { label: "Times Administered" },
        title: { label: "Title" }
      };

      $scope.unassigned = "Not Assigned";

      $scope.communityRating = 'AVG';
      $scope.timesAdministered = 0;
    }
  };
}]);