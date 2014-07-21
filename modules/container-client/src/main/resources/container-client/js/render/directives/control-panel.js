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
        var $configLink = $element.find('.action.feedback-mode');

        $scope.showSettings = false;
        $scope.evaluateOptions = defaultSettings;

        $scope.reset = function() {
          $scope.$broadcast('resetPreview');
        };

        $scope.hasScore = function() {
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
                '<a class="btn btn-success btn-small btn-sm" onclick=\"$(&quot;.action.feedback-mode&quot;).popover(&quot;hide&quot;);\">Done</a>'
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
          '  <div class="score" ng-show="hasScore()">',
          '    <label>Score:</label>',
          '    <span>{{score.summary.percentage}}%</span>',
          '  </div>',
          '  <div class="pull-right">',
          '    <button class="btn action reset" ng-click="reset()"',
          '      >Reset</button>',
          '    <button class="btn action preview" ng-click="preview()"',
          '      >Preview</button>',
          '    <button class="btn action feedback-mode"',
          '      >Feedback Mode <span class="caret"></span></button>',
          '  </div>',
          '</div>'
        ].join("\n")
      };
    }
  ]);

}).call(this);
