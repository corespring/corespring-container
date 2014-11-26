(function() {

  angular.module('corespring-editor.controllers')
    .controller('ProfileController', [
      '$scope',
      'DataQueryService',
      'DesignerService',
      'ItemService',
      'LogFactory',
      'ProfileFormatter',
      'StandardQueryCreator',
      ProfileController
    ]);

  function ProfileController(
    $scope,
    DataQueryService,
    DesignerService,
    ItemService,
    LogFactory,
    ProfileFormatter,
    StandardQueryCreator) {

    var $log = LogFactory.getLogger('ProfileController');

    //----------------------------------------------------------------
    // Standards start
    //----------------------------------------------------------------

    /**
     * The standards selection consists of three select boxes and a
     * select2 search & multi select tag field
     * The three selections are filled from the standardsTree
     * The selected values are used as filters for the select2 search field
     */

    $scope.standardsOptions = [];

    DataQueryService.list("standardsTree", function(result) {
      $scope.standardsOptions = result;
    });

    DesignerService.loadAvailableUiComponents(function(comps) {
      $scope.availableComponents = [].concat(comps.interactions).concat(comps.widgets);
      initComponentTypesUsed();
    });

    function initComponentTypesUsed() {
      if (!$scope.item || !$scope.item.components || !$scope.availableComponents) {
        return;
      }
      $scope.componentTypes = ProfileFormatter.componentTypesUsed($scope.item.components, $scope.availableComponents);
    }

    function createStandardQuery(searchText) {
      return JSON.stringify(
        StandardQueryCreator.createStandardQuery(
          searchText,
          $scope.standardsAdapter.subjectOption,
          $scope.standardsAdapter.categoryOption,
          $scope.standardsAdapter.subCategoryOption));
    }

    function containsLiteracyStandard(standards) {
      return _.find(standards, function(item) {
        return item && item.subject && item.subject.toLowerCase().indexOf("literacy") >= 0;
      });
    }

    $scope.$watch('profile.standards', function(newValue, oldValue) {
      $log.log("profile.standards", newValue);

      $scope.isLiteracyStandardSelected = containsLiteracyStandard(newValue);
    });

    $scope.standardsAdapter = {
      subjectOption: {},
      categoryOption: {},
      subCategoryOption: {},
      tags: [],
      allowClear: true,
      minimumInputLength: 1,
      placeholder: "Begin by typing a standard or skill.",
      formatResultCssClass: function(object) {
        return "select2-item-profile-standard-adapter-drop-down-item";
      },
      id: function(item) {
        return item.id;
      },
      query: function(query) {
        DataQueryService.query("standards", createStandardQuery(query.term), function(results) {
          query.callback({
            results: results
          });
        });
      },
      initSelection: function(element, callback) {
        var val = $(element).val();
        var ids = val.split(',');
        var results = [];
        ids.forEach(function(id) {
          findItemById("standards", id, function(item) {
            results.push(item);
            if (results.length === ids.length) {
              callback(results);
            }
          });
        });
      },
      formatSelection: function(standard) {
        setTimeout(function() {
          $(".standard-adapter-result").tooltip();
        }, 500);
        return "<span class='standard-adapter-result' data-title='" + standard.standard + "'>" + standard.dotNotation + "</span>";
      },
      formatResult: function(standard) {
        return "<blockquote>" +
          '<p>' + standard.standard + '</p>' +
          '<small>' + standard.dotNotation + ', ' + standard.subject + ', ' + standard.subCategory + '</small>' +
          '<small>' + standard.category + '</small>' +
          '</blockquote>';
      }
    };


    //----------------------------------------------------------------
    // Standards end
    //----------------------------------------------------------------

    $scope.queryResults = {};

    /**
     * Return data from DataQueryService or local cache
     * @param topic
     * @param id
     * @param callback
     */
    function findItemById(topic, id, callback) {

      var local = _.find($scope.queryResults[topic], function(r) {
        return r.id === id;
      });
      if (local) {
        callback(local);
      } else {
        DataQueryService.findOne(topic, id, function success(data) {
          callback(data);
        });
      }
    }

    function queryAndCache(topic, query){
      DataQueryService.query(topic, query.term, function(result) {
        $scope.queryResults[topic] = result;
        query.callback({
          results: result
        });
      });
    }

    /**
     * Adapter for select2 fields
     * @param topic
     * @param formatFunc
     * @constructor
     */
    function Select2Adapter(topic, formatFunc) {

      var that = this;

      this.elementToVal = function(element) {
        return $(element).select2('val');
      };

      this.query = function(query) {
        $log.log("query", query);
        queryAndCache(topic, query);
      };

      this.formatResult = function(e) {
        return formatFunc(e);
      };

      this.formatSelection = function(e) {
        return formatFunc(e);
      };

      this.initSelection = function(element, callback) {
        $log.log("init selection:", element, callback);
        var val = that.elementToVal(element);
        $log.log("val:", val);

        findItemById(topic, val, function(s) {
          return callback(s);
        });
      };
    }

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    $scope.relatedSubjectSelect2Adapter = new Select2Adapter("subjects.related", subjectText);
    $scope.primarySubjectSelect2Adapter = new Select2Adapter("subjects.primary", subjectText);

    DataQueryService.list("mediaType", function(result) {
      $scope.mediaTypeDataProvider = result;
    });

    DataQueryService.list("bloomsTaxonomy", function(result) {
      $scope.bloomsTaxonomyDataProvider = result;
    });

    DataQueryService.list("gradeLevels", function(result) {
      $scope.gradeLevelDataProvider = result;
    });

    /**
     * Return an array of consecutive numbers
     * @param fromYear
     * @param toYear
     * @returns {*}
     */
    function years(fromYear, toYear){
      var direction = fromYear > toYear ? -1 : 1;
      return _.range( fromYear, toYear, direction).map(function(year){
        return year.toString();
      });
    }

    $scope.copyrightExpirationYearDataProvider = years(new Date().getFullYear(), new Date().getFullYear() + 20).concat(['Never']);

    $scope.copyrightYearDataProvider = years(new Date().getFullYear(), 1939);

    DataQueryService.list("credentials", function(result) {
      $scope.credentialsDataProvider = result;
      updateCredentialsOtherSelected();
    });

    $scope.$watch('contributorDetails.credentials', function() {
      updateCredentialsOtherSelected();
    });

    function updateCredentialsOtherSelected() {
      var otherSelected = $scope.contributorDetails && $scope.contributorDetails.credentials === 'Other';
      if ($scope.isCredentialsOtherSelected && !otherSelected) {
        $scope.contributorDetails.credentialsOther = '';
      }
      $scope.isCredentialsOtherSelected = otherSelected;
    }


    DataQueryService.list("depthOfKnowledge", function(result) {
      $scope.depthOfKnowledgeDataProvider = result;
    });

    DataQueryService.list("keySkills", function(result) {
      $scope.keySkillsDataProvider = _.map(result, function(k) {
        return {
          header: k.key,
          list: k.value
        };
      });
    });

    DataQueryService.list("licenseTypes", function(result) {
      $scope.licenseTypeDataProvider = result;
    });

    DataQueryService.list("priorUses", function(result) {
      $scope.priorUseDataProvider = result;
      updatePriorUseOtherSelected();
    });

    $scope.$watch('profile.priorUse', function() {
      updatePriorUseOtherSelected();
    });

    function updatePriorUseOtherSelected() {
      var otherSelected = $scope.profile && $scope.profile.priorUse === 'Other';
      if ($scope.isPriorUseOtherSelected && !otherSelected) {
        $scope.profile.priorUseOther = '';
      }
      $scope.isPriorUseOtherSelected = otherSelected;
    }

    DataQueryService.list("reviewsPassed", function(result) {
      $scope.reviewsPassedDataProvider = result;
      initReviewsPassedDataProvider();
      updateReviewsPassedOtherSelected();
    });

    function initReviewsPassedDataProvider() {
      if ($scope.reviewsPassedDataProvider && $scope.profile && _.isArray($scope.profile.reviewsPassed)) {

        _.each($scope.reviewsPassedDataProvider, function(item) {
          var selected = $scope.profile.reviewsPassed.indexOf(item.key) >= 0;
          if (selected !== item.selected) {
            item.selected = selected;
          }
        });
      }
    }

    $scope.onChangeReviewsPassed = function(changedKey) {
      function getKeys(predicate) {
        return _.chain($scope.reviewsPassedDataProvider)
          .filter(predicate)
          .pluck("key")
          .value();
      }

      var selectedKeys = getKeys(function(item) {
        return item.selected;
      });

      function keyIsSelected(key) {
        return selectedKeys.indexOf(key) >= 0;
      }

      if (changedKey === "None") {
        if (keyIsSelected(changedKey)) {
          selectedKeys = ["None"];
        }
      } else if (changedKey === "All") {
        if (keyIsSelected(changedKey)) {
          var isOtherSelected = keyIsSelected("Other");
          selectedKeys = getKeys(function(item) {
            return item.key !== "None" && (item.key !== "Other" || isOtherSelected);
          });
        }
      } else {
        if (keyIsSelected(changedKey)) {
          selectedKeys = _.without(selectedKeys, "None");
        } else {
          selectedKeys = _.without(selectedKeys, "All");
        }
      }
      $scope.profile.reviewsPassed = selectedKeys;
      initReviewsPassedDataProvider();
    };

    $scope.$watch('profile.reviewsPassed', function() {
      updateReviewsPassedOtherSelected();
    });

    function updateReviewsPassedOtherSelected() {
      var otherSelected = false;
      if ($scope.reviewsPassedDataProvider) {
        otherSelected = _.some($scope.reviewsPassedDataProvider, function(item) {
          return item.selected && item.key === 'Other';
        });
      }
      if ($scope.isReviewsPassedOtherSelected && !otherSelected && $scope.profile) {
        $scope.profile.reviewsPassedOther = '';
      }
      $scope.isReviewsPassedOtherSelected = otherSelected;
    }

    $scope.getLicenseTypeUrl = function(licenseType) {
      return licenseType ? "/assets/images/licenseTypes/" + licenseType.replace(" ", "-") + ".png" : undefined;
    };

    $scope.getKeySkillsSummary = function(keySkills) {
      var count = "No";
      var skills = "Skills";

      if (keySkills) {

        if (keySkills.length > 0) {
          count = keySkills.length;
        }

        if (keySkills.length === 1) {
          skills = "Skill";
        }
      }
      return count + " Key " + skills + " selected";
    };

    $scope.$on('save-data', function() {
      $scope.save();
    });

    $scope.save = function() {

      ItemService.save({
          profile: $scope.profile
        },
        onSaveSuccess,
        onSaveError,
        $scope.itemId);
      $scope.data.saveInProgress = true;
    };

    function onSaveSuccess(updated) {
      $log.log("profile saved");
      $scope.data.saveInProgress = false;
    }

    function onSaveError(err) {
      $log.log("error saving profile", err);
      $scope.data.saveError = err;
      $scope.data.saveInProgress = false;
    }

    function initSubObjects() {
      var profile = $scope.item.profile;

      if (!(profile.taskInfo)) {
        profile.taskInfo = {};
      }
      if (!_.isArray(profile.reviewsPassed)) {
        profile.reviewsPassed = [];
      }
      if (!_.isArray(profile.standards)) {
        profile.standards = [];
      }
      if (!(profile.otherAlignments)) {
        profile.otherAlignments = {};
      }
      if (!_.isArray(profile.otherAlignments.keySkills)) {
        profile.otherAlignments.keySkills = [];
      }
      if (!(profile.contributorDetails)) {
        profile.contributorDetails = {};
      }

      if (!(profile.contributorDetails.licenseType)) {
        profile.contributorDetails.licenseType = "CC BY";
      }

      if (!(profile.contributorDetails.copyrightYear)) {
        profile.contributorDetails.copyrightYear = (new Date().getFullYear()).toString();
      }

      if (!_.isArray(profile.contributorDetails.additionalCopyrights)) {
        profile.contributorDetails.additionalCopyrights = [];
      }

      removeEmptyAdditionalCopyrightItems();
    }

    function removeEmptyAdditionalCopyrightItems() {

      function itemIsEmpty(item) {
        return !item || _.every(item, function(val) {
          return !val;
        });
      }

      _.remove($scope.item.profile.contributorDetails.additionalCopyrights, itemIsEmpty);
    }

    function onLoadItemSuccess() {
      initSubObjects();

      var profile = $scope.item.profile;
      $scope.taskInfo = profile.taskInfo;
      $scope.otherAlignments = profile.otherAlignments;
      $scope.contributorDetails = profile.contributorDetails;
      $scope.profile = profile;

      $log.log("task info:", $scope.taskInfo);
      $log.log("other alignments:", $scope.otherAlignments);
      $log.log("contributor details:", $scope.contributorDetails);

      initComponentTypesUsed();
      initReviewsPassedDataProvider();
      updateReviewsPassedOtherSelected();
      updatePriorUseOtherSelected();
      updateCredentialsOtherSelected();

      function throttle(fn){
        return _.throttle(fn, 500, {trailing: true, leading: false});
      }

      var watchNestedProperties;
      $scope.$watch('item.profile', throttle(function(oldValue, newValue){
        $log.log('old', oldValue);
        ItemService.fineGrainedSave({'profile': $scope.item.profile}, function(result){
          $log.log("fineGrainedSave callback", result);
        });
      }), watchNestedProperties = true);
    }

    $log.log("loading item for profile");
    ItemService.load(function(item){
      $log.log('item loading success hasItem:' + (!!item) + " hasProfile:" + (!!item && !!item.profile));
      if (item && item.profile) {
        $scope.item = item;
        onLoadItemSuccess();
      }
    },function(){
      $log.error('error loading item');
    });

  }

  /*#
   # A simple button bar
   # Eg: <tight-button-bar ng-model="selected" button-provider="buttons" key="label"/>
   #
   # @ngModel = the chosen items
   # @buttonProvider an array of choices
   # @key - the property of the buttonProvider objects to use for display, and to store in the ngModel
   #*/
  angular.module('corespring-editor.controllers')
    .directive('tightButtonBar', ['$log',
      function($log) {

        function link($scope, $element, $attr) {

          $scope.getValue = function(b) {
            return $scope.key ? b[$scope.key] : b;
          };

          $scope.selected = function(b) {
            return _.contains($scope.ngModel, $scope.getValue(b));
          };

          $scope.toggle = function(b) {
            $scope.ngModel = $scope.ngModel || [];
            var dataValue = $scope.getValue(b);
            if(_.contains(dataValue)){
              _.pull($scope.ngModel, dataValue);
            } else {
              $scope.ngModel.push(dataValue);
            }
          };

        }

        return {
          restrict: 'E',
          link: link,
          replace: true,
          scope: {
            buttonProvider: '=',
            ngModel: '=',
            key: '@'
          },
          template: [
            '<div class="tight-button-bar">',
            '  <div class="btn-group">',
            '    <button',
            '     ng-repeat="b in buttonProvider"',
            '     type="button"',
            '     ng-click="toggle(b)"',
            '     onmouseout="this.blur()"',
            '     ng-class="{ active: selected(b)}"',
            '     class="btn btn-default">',
            '     {{getValue(b)}}',
            '   </button>',
            ' </div>',
            '</div>'
          ].join("\n")
        };
      }
    ]);

})();
