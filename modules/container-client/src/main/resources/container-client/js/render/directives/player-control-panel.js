(function() {

  var GATHER = 'gather';
  var EVALUATE = 'evaluate';

  var defaultSettings = {
    maxNoOfAttempts: 1,
    highlightUserResponse: true,
    highlightCorrectResponse: true,
    showFeedback: true,
    allowEmptyResponses: false
  };

  var defaultSettingsEnabled = {
    maxNoOfAttempts: true,
    highlightUserResponse: true,
    highlightCorrectResponse: true,
    showFeedback: true,
    allowEmptyResponses: true
  };

  angular.module('corespring-player.directives').directive('playerControlPanel', ['$compile','$log',

    function playerControlPanel($compile, $log) {
      function link($scope, $element) {

        $scope.evaluateOptions = defaultSettings;
        $scope.evaluateOptionsEnabled = defaultSettingsEnabled;

        $scope.playerMode = GATHER;

        function setMode(newMode) {
          if ($scope.playerMode !== newMode) {
            $scope.$emit('setMode', {
              mode: newMode,
              options: $scope.evaluateOptions,
              saveResponses: null
            });
            $scope.playerMode = newMode;
          }
        }

        function submitAnswer() {
          var onSaveSuccess = function(everything) {
            if (everything) {
              $scope.score = everything.score;
            }
            setMode(EVALUATE);
          };

          $scope.$emit('saveResponses', {
            isAttempt: true,
            isComplete: true,
            onSaveSuccess: onSaveSuccess
          });
        }

        function changeAnswer() {
          setMode(GATHER);
        }

        $scope.$watch('playerMode', function onPlayerModeChange(newValue) {
          if (newValue === GATHER) {
            $scope.evaluateOptionsEnabled.highlightUserResponse = false;
            $scope.evaluateOptionsEnabled.highlightCorrectResponse = false;
            $scope.evaluateOptionsEnabled.allowEmptyResponses = true;
          } else {
            $scope.evaluateOptionsEnabled.highlightUserResponse = true;
            $scope.evaluateOptionsEnabled.highlightCorrectResponse = true;
            $scope.evaluateOptionsEnabled.allowEmptyResponses = false;
          }
        });


        $scope.submit = function() {
          if ($scope.playerMode === GATHER) {
            submitAnswer();
          } else {
            changeAnswer();
          }
        };

        $scope.reset = function() {
          $scope.$broadcast('resetPreview');
          setMode(GATHER);
        };

        $scope.hasScore = function hasScore() {
          return $scope.score && $scope.score.summary && !_.isNaN($scope.score.summary.percentage);
        };

        $scope.broadcastSettings = function(){
          //$log.debug("[playerControlPanel] broadcastSettings");
          $scope.$broadcast('setEvaluateOptions', $scope.evaluateOptions);
        };

        $element.on('hide.bs.popover', function() {
          $scope.broadcastSettings();
        });

        function checkbox(prop, label) {
          return [
            '<li class="setting">',
            '  <label ng-class="{disabled: !evaluateOptionsEnabled.' + prop + '}">',
            '    <input type="checkbox" ',
            '      ng-model="evaluateOptions.' + prop + '"',
            '      ng-disabled="!evaluateOptionsEnabled.' + prop + '"',
            '      ng-change="broadcastSettings()"',
            '    >',
            '    <span>' + label + '</span>',
            '  </label>',
            '</li>'
          ].join("\n");
        }

        function initConfigPopover() {
          var CONFIG_BUTTON_SELECTOR = '.action.config';
          var $configLink = $element.find(CONFIG_BUTTON_SELECTOR);
          if ($configLink && $configLink.popover) {

            $scope.closePopup = function(){
              $configLink.popover('hide');
            };

            var template =  [
              '<ul class="settings">',
              checkbox("highlightUserResponse", "Highlight user outcome"),
              checkbox("highlightCorrectResponse", "Highlight correct outcome"),
              checkbox("allowEmptyResponses", "Allow empty responses"),
              '</ul>',
              '<a class="btn btn-success btn-small btn-sm" ng-click="closePopup()">Done</a>'
            ].join('\n');
            var linker = $compile(template);
            var popupContent = linker($scope);

            $configLink.popover({
              html: true,
              placement: 'bottom',
              content: function () {
                return popupContent;
              }
            });
          }
        }

        initConfigPopover();

      }

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
          '      >{{playerMode === "gather" ? "Submit Answer" : "Change Answer"}}</button>',
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
