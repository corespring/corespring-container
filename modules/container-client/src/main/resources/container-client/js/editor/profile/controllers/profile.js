var controller = function ($scope, $log, ProfileService, DataQueryService) {

  function findSubject(topic, id, callback){
    var local = _.find($scope.queryResults[topic], function(r){ return r.id === id;});
    if(local){

      callback(local);
    } else {

      DataQueryService.findOne(topic, id, function success(data){
        callback({ id: data._id.$oid, text: data.subject });
      });
    }
  }

  $scope.queryResults = {};

  $scope.save = function(){
    ProfileService.save($scope.item.profile, function(savedProfile){
      $scope.item.profile = savedProfile;
    });
  };

  $scope.subjectAsync = function(topic){ 
    return {
      query: function (query) {
        $log.debug("query: ", query);

        DataQueryService.query( topic, query.term, function(result){

          var formatted = _.map(result, function(r){
            return { id: r._id.$oid, text: r.category + ": " + r.subject};
          });

          $scope.queryResults[topic] = formatted;
          query.callback({ results: formatted });
        });
      },
      initSelection: function(element, callback) {
        $log.debug("init selection: ", element, callback);
        var val = $(element).select2('val');
        $log.debug("val: ", val);

        findSubject(topic, val, function(s){
          return callback(s);
        });
      }
    };
  };

  $scope.relatedSubjectAsync = $scope.subjectAsync("relatedSubject");
  $scope.primarySubjectAsync = $scope.subjectAsync("primarySubject");


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


  $scope.$watch("taskInfo.itemType", function (newValue) {
    updateOtherItemType();
  }, true);

  $scope.$watch('item', function(newItem){
    if(newItem){
      $scope.taskInfo = newItem.profile.taskInfo; 
      $log.debug("task info: ", $scope.taskInfo);
    }
  });
  
};

angular.module('corespring-editor.controllers')
  .controller('Profile',
    ['$scope',
    '$log',
    'ProfileService',
    'DataQueryService',
      controller]);
