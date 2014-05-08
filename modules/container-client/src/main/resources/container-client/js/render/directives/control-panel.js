(function() {

  var radioOrCheckbox = function(prop, label, mode, value) {

    mode = mode || "checkbox";
    var valueAttr = value !== undefined ? " value=\"" + value + "\"" : "";

    return [
      '<li class="setting">',
      '  <label>',
      '    <input type="' + mode + '" ng-model="evaluateOptions[\'' + prop + '\']" ' + valueAttr + ' >',
      '    <span>' + label + '</span>',
      '  </label>',
      '</li>'
    ].join("\n");

  };

  angular.module('corespring-player.directives').directive('playerControlPanel', [
    function() {
      var link = function($scope, $element) {
        console.log("player control panel");
        $scope.showSettings = false;

        $scope.reset = function() {
          $scope.$broadcast('resetPreview');
        };

        $element.find('.action.config').popover({
          html: true,
          placement: 'bottom',
          content: [
            '<ul class="settings">',
               radioOrCheckbox("highlightUserResponse", "Highlight user outcome"),
               radioOrCheckbox("highlightCorrectResponse", "Highlight correct outcome"),
               radioOrCheckbox("showFeedback", "Show feedback"),
               radioOrCheckbox("allowEmptyResponses", "Allow empty responses"),
            '</ul>',
            '<a class="btn btn-success btn-small btn-sm" onClick="$(\'.action.config\').popover(\'hide\');">Done</a>'
          ].join('\n')
        });

      };

      return {
        restrict: 'AE',
        link: link,
        template: [
          '<div class="control-panel">',
          '  <label>Mode:</label>',
          '  <select>',
          '    <option>Feedback</option>',
          '  </select>',
          '  <label>Score:</label>',
          '  <span>{{score.summary.percentage}}%</span>',
          '  <ul class="actions">',
          '    <li class="action config"><a title="Settings" /></li>',
          '    <li class="action reset"><a title="Reset" ng-click="reset()" /></li>',
          '  </ul>',
          '</div>'
        ].join("\n")
      };
    }
  ]);

}).call(this);
