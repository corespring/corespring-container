var controller = function($scope, $log, ItemService, DataQueryService) {

  function findSubject(topic, id, callback) {
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

  $scope.queryResults = {};

  $scope.$on('save-data', function() {
    $scope.save();
  });

  $scope.save = function() {
    ItemService.save({
      profile: $scope.item.profile
    }, function(savedProfile) {
      $scope.item.profile = savedProfile;
      $scope.saveInProgress = false;
    });
  };

  function subjectText(s) {
    return s.category + ": " + s.subject;
  }

  function Async(topic) {

    var that = this;

    this.elementToVal = function(element) {
      return $(element).select2('val');
    };

    this.query = function(query) {
      $log.debug("query: ", query);

      DataQueryService.query(topic, query.term, function(result) {
        $scope.queryResults[topic] = result;
        query.callback({
          results: result
        });
      });
    };

    this.formatResult = function(e) {
      return subjectText(e);
    };

    this.formatSelection = function(e) {
      return subjectText(e);
    };

    this.initSelection = function(element, callback) {
      $log.debug("init selection: ", element, callback);
      var val = that.elementToVal(element);
      $log.debug("val: ", val);

      findSubject(topic, val, function(s) {
        return callback(s);
      });
    };
  }

  $scope.relatedSubjectAsync = new Async("relatedSubject");
  $scope.primarySubjectAsync = new Async("primarySubject");


  $scope.$watch("otherItemType", function(n) {
    if (n && n !== "") {
      $scope.taskInfo.itemType = $scope.otherItemType;
    }
  }, true);

  function updateOtherItemType() {

    function isRecognisedType() {
      var recognised = _.find($scope.itemTypeValues, function(it) {
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

  $scope.save = function() {
    ItemService.save({
        profile: $scope.data.item.profile
      },
      $scope.onSaveSuccess,
      $scope.onSaveError,
      $scope.itemId);
    $scope.data.saveInProgress = true;
  };

  $scope.onSaveSuccess = function(updated) {
    $log.debug("profile saved");
    $scope.data.saveInProgress = false;
  };

  $scope.onSaveError = function(err) {
    $log.debug("error saving profile", err);
    $scope.data.saveError = err;
  };

  $scope.$watch("taskInfo.itemType", function(newValue) {
    updateOtherItemType();
  }, true);

  //TODO: We are loading the data at root and here
  //Should we only load data at root?
  ItemService.load(function(item) {
      $scope.data.item = item;
      $scope.taskInfo = $scope.data.item.profile.taskInfo;
      $log.debug("task info: ", $scope.taskInfo);
    },
    function error(err) {
      $log.warn('Error loading profile', err);
    },
    $scope.itemId);

};

angular.module('corespring-editor.controllers')
  .controller('ItemProfile', ['$scope',
    '$log',
    'ItemService',
    'DataQueryService',
    controller
  ]);