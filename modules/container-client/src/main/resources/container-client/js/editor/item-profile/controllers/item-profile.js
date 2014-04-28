(function () {

  angular.module('corespring-editor.controllers')
    .controller('ItemProfile', [
      '$log',
      '$scope',
      'DataQueryService',
      'ItemService',
      'StandardQueryCreator',
      ItemProfileController
    ]);

  function ItemProfileController($log, $scope, DataQueryService, ItemService, StandardQueryCreator) {

    var isFormActive = false;

    //----------------------------------------------------------------
    // Standards start
    //----------------------------------------------------------------

    /**
     * The standards selection consists of three select boxes and a
     * select2 search & multi select tag field
     * The three selections are filled from the standardsTree
     * The selected values are used as filters for the select2 search field
     */

    $scope.$watch('taskInfo.standards', function (newValue, oldValue) {
      $log.debug("taskInfo.standards", newValue);
    });

    $scope.standardsOptions = [];

    DataQueryService.list("standardsTree", function (result) {
      $scope.standardsOptions = result;
    });

    function createStandardQuery(searchText) {
      return JSON.stringify(
        StandardQueryCreator.createStandardQuery(
          searchText,
          $scope.standardAdapter.subjectOption,
          $scope.standardAdapter.categoryOption,
          $scope.standardAdapter.subCategoryOption));
    }

    $scope.standardAdapter = {
      subjectOption: {},
      categoryOption: {},
      subCategoryOption: {},
      tags: true,
      allowClear: true,
      minimumInputLength: 1,
      placeholder: "Choose a standard",
      id: function (item) {
        $log.debug("standardAdapter id", item._id);
        return item._id.$oid;
      },
      query: function (query) {
        $log.debug("standardAdapter query", query);
        DataQueryService.query("standards", createStandardQuery(query.term), function (results) {
          query.callback({results: results});
        });
      }
    };

    $scope.standardAdapter.valueSetter = function (newItem) {
      $log.debug("standardAdapter.valueSetter", newItem);
      $scope.taskInfo.standards.push(newItem);
    };

    $scope.standardAdapter.formatSelection = function (standard) {
      setTimeout(function () {
        $(".standard-adapter-result").tooltip();
      }, 500);
      return "<span class='standard-adapter-result' data-title='" + standard.standard + "'>" + standard.dotNotation + "</span>";
    };

    $scope.standardAdapter.formatResult = function (standard) {
      var markup = "<blockquote>";
      markup += '<p>' + standard.standard + '</p>';
      markup += '<small>' + standard.dotNotation + ', ' + standard.subject + ', ' + standard.subCategory + '</small>';
      markup += '<small>' + standard.category + '</small>';
      markup += '</blockquote>';
      return markup;
    };


    //----------------------------------------------------------------
    // Standards end
    //----------------------------------------------------------------

    $scope.queryResults = {};

    function findSubject(topic, id, callback) {
      var local = _.find($scope.queryResults[topic], function (r) {
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

      this.elementToVal = function (element) {
        return $(element).select2('val');
      };

      this.query = function (query) {
        $log.debug("query", query);

        DataQueryService.query(topic, query.term, function (result) {
          $scope.queryResults[topic] = result;
          query.callback({
            results: result
          });
        });
      };

      this.formatResult = function (e) {
        return formatFunc(e);
      };

      this.formatSelection = function (e) {
        return formatFunc(e);
      };

      this.initSelection = function (element, callback) {

        $log.debug("init selection:", element, callback);
        var val = that.elementToVal(element);
        $log.debug("val:", val);

        findSubject(topic, val, function (s) {
          return callback(s);
        });
      };
    }

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    $scope.relatedSubjectAsync = new Async("subjects.related", subjectText);
    $scope.primarySubjectAsync = new Async("subjects.primary", subjectText);

    $scope.$watch("otherItemType", function (n) {
      if (isFormActive) {
        if (n && n !== "") {
          $scope.taskInfo.itemType = n;
        }
      }
    }, true);

    $scope.$watch("taskInfo.itemType", function (newValue) {
      if (isFormActive) {
        updateOtherItemType();
      }
    }, true);

    function updateOtherItemType() {

      function isRecognisedType() {
        return _.some($scope.itemTypeValues, function (it) {
          return it === $scope.taskInfo.itemType;
        });
      }

      if ($scope.itemTypeValues && $scope.taskInfo) {
        $scope.otherItemType = isRecognisedType() ? "" : $scope.taskInfo.itemType;
      }
    }

    function toListOfValues(listOfObjects) {
      return _.chain(listOfObjects)
        .pluck("value")
        .flatten()
        .value();
    }

    DataQueryService.list("bloomsTaxonomy", function (result) {
      $scope.bloomsTaxonomyDataProvider = toListOfValues(result);
    });

    $scope.copyrightExpirationYearDataProvider = _.range(new Date().getFullYear(), 2020).concat(['Never']);

    $scope.copyrightYearDataProvider = _.range(new Date().getFullYear(), 1939, -1);

    DataQueryService.list("credentials", function (result) {
      $scope.credentialsDataProvider = toListOfValues(result);
    });

    DataQueryService.list("depthOfKnowledge", function (result) {
      $scope.depthOfKnowledgeDataProvider = result;
    });

    DataQueryService.list("keySkills", function (result) {
      $scope.keySkillsDataProvider = _.map(result, function (k) {
        return {header: k.key, list: k.value};
      });
    });

    DataQueryService.list("licenseTypes", function (result) {
      $scope.licenseTypeDataProvider = toListOfValues(result);
    });

    DataQueryService.list("priorUses", function (result) {
      $scope.priorUseDataProvider = toListOfValues(result);
    });

    DataQueryService.list("reviewsPassed", function (result) {
      $scope.reviewsPassedDataProvider = result;
      initReviewsPassedDataProvider();
    });

    function initReviewsPassedDataProvider() {
      if ($scope.reviewsPassedDataProvider && $scope.taskInfo && _.isArray($scope.taskInfo.reviewsPassed)) {

        _.each($scope.reviewsPassedDataProvider, function (item) {
          var selected = $scope.taskInfo.reviewsPassed.indexOf(item.key) >= 0;
          if (selected !== item.selected) {
            item.selected = selected;
          }
        });
      }
    }

    $scope.onChangeReviewsPassed = function (changedKey) {
      function getKeys(predicate) {
        return _.chain($scope.reviewsPassedDataProvider)
          .filter(predicate)
          .pluck("key")
          .value();
      }

      function keyIsSelected(key) {
        return selectedKeys.indexOf(key) >= 0;
      }

      var selectedKeys = getKeys(function (item) {
        return item.selected;
      });
      if (changedKey === "None") {
        if (keyIsSelected(changedKey)) {
          selectedKeys = ["None"];
        }
      } else if (changedKey === "All") {
        if (keyIsSelected(changedKey)) {
          selectedKeys = getKeys(function (item) {
            return item.key !== "None" && item.key !== "Other";
          });
        }
      } else {
        if (keyIsSelected(changedKey)) {
          selectedKeys = _.without(selectedKeys, "None");
        } else {
          selectedKeys = _.without(selectedKeys, "All");
        }
      }
      $scope.taskInfo.reviewsPassed = selectedKeys;
      initReviewsPassedDataProvider();
    };

    $scope.$watch('taskInfo.reviewsPassed', function () {
      var otherSelected = _.some($scope.reviewsPassedDataProvider, function (item) {
        return item.selected && item.key === 'Other';
      });
      if($scope.isOtherSelected && !otherSelected){
        $scope.taskInfo.otherReviewsPassed = '';
      }
      $scope.isOtherSelected = otherSelected;
    });

    $scope.getLicenseTypeUrl = function (licenseType) {
      return licenseType ? "/assets/images/licenseTypes/" + licenseType.replace(" ", "-") + ".png" : undefined;
    };

    $scope.getKeySkillsSummary = function (keySkills) {
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

    $scope.addCopyrightItem = function () {
      $scope.contributorDetails.copyright.additional.push({});
    };

    $scope.removeCopyrightItem = function () { //TODO Add ui to trigger removal of specific item
      $scope.contributorDetails.copyright.additional.pop();
    };

    $scope.clearCopyrightItems = function () {
      $scope.contributorDetails.copyright.additional.splice(0);
    };

    $scope.needAdditionalCopyrightInformation = '';

    $scope.$watch("needAdditionalCopyrightInformation", function (newValue, oldValue) {
      if (isFormActive) {
        if (newValue === oldValue) {
          return;
        }
        if (newValue === 'yes') {
          $scope.addCopyrightItem();
        } else {
          $scope.clearCopyrightItems(); //TODO Add "are you sure" modal
        }
      }
    });

    $scope.$on('save-data', function () {
      $scope.save();
    });

    $scope.save = function () {

      ItemService.save({
          profile: $scope.data.item.profile
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

    function loadItem(itemId) {
      isFormActive = false;
      ItemService.load(onLoadItemSuccess, onLoadItemError, itemId);
    }

    function initSubObjects() {
      var profile = $scope.data.item.profile;

      if (!(profile.taskInfo)) {
        profile.taskInfo = {};
      }

      if (!_.isArray(profile.taskInfo.reviewsPassed)) {
        profile.taskInfo.reviewsPassed = [];
      }
      if (!_.isArray(profile.taskInfo.standards)) {
        profile.taskInfo.standards = [];
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

      if (!(profile.contributorDetails.licenseTyp)) {
        profile.contributorDetails.licenseType = "CC BY";
      }

      if (!(profile.contributorDetails.copyright)) {
        profile.contributorDetails.copyright = {};
      }

      if (!(profile.contributorDetails.copyright.year)) {
        profile.contributorDetails.copyright.year = new Date().getFullYear();
      }

      if (!_.isArray(profile.contributorDetails.copyright.additional)) {
        profile.contributorDetails.copyright.additional = [];
      }

      removeEmptyAdditionalCopyrightItems();
    }

    function removeEmptyAdditionalCopyrightItems() {

      function itemIsEmpty(item) {
        return !item || _.every(item, function (val) {
          return !val;
        });
      }

      var items = $scope.data.item.profile.contributorDetails.copyright.additional;
      if (_.isArray(items)) {
        for (var i = items.length - 1; i >= 0; i--) {
          if (itemIsEmpty(items[i])) {
            items.splice(i, 1);
          }
        }
      }
    }

    function getComponentTypes(components) {
      var result = _.chain(components)
        .countBy("title")
        .map(function (value, key) {
          return key + "(" + value + ")";
        })
        .sort()
        .value();
      return result;
    }

    function onLoadItemSuccess(item) {
      $scope.data.item = item;
      initSubObjects();

      var profile = $scope.data.item.profile;
      $scope.taskInfo = profile.taskInfo;
      $scope.otherAlignments = profile.otherAlignments;
      $scope.contributorDetails = profile.contributorDetails;
      $scope.profile = profile;

      $log.debug("task info:", $scope.taskInfo);
      $log.debug("other alignments:", $scope.otherAlignments);
      $log.debug("contributor details:", $scope.contributorDetails);

      $scope.componentTypes = getComponentTypes($scope.data.item.components);

      $scope.needAdditionalCopyrightInformation =
          $scope.contributorDetails.copyright.additional.length > 0 ? 'yes' : '';

      initReviewsPassedDataProvider();

      isFormActive = true;
    }

    function onLoadItemError(err) {
      $log.warn('Error loading profile', err);
    }

    //TODO: We are loading the data at root and here
    //Should we only load data at root?
    loadItem($scope.itemId);

  }

})
();