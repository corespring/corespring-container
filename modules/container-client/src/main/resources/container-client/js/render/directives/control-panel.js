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
        var $configLink = $element.find('.action.config');

        console.log("player control panel");

        $scope.showSettings = false;
        $scope.mode = 'gather';

        $scope.reset = function() {
          $scope.$broadcast('resetPreview');
        };

        $scope.$watch('mode', function(mode) {
          if (mode === 'feedback') {
            $configLink.popover('enable');
          } else {
            $configLink.popover('disable');
          }
        });

        $element.on('click', '.dismiss-popover', function() {
          $('.action.config').popover('hide');
        });

        $configLink.popover({
          html: true,
          placement: 'bottom',
          content: [
            '<ul class="settings">',
               radioOrCheckbox("highlightUserResponse", "Highlight user outcome"),
               radioOrCheckbox("highlightCorrectResponse", "Highlight correct outcome"),
               radioOrCheckbox("allowEmptyResponses", "Allow empty responses"),
            '</ul>',
            '<a class="btn btn-success btn-small btn-sm dismiss-popover">Done</a>'
          ].join('\n')
        });

      };

      return {
        restrict: 'AE',
        link: link,
        template: [
          '<div class="control-panel">',
          '  <div class="btn-group">',
          '    <label class="btn btn-success" ng-model="mode" btn-radio="\'gather\'">Gather</label>',
          '    <label class="btn btn-success" ng-model="mode" btn-radio="\'feedback\'">Feedback</label>',
          '  </div>',
          '  <div class="score" ng-show="score">',
          '    <label>Score:</label>',
          '    <span>{{score.summary.percentage}}%</span>',
          '  </div>',
          '  <ul class="actions">',
          '    <li class="action config"><a ng-class="{disabled: mode == \'gather\'}" title="Settings"><img src="../../images/settings-icon.png"/></a></li>',
          '    <li class="action reset"><a title="Reset" ng-click="reset()" /></li>',
          '  </ul>',
          '</div>'
        ].join("\n")
      };
    }
  ]);

}).call(this);
