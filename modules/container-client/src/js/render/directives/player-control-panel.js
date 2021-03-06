(function() {

  angular.module('corespring-player.directives')
    .directive('playerControlPanel', ['$compile', '$log',

      function playerControlPanel($compile, $log) {

        function compile (element, attr, transcludeFunc) {

          return function ($scope, $element, attr) {

            $scope.showSettingsButton = (attr.showSettingsButton === undefined) ? false : (attr.showSettingsButton === 'true');
            $scope.showSubmitButton = (attr.showSubmitButton === undefined) ? true : (attr.showSubmitButton === 'true');
            $scope.showScore = (attr.showScore === undefined) ? true : (attr.showScore === 'true');

            $scope.settingsEnabled = {
              maxNoOfAttempts: true,
              highlightUserResponse: true,
              highlightCorrectResponse: true,
              showFeedback: true,
              allowEmptyResponses: true
            };

            $scope.$watch('mode', function onPlayerModeChange(newValue) {
              var playerIsInGatherMode = newValue === 'gather';
              $scope.settingsEnabled.highlightUserResponse = !playerIsInGatherMode;
              $scope.settingsEnabled.highlightCorrectResponse = !playerIsInGatherMode;
              $scope.settingsEnabled.allowEmptyResponses = playerIsInGatherMode;
            });

            var playerButtonSubmit = {"class": "btn action submit", "text": "Submit Answer", "mode": "gather"};
            var playerButtonReset = {"class": "btn action reset", "text": "    Reset    ", "mode": "evaluate"};

            $scope.playerButtonSettings = playerButtonSubmit;

            $scope.updatePlayer = function() {
              if ($scope.playerButtonSettings.mode === "evaluate") {
                reset();
                $scope.playerButtonSettings = playerButtonSubmit;
              } else {
                submit();
                $scope.playerButtonSettings = playerButtonReset;
              }
            };

            $scope.preview = function() {
              $scope.$emit('playerControlPanel.preview');
            };

            function submit() {
              $scope.$emit('playerControlPanel.submit');
            }

            function reset() {
              $scope.$emit('playerControlPanel.reset');
            }

            $scope.settingsChange = function() {
              $scope.$emit('playerControlPanel.settingsChange');
            };

            $scope.hasScore = function() {
              return !(_.isUndefined($scope.score) || _.isUndefined($scope.score.summary));
            };

            function initConfigPopover() {
              var CONFIG_BUTTON_SELECTOR = '.action.config';
              var $configLink = $element.find(CONFIG_BUTTON_SELECTOR);
              if (!$configLink) {
                $log.error("Cannot find config button", $configLink);
                throw ("Cannot find config button");
              }
              if (!$configLink.popover) {
                $log.error("config button has no popover method", $configLink.popover);
                throw ("config button has no popover method");
              }

              $scope.closePopup = function() {
                $configLink.popover('hide');
              };

              function checkbox(prop, label) {
                return [
                  '<li class="setting">',
                    '  <label ng-class="{disabled: !settingsEnabled.' + prop + '}">',
                  '    <input type="checkbox" ',
                    '      ng-model="settings.' + prop + '"',
                    '      ng-disabled="!settingsEnabled.' + prop + '"',
                  '      ng-change="settingsChange()"',
                  '    >',
                    '    <span>' + label + '</span>',
                  '  </label>',
                  '</li>'
                ].join("\n");
              }

              var template = [
                '<ul class="settings">',
                checkbox("highlightUserResponse", "Highlight user outcome"),
                checkbox("highlightCorrectResponse", "Highlight correct outcome"),
                checkbox("allowEmptyResponses", "Allow empty responses"),
                '</ul>',
                '<div style="display:block" align="right">',
                '<a class="btn btn-default btn-small btn-sm done" ng-click="closePopup()">Done</a>',
                '</div>'
              ].join('\n');

              $configLink.on('show.bs.popover', function () {

                function isOrChildOf(selector,elem) {
                  var target = $(elem);
                  return target.is(selector) || target.parents(selector).length > 0;
                }

                function onClickAnyWhere(e) {
                  if (!isOrChildOf('.popover',e.target) && !isOrChildOf('.fa-cog',e.target)) {
                    $scope.closePopup();
                    $('html').off( "click", arguments.callee);
                  }
                }

                $('html').click(onClickAnyWhere);
              });

              $configLink.popover({
                html: true,
                placement: 'bottom',
                template: '<div class="popover"><h3 class="popover-title"></h3><div class="popover-content"></div></div>',
                content: function() {
                  return $compile(template)($scope);
                },
                viewport:{selector:'.client-side-preview'},
                trigger:'click'
              });
            }

            initConfigPopover();


            transcludeFunc($scope.$parent, function(clone){
              element.find(".playerholder").append(clone);
            });

          };
        }

        return {
          restrict: 'AE',
          compile: compile,
          transclude: true,
          scope: {
            settings: '=',
            mode: '=',
            score: '=',
            showSettingsButton: '@',
            showSubmitButton: '@'
          },
          template: [
            '<div class="corespring-player-control-panel">',
            '  <div class="header-container">',
            '    <div class="header action-holder score-holder pull-right" ng-show="showScore">',
            '      <div class="score">',
            '        <label ng-show="hasScore()">Score:</label>',
            '        <span ng-show="hasScore()">{{score.summary.percentage}}%</span>',
            '      </div>',
            '      <div class="action config settings-holder" ng-show="showSettingsButton">',
            '        <a title="Settings">',
            '          <i class="fa fa-cog" />',
            '        </a>',
            '      </div>',
            '    </div>',
            '  </div>',
            '  <div class="playerholder"></div>', // Player
            '  <div class="pull-right submit-button-holder" ng-show="showSubmitButton">',
            '    <button ng-class="playerButtonSettings.class" ng-click="updatePlayer();">',
            '        {{playerButtonSettings.text}}',
            '    </button>',
            '  </div>',
            ' </div>'
          ].join("\n")
        };
      }
    ]);

}).call(this);
