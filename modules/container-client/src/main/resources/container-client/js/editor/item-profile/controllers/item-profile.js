(function () {

  angular.module('corespring-editor.controllers')
    .controller('ItemProfile', [
      '$log',
      '$scope',
      'DataQueryService',
      'ItemService',
      controller
    ]);

  function controller($log, $scope, DataQueryService, ItemService) {

    var isFormActive = false;

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

    $scope.queryResults = {};

    /**
     * Standards is a tree of objects that we allow the user
     * to select three levels in.
     * TODO Connect to data source & store the selected standards in the item
     */
    $scope.standardsOptions = [
      { name: "A1",
        items: [
          {
            name: "B1",
            items: ["C11", "C12", "C13"]
          }
        ]},
      { name: "A2",
        items: [
          {
            name: "B2",
            items: ["C21", "C22", "C23"]
          }
        ]}
    ];

    $scope.standardAdapter = {
      subjectOption: {},
      categoryOption: {},
      subCategoryOption: {}
    };

    function subjectText(s) {
      return s.category + ": " + s.subject;
    }

    function Async(topic, formatFunc) {

      var that = this;

      this.elementToVal = function (element) {
        return $(element).select2('val');
      };

      this.query = function (query) {
        $log.debug("query: ", query);

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
        $log.debug("init selection: ", element, callback);
        var val = that.elementToVal(element);
        $log.debug("val: ", val);

        findSubject(topic, val, function (s) {
          return callback(s);
        });
      };
    }

    $scope.relatedSubjectAsync = new Async("relatedSubject", subjectText);
    $scope.primarySubjectAsync = new Async("primarySubject", subjectText);

    $scope.$watch("otherItemType", function (n) {
      if (isFormActive) {
        if (n && n !== "") {
          $scope.taskInfo.itemType = $scope.otherItemType;
        }
      }
    }, true);

    function updateOtherItemType() {

      function isRecognisedType() {
        var recognised = _.find($scope.itemTypeValues, function (it) {
          return it === $scope.taskInfo.itemType;
        });
        return recognised !== undefined;
      }

      if ($scope.itemTypeDataProvider && $scope.taskInfo) {

        if (isRecognisedType()) {
          $scope.otherItemType = "";
        } else {
          $scope.otherItemType = $scope.taskInfo.itemType;
        }
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
      $scope.depthOfKnowledgeDataProvider = toListOfValues(result);
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

    $scope.$watch("taskInfo.itemType", function (newValue) {
      if (isFormActive) {
        updateOtherItemType();
      }
    }, true);

    $scope.addCopyrightItem = function () {
      $scope.taskInfo.additionalCopyright.push({});
    };

    $scope.removeCopyrightItem = function () {
      $scope.taskInfo.additionalCopyright.pop();
    };

    $scope.clearCopyrightItems = function () {
      $scope.taskInfo.additionalCopyright.splice(0);
    };

    $scope.needAdditionalCopyrightInformation = 'init';

    $scope.$watch("needAdditionalCopyrightInformation", function (newValue, oldValue) {
      if (isFormActive) {
        $log.debug("needAdditionalCopyrightInformation new: <" + newValue + "> old: <" + oldValue + ">");
        if (oldValue === 'init') {
          return;
        }
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

    function onSaveSuccess (updated) {
      $log.debug("profile saved");
      $scope.data.saveInProgress = false;
    }

    function onSaveError (err) {
      $log.debug("error saving profile", err);
      $scope.data.saveError = err;
      $scope.data.saveInProgress = false;
    }

    function loadItem(itemId){
      isFormActive = false;
      ItemService.load( onLoadItemSuccess, onLoadItemError, itemId);
    }

    function onLoadItemSuccess (item) {
      $scope.data.item = item;
      $scope.taskInfo = $scope.data.item.profile.taskInfo;
      $log.debug("task info: ", $scope.taskInfo);
      if (!$scope.taskInfo.keySkills) {
        $scope.taskInfo.keySkills = [];
      }
      if (!$scope.taskInfo.reviewsPassed) {
        $scope.taskInfo.reviewsPassed = [];
      }
      if (!_.isArray($scope.taskInfo.additionalCopyright)) {
        $scope.taskInfo.additionalCopyright = [];
      }
      $scope.needAdditionalCopyrightInformation =
          $scope.taskInfo.additionalCopyright.length > 0 ? 'yes' : '';

      isFormActive = true;
    }

    function onLoadItemError(err) {
      $log.warn('Error loading profile', err);
    }

    //TODO: We are loading the data at root and here
    //Should we only load data at root?
    loadItem($scope.itemId);

  }

})();