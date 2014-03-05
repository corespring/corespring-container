var controller = function ($scope, $log, ProfileService, DataQueryService) {

  function findSubject(topic, id, callback){
    var local = _.find($scope.queryResults[topic], function(r){ return r.id === id;});
    if(local){
      callback(local);
    } else {
      DataQueryService.findOne(topic, id, function success(data){
        callback({ id: data.id, text: subjectText(data)} );
      });
    }
  }

  $scope.queryResults = {};

  $scope.save = function(){
    ProfileService.save($scope.item.profile, function(savedProfile){
      $scope.item.profile = savedProfile;
    });
  };

  function subjectText(s) {
    return s.category + ": " + s.subject;
  }

  function Async(topic){

    var that = this;
    
    this.elementToVal = function (element){
      return $(element).select2('val');
    };

    this.query = function (query) {
      $log.debug("query: ", query);

      DataQueryService.query( topic, query.term, function(result){

        var formatted = _.map(result, function(r){
          return { id: r.id, text: subjectText(r) };
        });

        $scope.queryResults[topic] = formatted;
        query.callback({ results: formatted });
      });
    };


    this.initSelection = function(element, callback) {
      $log.debug("init selection: ", element, callback);
      var val = that.elementToVal(element); 
      $log.debug("val: ", val);

      findSubject(topic, val, function(s){
        return callback(s);
      });
    };
  }

  $scope.relatedSubjectAsync = new Async("relatedSubject");
  $scope.primarySubjectAsync = new Async("primarySubject");


 $scope.$watch("otherItemType",  function (n) {
    if(n && n !== ""){
      $scope.taskInfo.itemType = $scope.otherItemType;
    }
  }, true);

  function updateOtherItemType(){

    function isRecognisedType(){
      var recognised = _.find($scope.itemTypeValues, function(it){
        return it === $scope.taskInfo.itemType;
      });
      return recognised  !== undefined;
    }

    if($scope.itemTypeDataProvider && $scope.taskInfo){
      
      if(isRecognisedType()){
        $scope.otherItemType = "";
      } else {
        $scope.otherItemType = $scope.taskInfo.itemType;
      }
    }
  }

  $scope.save = function(){
    ProfileService.save($scope.itemId, $scope.profile, $scope.onSaveSuccess, $scope.onSaveError);
  };

  $scope.onSaveSuccess = function(updated){
    $log.debug("profile saved");
  };

  $scope.onSaveError = function(err){
    $log.debug("error saving profile", err);
  };

  $scope.$watch("taskInfo.itemType", function (newValue) {
    updateOtherItemType();
  }, true);

  ProfileService.load($scope.itemId, function(profile){
      $scope.profile = profile;
      $scope.taskInfo = profile.taskInfo; 
      $log.debug("task info: ", $scope.taskInfo);
  },
  function error(err){
    $log.warn('Error loading profile', err);
  });
  
};

angular.module('corespring-editor.controllers')
  .controller('Profile',
    ['$scope',
    '$log',
    'ProfileService',
    'DataQueryService',
      controller]);
