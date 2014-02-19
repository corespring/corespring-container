(function() {

  var radioOrCheckbox = function(prop, label, mode, value){

    mode = mode || "checkbox";
    var valueAttr = value !== undefined ? " value=\"" + value + "\"" : "";

    return [
    '<div class="'+mode+'">',
      '<label>',
        '<input type="'+mode+'" ng-model="evaluateOptions[\''+prop+'\']" '+valueAttr+' >',
        label,
      '</label>',
      '</div>'].join("\n");
  };

  angular.module('corespring-player.directives').directive('playerControlPanel', [function(){

        var link = function($scope, $elem, $attrs){
          console.log("player control panel");
          $scope.showSettings = false;
        };

        var def = {
          restrict: 'AE',
          link: link,
          template: [ '<div class="control-panel panel panel-info">',
                      '  <div class="panel-heading" ng-click="showSettings = !showSettings">',
                      '   <span class="glyphicon glyphicon-cog"></span>',
                      '    Player Settings',
                      '   </div>',
                      '   <div class="panel-body" ng-show="showSettings">',
                      '   <div class="span4 admin-col">',
                      '     <div>Feedback</div>',
                            radioOrCheckbox("highlightUserResponse", "Highlight user outcome"),
                            radioOrCheckbox("highlightCorrectResponse", "Highlight correct outcome"),
                            radioOrCheckbox("showFeedback", "Show feedback"),
                            radioOrCheckbox("allowEmptyResponses", "Allow empty responses"),
                      '   </div>',
                      '  </div>',
                      '</div>'].join("\n")
        };

        return def;
      }

  ]);

}).call(this);
