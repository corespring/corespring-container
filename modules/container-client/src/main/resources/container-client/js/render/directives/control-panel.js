(function() {

  var defaultSettings = {
    maxNoOfAttempts: 1,
    highlightUserResponse: true,
    highlightCorrectResponse: true,
    showFeedback: true
  };

  angular.module('corespring-player.directives').directive('playerControlPanel', [
    function() {
      var link = function($scope, $element) {
        var $configLink = $element.find('.action.config');

        console.log("player control panel");

        $scope.showSettings = false;
        $scope.evaluateOptions = defaultSettings;

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

          $scope.$broadcast('setMode', { mode: $scope.mode, options: $scope.evaluateOptions, saveResponses: null } );
        });

        $element.on('click', '.dismiss-popover', function() {
          $('.action.config').popover('hide');
        });

        $scope.hasScore = function() {
          return $scope.score && !_.isNaN($scope.score.summary.percentage);
        };

        $element.on('hide.bs.popover', function() {
          $('.settings input', $element).each(function(index, input) {
            var attr = (function() {
              var match = $(input).attr('name').match(/evaluateOptions\.(.*)/);
              return (match && match.length > 1) ? match[1] : undefined;
            }());
            if (attr) {
              $scope.evaluateOptions[attr] = $(input).is(':checked');
            }
          });
        });

        function checkbox(prop, label) {
          return [
            '<li class="setting">',
            '  <label>',
            '    <input type="checkbox" ',
            '      name="evaluateOptions.' + prop + '"',
                   ($scope.evaluateOptions[prop] ? " checked='checked'" : ''),
            '    >',
            '    <span>' + label + '</span>',
            '  </label>',
            '</li>'
          ].join("\n");
        }

        $configLink.popover({
          html: true,
          placement: 'bottom',
          content: function() {
            return [
              '<ul class="settings">',
                 checkbox("highlightUserResponse", "Highlight user outcome"),
                 checkbox("highlightCorrectResponse", "Highlight correct outcome"),
                 checkbox("allowEmptyResponses", "Allow empty responses"),
              '</ul>',
              '<a class="btn btn-success btn-small btn-sm dismiss-popover">Done</a>'
            ].join('\n');
          }
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
          '  <div class="score" ng-show="hasScore()">',
          '    <label>Score:</label>',
          '    <span>{{score.summary.percentage}}%</span>',
          '  </div>',
          '  <ul class="actions">',
          '    <li class="action config">',
          '      <a ng-class="{disabled: mode == \'gather\'}" title="Settings">',
          '        <img src="../../images/settings-icon.png"/>',
          '      </a>',
          '    </li>',
          '    <li class="action reset"><a title="Reset" ng-click="reset()" /></li>',
          '  </ul>',
          '</div>'
        ].join("\n")
      };
    }
  ]);

}).call(this);
