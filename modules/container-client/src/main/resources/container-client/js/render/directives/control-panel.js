(function() {

  var defaultSettings = {
    maxNoOfAttempts: 1,
    highlightUserResponse: true,
    highlightCorrectResponse: true,
    showFeedback: true
  };

  angular.module('corespring-player.directives').directive('playerControlPanel', [

    function() {

      var template;

      function link($scope, $element, $attrs) {

        $scope.mode = 'gather';
        $scope.showSettings = false;
        $scope.evaluateOptions = defaultSettings;

        template = [
          '<div class="control-panel">',
          '  <div class="score">',
          '    <label ng-show="hasScore()">Score:</label>',
          '    <span ng-show="hasScore()">{{score.summary.percentage}}%</span>',
          '  </div>',

          $attrs.showResetButton === true ? [
            '  <div class="action reset">',
            '    <a title="Reset" ng-click="reset()">',
            '      <i class="fa fa-refresh" />',
            '    </a>',
            '  </div>'
          ].join("\n") : "",

          '  <div class="pull-right">',

          $attrs.showFeedbackButton === true ? [
            '    <button class="btn btn-feedback" ng-model="mode"',
            '      btn-checkbox-true="\'evaluate\'" btn-checkbox btn-checkbox-false="\'gather\'">Feedback Mode</button>'
          ].join("\n") : "",

          '    <div class="action config">',
          '      <a ng-class="{disabled: mode == \'gather\'}" title="Settings">',
          '        <i class="fa fa-cog" />',
          '      </a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join("\n");


        $scope.reset = function() {
          $scope.$broadcast('resetPreview');
        };

        $scope.hasScore = function() {
          return $scope.score && $scope.score.summary && !_.isNaN($scope.score.summary.percentage);
        };


        function checkbox(prop, label) {
          return [
            '<li class="setting">',
            '  <label>',
            '    <input type="checkbox" ',
            '      name="evaluateOptions.' + prop + '"', ($scope.evaluateOptions[prop] ? " checked='checked'" : ''),
            '    >',
            '    <span>' + label + '</span>',
            '  </label>',
            '</li>'
          ].join("\n");
        }

        var $configLink = $element.find('.action.config');

        if ($configLink && $configLink.popover) {

          $scope.$watch('mode', function(mode) {
            if (mode === 'evaluate') {
              $configLink.popover('enable');
            } else {
              $configLink.popover('disable');
            }

            $scope.$broadcast('setMode', {
              mode: $scope.mode,
              options: $scope.evaluateOptions,
              saveResponses: null
            });
          });

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
                '<a class="btn btn-success btn-small btn-sm" onclick=\"$(&quot;.action.config&quot;).popover(&quot;hide&quot;);\">Done</a>'
              ].join('\n');
            }
          });
        }
      }

      return {
        restrict: 'AE',
        link: link,
        template: template
      };
    }
  ]);

}).call(this);
