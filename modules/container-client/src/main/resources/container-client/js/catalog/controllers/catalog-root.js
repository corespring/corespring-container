angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope',
    '$location',
    '$log',
    'ItemService',
    'ItemIdService',
    'DataQueryService',
    'ComponentService',
    'ProfileFormatter',
    '$sce',
    function(
      $scope,
      $location,
      $log,
      ItemService,
      ItemIdService,
      DataQueryService,
      ComponentService,
      ProfileFormatter,
      $sce) {

      var log = $log.debug.bind($log, '[catalog root] -');

      $scope.unassigned = 'Unassigned';

      $scope.itemId = ItemIdService.itemId();

      var createSupportingMaterialsDropDown = function(item) {
        var groupedSupportingMaterials = _.groupBy(item.supportingMaterials, "materialType");
        $scope.supportingMaterials = [];
        var index = 0;
        var insertSupportingMaterialsForType = function(supMat) {
          $scope.supportingMaterials.push({label: supMat.name, type: "data", index: index});
          index++;
        };
        for (var key in groupedSupportingMaterials) {
          if (key !== "undefined"){
            $scope.supportingMaterials.push({label: key, type: "header"});
          }
          _.each(groupedSupportingMaterials[key], insertSupportingMaterialsForType);
          $scope.supportingMaterials.push({type: "divider"});
        }
        $scope.supportingMaterials = _.initial($scope.supportingMaterials);
      };

      $scope.onItemLoaded = function(item) {

        _.forEach(item.components,function(component){
          var serverLogic = corespring.server.logic(component.componentType);
          if (serverLogic && serverLogic.preprocess){
            serverLogic.preprocess(component);
          }
        });

        $scope.data = {
          item: item
        };
        $scope.item = item;
        $scope.init();
        $scope.hasSupportingMaterials = item.supportingMaterials && item.supportingMaterials.length > 0;
        createSupportingMaterialsDropDown(item);
        $scope.$broadcast('itemLoaded', item);
      };

      $scope.$on("$stateChangeSuccess",function(){
        $scope.$evalAsync(function( scope ) {
          setTimeout(function() {
            /* jshint ignore:start */
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            /* jshint ignore:end */
          },200);
        });
      });

      $scope.onComponentsLoaded = function(components) {
        $scope.availableComponents = components;
        applyComponentTypes();
      };

      $scope.onComponentsLoadError = function(err) {
        $log.error('Error loading available components', err);
      };

      function keyMatch(key) {
        return function(keyValue) {
          return keyValue.key === key;
        };
      }

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
        var depthOfKnowledge = getOrNull($scope,"item","profile","otherAlignments","depthOfKnowledge");

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

      $scope.init = function() {

        var profile = $scope.item.profile || {};

        if (profile.contributorDetails) {
          $scope.licenseTypeUrl = licenseTypeUrl(profile.contributorDetails.licenseType);
        }

        var copyrightOwner = getOrNull(profile,"contributorDetails","copyrightOwner");
        if (copyrightOwner) {
          $scope.copyrightOwnerUrl = copyrightOwnerUrl(copyrightOwner);
        }

        applyDepthOfKnowledge();
        applyComponentTypes();
        applyAllReviewsPassed();
      };

      $scope.getPValueAsString = function (value) {

        var vals = {
          "NO_VALUE": 0,
          "Very Hard": 20,
          "Moderately Hard": 40,
          "Moderate": 60,
          "Easy": 80,
          "Very Easy": 100 };

        var getLabelFromValue = function (numberArray, valueToCheck) {
          for (var x in numberArray) {
            if (valueToCheck <= numberArray[x]) {
              return x === "NO_VALUE" ? "" : x;
            }
          }
        };
        return getLabelFromValue(vals, value);
      };


      function imageUrl(folder, name, fallback) {
        return name ? '../../images/' + folder + '/' + name.replace(" ", "-") + ".png" : fallback;
      }

      function licenseTypeUrl(licenseType) {
        return imageUrl('licenseTypes', licenseType);
      }

      function copyrightOwnerUrl(owner) {
        return imageUrl('copyright', owner);
      }

      $scope.onItemLoadError = function(error) {
        $log.warn("Error loading item", error);
      };

      $scope.$on('$locationChangeSuccess', function() {
        updateNavBindings();
      });

      function updateNavBindings() {
        $scope.urlParams = $location.search();
      }

      function updateLocation(name) {
        log('updateLocation: ', name);
        var update = $location.search()[name] ? undefined : true;
        $location.search(name, update);
      }

      $scope.toggleLeftNav = updateLocation.bind(null, 'hideLeftNav');

      ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
      ComponentService.loadAvailableComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);

      DataQueryService.list("depthOfKnowledge", function(result) {
        $scope.depthOfKnowledgeDataProvider = result;
        applyDepthOfKnowledge();
      });

      DataQueryService.list("reviewsPassed", function(result) {
        $scope.reviewsPassedDataProvider = result;
        applyAllReviewsPassed();
      });

      $scope.textOrNA = function(txt){
        return txt ? txt : "No information available";
      };

      $scope.arrayTextOrNA = function(arr){
        if (arr && _.isArray(arr) && arr.length > 0){
          return arr.join(", ");
        }
        return "No information available";
      };

      $scope.isNonEmptyString = function(str){
        return str && _.isString(str) && str.length > 0;
      };

      function isNonEmptyStringArray(arr){
        return arr && _.isArray(arr) && arr.length > 0 && arr.join('').length > 0;
      };

      $scope.isNonEmptyStringArray = isNonEmptyStringArray;

      $scope.htmlOrNull = function(str){
        if (!isNonEmptyString(str)){
          return null;
        }
        return $sce.trustAsHtml(str);
      };

      $scope.isThereMoreData = function(profile){
        return (
          isNonEmptyString(getOrNull(profile,"contributorDetails","copyrightOwner")) ||
          isNonEmptyString(getOrNull(profile,"contributorDetails","copyrightYear")) ||
          isNonEmptyString(getOrNull(profile,"contributorDetails","copyrightExpirationDate")) ||
          isNonEmptyString(getOrNull(profile,"contributorDetails","credentials")) ||
          isNonEmptyString(getOrNull(profile,"contributorDetails","sourceUrl")) ||
          isNonEmptyStringArray(getOrNull(profile,"priorGradeLevel")) ||
          isNonEmptyString(getOrNull($scope,"item","collection","name"))
          );
      };

      $scope.getUrl = function(src){
        if (!isNonEmptyString(src)){
          return null;
        }


        if (src.indexOf('http://') === -1){
          src = 'http://' + src;
        }

        return $sce.trustAsUrl(src);
      };

      function getOrNull(){
        if (!arguments){
          return null;
        }
        var args = Array.prototype.slice.call(arguments);
        if (!args || !args[0] || args.length === 0){
          return null;
        }
        var object = args.shift();
        do{
          var propName = args.shift();
          object = (propName && (propName in object)) ? object[propName] : null;
        }while(object && args.length > 0 );
        return object;
      }

      function isNonEmptyString(str){
        if (!str) {
          return false;
        }
        if (!_.isString(str) && str.toString() === ''){
          return false;
        }
        return str.length > 0;
      }
    }

  ]);