angular.module('corespring-common.directives')
  .directive('profilePreview', [
    '$sce',
    '$log',
    'DataQueryService',
    'ProfileFormatter',
    'ComponentService',
    function($sce, $log, DataQueryService, ProfileFormatter, ComponentService) {
      return {
        restrict: 'A',
        scope: {
          item: "=ngModel"
        },
        replace: true,
        template: [
          '<div class="profile-body">',
          '  <h2 ng-bind-html="htmlOrNull(item.profile.taskInfo.title)"></h2>',
          '  <div class="round-border-container clearfix">',
          '    <div ng-if="isNonEmptyString(item.profile.taskInfo.description)" class="description">{{item.profile.taskInfo.description}}</div>',
          '    <div class="field">',
          '      <div class="info">',
          '        <div class="label label-info">Primary Subject</div>',
          '      </div>',
          '      <div class="content"><span>{{textOrNA(item.profile.taskInfo.subjects.primary.subject)}}</span></div>',
          '    </div>',
          '    <div class="field">',
          '      <div class="info">',
          '        <div class="label label-info">Grade Level(s)</div>',
          '      </div>',
          '      <div class="content"><span>{{arrayTextOrNA(item.profile.taskInfo.gradeLevel)}}</span></div>',
          '    </div>',
          '    <div ng-show="item.profile.taskInfo.subjects.related.subject" class="field">',
          '      <div class="info">',
          '        <div class="label label-info">Related Subject</div>',
          '      </div>',
          '      <div class="content"><span>{{item.profile.taskInfo.subjects.related.subject}}</span></div>',
          '    </div>',
          '    <div ng-show="isNonEmptyString(getPValueAsString(item.profile.pValue))" class="field">',
          '      <div class="info">',
          '        <div class="label label-info">Difficulty Level</div>',
          '      </div>',
          '      <div class="content"><span>{{getPValueAsString(item.profile.pValue)}}</span></div>',
          '    </div>',
          '    <div class="field">',
          '      <div class="info">',
          '        <div class="label label-info">Item Type</div>',
          '      </div>',
          '      <div class="content"><span>{{arrayTextOrNA(componentTypeLabels)}}</span></div>',
          '    </div>',
          '    <div ng-show="item.profile.standards.length &gt; 0" class="field">',
          '      <div class="info">',
          '        <div class="label label-info">CCSS</div>',
          '      </div>',
          '      <div class="content"><span ng-repeat="standard in item.profile.standards">{{standard.dotNotation}}{{$last ? \'\' : \', \'}}</span></div>',
          '    </div>',
          '    <div ng-show="licenseTypeUrl" class="field">',
          '      <div class="info">',
          '        <div class="label label-info">License</div>',
          '      </div>',
          '      <div class="content"><img ng-src="{{licenseTypeUrl}}" class="license-type"/></div>',
          '    </div>',
          '  </div>',
          '  <div class="borderless-container clearfix">',
          '    <div ng-show="isNonEmptyString(item.profile.otherAlignments.bloomsTaxonomy)" class="field">',
          '      <div class="info">',
          '        <div class="label label-warning">Bloom\'s Taxonomy</div>',
          '      </div>',
          '      <div class="content">{{item.profile.otherAlignments.bloomsTaxonomy}}</div>',
          '    </div>',
          '    <div ng-show="item.profile.demonstratedKnowledge" class="field">',
          '      <div class="info">',
          '        <div class="label label-warning">Demonstrated Knowledge</div>',
          '      </div>',
          '      <div class="content">{{item.profile.demonstratedKnowledge}}</div>',
          '    </div>',
          '    <div ng-show="depthOfKnowledgeLabel" class="field">',
          '      <div class="info">',
          '        <div class="label label-warning">Depth of knowledge</div>',
          '      </div>',
          '      <div class="content">{{depthOfKnowledgeLabel}}</div>',
          '    </div>',
          '    <div ng-show="item.profile.lexile" class="field">',
          '      <div class="info">',
          '        <div class="label label-warning">Lexile Score</div>',
          '      </div>',
          '      <div ng-show="item.profile.lexile" class="content">{{item.profile.lexile }}L</div>',
          '    </div>',
          '    <div ng-show="isNonEmptyStringArray(item.profile.otherAlignments.keySkills)" class="field">',
          '      <div class="info">',
          '        <div class="label label-warning">Key Skills</div>',
          '      </div>',
          '      <div class="content">{{item.profile.otherAlignments.keySkills.join(", ")}}</div>',
          '    </div>',
          '    <div class="field"><img ng-if="copyrightOwnerUrl" ng-src="{{copyrightOwnerUrl}}" alt="{{item.profile.contributorDetails.copyrightOwner}}" title="{{item.profile.contributorDetails.copyrightOwner}}" class="copyright-image"/>',
          '      <div ng-show="item.profile.contributorDetails.copyrightOwner" class="courtesy">This item was made available to CoreSpring users courtesy of {{item.profile.contributorDetails.copyrightOwner}}</div>',
          '    </div>',
          '    <div class="field">',
          '      <div class="more-info-container clearfix"><a ng-click="showMore = !showMore" ng-show="isThereMoreData(item.profile)" class="show-more clearfix">{{showMore ? \'hide info\' : \'more info\'}}</a>',
          '        <div ng-show="showMore" class="fields">',
          '          <div ng-show="item.profile.contributorDetails.copyrightYear" class="field">',
          '            <div class="title">Copyright Year</div>',
          '            <div class="sub-content">{{item.profile.contributorDetails.copyrightYear}}</div>',
          '          </div>',
          '          <div ng-show="item.profile.contributorDetails.copyrightExpirationDate" class="field">',
          '            <div class="title">Copyright Expiration Date</div>',
          '            <div class="sub-content">{{item.profile.contributorDetails.copyrightExpirationDate}}</div>',
          '          </div>',
          '          <div ng-show="isNonEmptyStringArray(item.profile.reviewsPassed)" class="field">',
          '            <div class="title">Reviews Passed</div>',
          '            <div class="sub-content">{{item.profile.reviewsPassed.join(", ")}}</div>',
          '          </div>',
          '          <div ng-show="item.profile.contributorDetails.credentials" class="field">',
          '            <div class="title">Credentials</div>',
          '            <div class="sub-content">{{item.profile.contributorDetails.credentials}}</div>',
          '          </div>',
          '          <div ng-show="item.profile.priorUse" class="field">',
          '            <div class="title">Prior Use</div>',
          '            <div class="sub-content">{{item.profile.priorUse}}</div>',
          '          </div>',
          '          <div ng-show="isNonEmptyStringArray(item.profile.priorGradeLevel)" class="field">',
          '            <div class="title">Prior Use grade Level</div>',
          '            <div class="sub-content">{{item.profile.priorGradeLevel.join(", ")}}</div>',
          '          </div>',
          '          <div ng-show="item.collection.name" class="field">',
          '            <div class="title">Collection</div>',
          '            <div class="sub-content">{{item.collection.name}}</div>',
          '          </div>',
          '          <div ng-show="getUrl(item.profile.contributorDetails.sourceUrl)" class="field">',
          '            <div class="title">Source</div>',
          '            <div class="sub-content"><a href="{{getUrl(item.profile.contributorDetails.sourceUrl)}}" target="_blank">',
          '                <div class="source-url-text">{{getUrl(item.profile.contributorDetails.sourceUrl)}}</div></a></div>',
          '          </div>',
          '        </div>',
          '      </div>',
          '    </div>',
          '  </div>',
          '  <div class="footer">',
          '    <div class="item-id">Item ID: {{item.itemId}}</div>',
          '  </div>',
          '</div>'
        ].join('\n'),
        link: function($scope) {
          $scope.htmlOrNull = function(str) {
            if (!isNonEmptyString(str)) {
              return null;
            }
            return $sce.trustAsHtml(str);
          };

          $scope.textOrNA = function(txt) {
            return txt ? txt : "No information available";
          };

          $scope.arrayTextOrNA = function(arr) {
            if ($scope.isNonEmptyStringArray(arr)) {
              return _.reject(arr, _.isEmpty).join(", ");
            }
            return "No information available";
          };

          $scope.isNonEmptyString = function(str) {
            return !_.isEmpty(str) && _.isString(str);
          };

          $scope.isNonEmptyStringArray = function(arr) {
            return !_.isEmpty(arr) && _.isArray(arr);
          };


          $scope.isThereMoreData = function(profile) {
            return (
              isNonEmptyString(getOrNull(profile, "contributorDetails", "copyrightOwner")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "copyrightYear")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "copyrightExpirationDate")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "credentials")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "sourceUrl")) ||
              isNonEmptyStringArray(getOrNull(profile, "priorGradeLevel")) ||
              isNonEmptyString(getOrNull($scope, "item", "collection", "name")));
          };

          $scope.getUrl = function(src){
            if (!isNonEmptyString(src)){
              return null;
            }
            if (src.indexOf('http://') === -1){
              src = 'http://' + src;
            }

            return src;
          };

          $scope.onComponentsLoaded = function(components) {
            $scope.availableComponents = components;
            applyComponentTypes();
          };

          $scope.onComponentsLoadError = function(err) {
            $log.error('Error loading available components', err);
          };

          if ($scope.item.profile.contributorDetails) {
            $scope.licenseTypeUrl = licenseTypeUrl($scope.item.profile.contributorDetails.licenseType);
          }

          var copyrightOwner = getOrNull($scope.item.profile, "contributorDetails", "copyrightOwner") ||
            getOrNull($scope.item.profile, "contributorDetails", "copyright", "owner");

          if (copyrightOwner) {
            $scope.copyrightOwnerUrl = copyrightOwnerUrl(copyrightOwner);
          }

          applyDepthOfKnowledge();
          applyComponentTypes();
          applyAllReviewsPassed();

          ComponentService.loadAvailableComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);

          DataQueryService.list("depthOfKnowledge", function(result) {
            $scope.depthOfKnowledgeDataProvider = result;
            applyDepthOfKnowledge();
          });

          DataQueryService.list("reviewsPassed", function(result) {
            $scope.reviewsPassedDataProvider = result;
            applyAllReviewsPassed();
          });


          function applyComponentTypes() {
            if (!$scope.item || !$scope.item.components || !$scope.availableComponents) {
              return;
            }

            function justTypes(name, count) {
              return name;
            }

            $scope.componentTypeLabels = ProfileFormatter.componentTypesUsed($scope.item.components, $scope.availableComponents, justTypes);
          }

          function applyDepthOfKnowledge() {
            var depthOfKnowledge = getOrNull($scope, "item", "profile", "otherAlignments", "depthOfKnowledge");

            if (depthOfKnowledge && $scope.depthOfKnowledgeDataProvider) {
              var obj = _.find($scope.depthOfKnowledgeDataProvider, keyMatch(depthOfKnowledge));
              $scope.depthOfKnowledgeLabel = obj ? obj.value : undefined;
            }
          }

          function applyAllReviewsPassed() {
            if ($scope.item && $scope.item.profile && $scope.item.profile.taskInfo && $scope.reviewsPassedDataProvider) {
              var keysToRemove = ['All', 'None', 'Other'];
              var cleaned = _.filter($scope.reviewsPassedDataProvider, function(rp) {
                return !_.contains(keysToRemove, rp.key);
              });
              $scope.allReviewsPassed = ProfileFormatter.allReviewsPassed($scope.item.profile.taskInfo.reviewsPassed, cleaned);
            }
          }

          function imageUrl(folder, name, fallback) {
            return name ? '../../images/' + folder + '/' + name.replace(" ", "-") + ".png" : fallback;
          }

          function licenseTypeUrl(licenseType) {
            return imageUrl('licenseTypes', licenseType);
          }

          function copyrightOwnerUrl(owner) {
            return imageUrl('copyright', owner);
          }

          function isNonEmptyStringArray(arr) {
            return arr && _.isArray(arr) && arr.length > 0 && arr.join('').length > 0;
          }

          function keyMatch(key) {
            return function(keyValue) {
              return keyValue.key === key;
            };
          }

          function getOrNull() {
            if (!arguments) {
              return null;
            }
            var args = Array.prototype.slice.call(arguments);
            if (!args || !args[0] || args.length === 0) {
              return null;
            }
            var object = args.shift();
            do {
              var propName = args.shift();
              object = (propName && (propName in object)) ? object[propName] : null;
            } while (object && args.length > 0);
            return object;
          }

          function isNonEmptyString(str) {
            if (!str) {
              return false;
            }
            if (!_.isString(str) && str.toString() === '') {
              return false;
            }
            return str.length > 0;
          }
        }
      };
    }
  ]);