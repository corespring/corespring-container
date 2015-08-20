angular.module('corespring-common.directives')
  .directive('profilePreview', [
    '$sce',
    '$log',
    'DataQueryService',
    'ProfileFormatter',
    'ComponentService',
    'STATIC_PATHS',
    function($sce, $log, DataQueryService, ProfileFormatter, ComponentService, STATIC_PATHS) {
      var assetsPath = STATIC_PATHS.assets;

      return {
        restrict: 'A',
        scope: {
          item: "=ngModel"
        },
        replace: true,
        templateUrl: "/common/directives/profile-preview.html",
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

          $scope.subjectString = function(subject) {
            return $scope.textOrNA(ProfileFormatter.subjectText(subject));
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
              isNonEmptyString(getOrNull(profile, "contributorDetails", "contributor")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "copyrightYear")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "copyrightExpirationDate")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "credentials")) ||
              isNonEmptyString(getOrNull(profile, "contributorDetails", "sourceUrl")) ||
              isNonEmptyStringArray(getOrNull(profile, "priorGradeLevel")) ||
              isNonEmptyString(getOrNull($scope, "item", "collection", "name")));
          };

          $scope.getUrl = function(src) {
            if (!isNonEmptyString(src)) {
              return null;
            }
            if (src.indexOf('http://') === -1){
              src = 'http://' + src;
            }

            return src;
          };

          $scope.getDisplayUrl = function(src) {
            var arr = ['http://', 'https://'];
            var url = $scope.getUrl(src);
            if (url) {
              for(var i = 0, len = arr.length; i < len; i++) {
                url = url.replace(new RegExp("^" + arr[i]), '');
              }
            }
            return url;
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
            return name ? assetsPath + '/' + folder + '/' + name.replace(" ", "-") + ".png" : fallback;
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