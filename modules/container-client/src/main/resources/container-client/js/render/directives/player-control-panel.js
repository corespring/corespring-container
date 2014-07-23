(function() {

  var defaultSettings = {
    maxNoOfAttempts: 1,
    highlightUserResponse: true,
    highlightCorrectResponse: true,
    showFeedback: true
  };

  var configButtonSelector = '.action.config';

  angular.module('corespring-player.directives').directive('playerControlPanel', [

    function() {
      var link = function($scope, $element) {

        var $configLink = $element.find(configButtonSelector);

        $scope.showSettings = false;
        $scope.evaluateOptions = defaultSettings;

        var mode = "gather";

        function setMode(newMode) {
          if (mode !== newMode) {
            $scope.$emit('setMode', {
              mode: newMode,
              options: $scope.evaluateOptions,
              saveResponses: null
            });
            mode = newMode;
          }
        }

        $scope.submit = function() {
          var onSaveSuccess = function(err) {
            setMode('evaluate');
          };

          $scope.$emit('saveResponses', {
            isAttempt: true,
            isComplete: true,
            onSaveSuccess: onSaveSuccess
          });
        };

        $scope.reset = function() {
          $scope.$broadcast('resetPreview');
        };

        $scope.hasScore = function() {
          $scope.score = {summary:{percentage: 100}};
          return $scope.score && $scope.score.summary && !_.isNaN($scope.score.summary.percentage);
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
          $scope.$broadcast('setEvaluateOptions', $scope.evaluateOptions);
        });

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

        if ($configLink && $configLink.popover) {
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
                '<a class="btn btn-success btn-small btn-sm" onclick="$(&quot;' + configButtonSelector + '&quot;).popover(&quot;hide&quot;);">Done</a>'
              ].join('\n');
            }
          });
        }
      };

      return {
        restrict: 'AE',
        link: link,
        template: [
          '<div class="control-panel">',
          '  <div class="action-holder">',
          '    <button class="btn action preview" ng-click="preview()"',
          '      >Preview</button>',
          '  </div>',
          '  <div class="action-holder pull-right">',
          '    <div class="score">',
          '      <label ng-show="hasScore()">Score:</label>',
          '      <span ng-show="hasScore()">{{score.summary.percentage}}%</span>',
          '    </div>',
          '    <button class="btn action submit" ng-click="submit()"',
          '      >Submit</button>',
          '    <button class="btn action reset" ng-click="reset()"',
          '      >Reset</button>',
          '    <div class="action config">',
          '      <a title="Settings">',
          '        <i class="fa fa-cog" />',
          '      </a>',
          '    </div>',
          '  </div>',
          '</div>'
        ].join("\n")
      };
    }
  ]);

}).call(this);
