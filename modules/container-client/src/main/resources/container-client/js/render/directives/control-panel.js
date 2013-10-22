(function() {

  var radio = function(prop, label, mode, value){

    mode = mode || "checkbox";
    var valueAttr = value !== undefined ? " value=\"" + value + "\"" : "";

    return [
    '<div class="'+mode+'">',
      '<label>',
        '<input type="'+mode+'" ng-model="session[\''+prop+'\']" '+valueAttr+' >',
        label,
      '</label>',
      '</div>'].join("\n");
  };

  angular.module('corespring-player.directives').directive('playerControlPanel', [function(){

        var link = function($scope, $elem, $attrs){
          console.log("player control panel");
        };

        var def = {
          restrict: 'AE',
          link: link,
          scope: {
            session: '=playerSession'
          },
          template: [ '<div class="control-panel panel panel-info">',
                      '  <div class="panel-heading" ng-click="showSettings = !showSettings">',
                      '   <span class="glyphicon glyphicon-cog"></span>',
                      '    Session Settings',
                      '   </div>',
                      '   <div class="panel-body" ng-show="showSettings">',
                      '    <div class="span2 admin-col">',
                      '     <div>Attempts</div>',
                            radio("maxNoOfAttempts", "Multiple Attempts", "radio", 0),
                            radio("maxNoOfAttempts", "One Attempt", "radio", 1),
                      '   </div>',
                      '   <div class="span4 admin-col">',
                      '     <div>Feedback</div>',
                            radio("highlightUserResponse", "Highlight user response"),
                            radio("highlightCorrectResponse", "Highlight correct response"),
                            radio("showFeedback", "Show feedback"),
                            radio("allowEmptyResponses", "Allow empty responses"),
                      '   </div>',
                      '   <div class="footer">',
                      '     <button class="btn btn-primary">Update Settings</button>',
                      '   </div>',
                      '  </div>',
                      '</div>'].join("\n")
        };

        return def;
      }

  ]);

}).call(this);
