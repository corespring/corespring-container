(function() {

  angular.module('corespring-editor.controllers')
    .controller('ItemProfile', [
      '$scope',
      'DataQueryService',
      'DesignerService',
      'ItemService',
      'LogFactory',
      'ProfileFormatter',
      'StandardQueryCreator',
      ItemProfileController
    ]);

  function ItemProfileController(
    $scope,
    DataQueryService,
    DesignerService,
    ItemService,
    LogFactory,
    ProfileFormatter,
    StandardQueryCreator) {

    var $log = LogFactory.getLogger('ItemProfileController');

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
      $scope.availableComponents = comps;
      applyComponentTypes();
    });

    function applyComponentTypes() {
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
      $log.debug("profile.standards", newValue);

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

    function Async(topic, formatFunc) {

      var that = this;

      this.elementToVal = function(element) {
        return $(element).select2('val');
      };

      this.query = function(query) {
        $log.debug("query", query);

        DataQueryService.query(topic, query.term, function(result) {
          $scope.queryResults[topic] = result;
          query.callback({
            results: result
          });
        });
      };

      this.formatResult = function(e) {
        return formatFunc(e);
      };

      this.formatSelection = function(e) {
        return formatFunc(e);
      };

      this.initSelection = function(element, callback) {
        $log.debug("init selection:", element, callback);
        var val = that.elementToVal(element);
        $log.debug("val:", val);

        findItemById(topic, val, function(s) {
          return callback(s);
        });
      };
    }

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    $scope.relatedSubjectAsync = new Async("subjects.related", subjectText);
    $scope.primarySubjectAsync = new Async("subjects.primary", subjectText);

    function toListOfValues(listOfObjects) {
      return _.chain(listOfObjects)
        .pluck("value")
        .flatten()
        .value();
    }

    DataQueryService.list("mediaType", function(result) {
      $scope.mediaTypeDataProvider = result;
    });

    DataQueryService.list("bloomsTaxonomy", function(result) {
      $scope.bloomsTaxonomyDataProvider = result;
    });

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

      function keyIsSelected(key) {
        return selectedKeys.indexOf(key) >= 0;
      }

      var selectedKeys = getKeys(function(item) {
        return item.selected;
      });
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
      $log.debug("profile saved");
      $scope.data.saveInProgress = false;
    }

    function onSaveError(err) {
      $log.debug("error saving profile", err);
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

      var items = $scope.item.profile.contributorDetails.additionalCopyrights;
      if (_.isArray(items)) {
        for (var i = items.length - 1; i >= 0; i--) {
          if (itemIsEmpty(items[i])) {
            items.splice(i, 1);
          }
        }
      }
    }

    function onLoadItemSuccess() {
      initSubObjects();

      var profile = $scope.item.profile;
      $scope.taskInfo = profile.taskInfo;
      $scope.otherAlignments = profile.otherAlignments;
      $scope.contributorDetails = profile.contributorDetails;
      $scope.profile = profile;

      $log.debug("task info:", $scope.taskInfo);
      $log.debug("other alignments:", $scope.otherAlignments);
      $log.debug("contributor details:", $scope.contributorDetails);

      applyComponentTypes();

      initReviewsPassedDataProvider();
      updateReviewsPassedOtherSelected();
      updatePriorUseOtherSelected();
      updateCredentialsOtherSelected();
    }

    $scope.$on('itemLoaded', function(ev, item) {
      if (item && item.profile) {
        $scope.item = item;
        onLoadItemSuccess();
      }
    });

    $scope.$emit('loadItem');

  }

  /*#
   # A simple button bar
   # Eg: <button-bar ng-model="selected" button-provider="buttons" key="label"/>
   #
   # @ngModel = the chosen items
   # @buttonProvider an array of choices
   # @key - the property of the buttonProvider objects to use for display, and to store in the ngModel
   #*/
  angular.module('corespring-editor.controllers')
    .directive('tightButtonBar', ['$log',
      function($log) {

        function link($scope, $element, $attr) {
          $scope.selected = function(b) {
            var dataValue = $scope.getValue(b);
            return $scope.ngModel && $scope.ngModel.indexOf(dataValue) >= 0;
          };

          $scope.toggle = function(b) {
            $scope.ngModel = $scope.ngModel || [];
            var dataValue = $scope.getValue(b);
            var index = $scope.ngModel.indexOf(dataValue);
            if (index >= 0) {
              $scope.ngModel.splice(index, 1);
            } else {
              $scope.ngModel.push(dataValue);
            }
          };

          $scope.getValue = function(b) {
            return $scope.key ? b[$scope.key] : b;
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
