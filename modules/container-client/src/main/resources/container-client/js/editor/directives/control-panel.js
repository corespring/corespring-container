(function() {

  var radioOrCheckbox = function(prop, label, mode, value){

    mode = mode || "checkbox";
    var valueAttr = value !== undefined ? " value=\"" + value + "\"" : "";

    return [
    '<div class="'+mode+'">',
      '<label>',
        '<input type="'+mode+'" ng-model="settings[\''+prop+'\']" '+valueAttr+' >',
        label,
      '</label>',
      '</div>'].join("\n");
  };

  angular.module('corespring-editor.directives').directive('playerControlPanel', [function(){

        var link = function($scope, $elem, $attrs){
          console.log("player control panel");
        };

        var def = {
          restrict: 'AE',
          link: link,
          scope: {
            settings: '=playerSettings'
          },
          template: [ '<div class="control-panel panel panel-info">',
                      '  <div class="panel-heading" ng-click="showSettings = !showSettings">',
                      '   <span class="glyphicon glyphicon-cog"></span>',
                      '    Session Settings',
                      '   </div>',
                      '   <div class="panel-body" ng-show="showSettings">',
                      '    <div class="span2 admin-col">',
                      '     <div>Attempts</div>',
                            radioOrCheckbox("maxNoOfAttempts", "Multiple Attempts", "radio", 0),
                            radioOrCheckbox("maxNoOfAttempts", "One Attempt", "radio", 1),
                      '   </div>',
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
