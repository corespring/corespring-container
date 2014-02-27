var controller = function ($scope, $log, ProfileService) {

  $scope.data = {};

  function findSubject(topic, id){
    var local = _.find($scope.queryResults[topic], function(r){ return r.id === id;});
    if(local){
      return local;
    } else {
      return { id: id, text: "todo"};
    }
  }

  $scope.queryResults = {};

  $scope.subjectAsync = function(topic){ 
    return {
      query: function (query) {
        $log.debug("query: ", query);

        ProfileService.query( topic, query.term, function(result){

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
        return callback(findSubject(topic, val));
      }
    };
  };

  $scope.relatedSubjectAsync = $scope.subjectAsync("relatedSubject");
  $scope.primarySubjectAsync = $scope.subjectAsync("primarySubject");


 $scope.updateItemType = function () {
    $scope.data.itemType = $scope.otherItemType;
  };

  $scope.$watch("data.itemType", function (newValue) {
    if (newValue !== $scope.otherItemType) {
      $scope.otherItemType = "";
    }
  });

  ProfileService.list("gradeLevel", function(result){
    $scope.gradeLevelDataProvider = result;
  });

  ProfileService.list("itemType", function(result){
    $scope.itemTypeDataProvider  = result;
  });
};

angular.module('corespring-editor.controllers')
  .controller('Profile',
    ['$scope',
    '$log',
    'ProfileService',
      controller]);
