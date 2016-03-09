angular.module('corespring-player.controllers')
  .controller(
    'Main', [
      '$document',
      '$location',
      '$log',
      '$scope',
      '$timeout',
      'ComponentRegister',
      'PlayerServiceDefinition',
      function(
        $document,
        $location,
        $log,
        $scope,
        $timeout,
        ComponentRegister,
        PlayerServiceDefinition
      ) {

        var currentMode = null;
        var PlayerService = new PlayerServiceDefinition();

        $scope.evaluateOptions = {
          showFeedback: true,
          allowEmptyResponses: true,
          highlightCorrectResponse: true,
          highlightUserResponse: true
        };

        $scope.onAnswerChanged = function() {
          $scope.$emit("inputReceived", {
            sessionStatus: getSessionStatus()
          });
        };

        ComponentRegister.setAnswerChangedHandler($scope.onAnswerChanged);

        $scope.canSubmit = function() {
          return $scope.evaluateOptions.allowEmptyResponses || !ComponentRegister.hasEmptyAnswers();
        };

        $scope.save = function(isAttempt, isComplete, cb) {

          $log.debug('[save] -> attempt: ', isAttempt, ' complete:', isComplete, 'callback:', cb);

          PlayerService.saveSession({
              isAttempt: isAttempt,
              isComplete: isComplete,
              components: ComponentRegister.getComponentSessions()
            },
            function(s) {
              $log.debug('[save] successful');
              $scope.onSessionSaved(s);
              if (cb) {
                cb(null, s);
              }
            },
            function(e) {
              $log.debug('[save] error');
              $scope.onSessionSaveError(e);
              if (cb) {
                cb(e);
              }
            }
          );
        };


        $scope.loadInstructorData = function(cb) {
          PlayerService.loadInstructorData({},
            function(data) {
              $scope.onInstructorDataLoaded(data);
              if (cb) {
                cb(null, data);
              }
            }, function(err) {
              $log.error(err);
              if (cb) {
                cb(err);
              }
            }
          );
        };

        /** 
         * load the outcome
         * @param settings - an object that will be passed to the components' outcome generation
         */
        $scope.loadOutcome = function(settings, cb) {
          //TODO - need to fetch the player options
          //Passed in to the launcher
          PlayerService.loadOutcome(settings,
            function(data) {
              $scope.onOutcomeLoaded(data);
              if (cb) {
                cb(null, data);
              }
            }, function(err) {
              $log.error(err);
              if (cb) {
                cb(err);
              }
            }
          );
        };

        $scope.onOutcomeLoaded = function(data) {
          $scope.outcome = data.outcome;
          $scope.score = data.score;
        };

        $scope.onInstructorDataLoaded = function(data) {
          $log.debug("[Main] answer key result");
          ComponentRegister.setInstructorData(data.item.components);
        };

        $scope.loadOutcomeError = function(err) {
          $log.error(err);
        };

        $scope.getScore = function(onSuccess, onError) {
          PlayerService.getScore({
              components: ComponentRegister.getComponentSessions()
            },
            onSuccess,
            onError
          );
        };

        $scope.completeResponse = function(callback) {
          PlayerService.completeResponse(
            function() {
              $scope.isComplete = true;
              callback(null, $scope.isComplete);
            },
            function(err) {
              $scope.isComplete = false;
              $log.error(err);
              callback(err, $scope.isComplete);
            }
          );
        };

        $scope.onSessionSaved = function(session) {
          $scope.session = session;
        };

        $scope.updateSession = function(data) {
          if (!$scope.model || !$scope.model.session) {
            return;
          }
          $scope.session.remainingAttempts = data.session.remainingAttempts;
          $scope.session.isFinished = data.session.isFinished;
          $scope.$broadcast('session-finished', $scope.model.session.isFinished);
        };

        $scope.onSessionLoadError = function(error) {
          $log.warn("Error loading session", error);
        };

        $scope.onSessionReopenError = function(error) {
          $log.warn("Error reopening session", error);
        };

        $scope.onSessionResetError = function(error) {
          $log.warn("Error resetting session", error);
        };

        $scope.onSessionSaveError = function(error) {
          $log.warn("Error saving session", error);
        };

        $scope.onItemAndSessionLoaded = function(data) {
          $scope.rootModel = data;
          $scope.item = data.item;
          $scope.session = data.session;
          $scope.isComplete = data.session ? data.session.isComplete : false;
          $scope.$emit("session-loaded", data.session);
        };

        $scope.onSessionReopenSuccess = function(session) {
          $log.info("onSessionReopenSuccess", session);
          $scope.session = session;
          $scope.outcome = undefined;
          $scope.score = undefined;
          $scope.isComplete = false;

          ComponentRegister.reset();
        };

        $scope.onSessionResetSuccess = function(session) {
          $log.info("onSessionResetSuccess", session);
          $scope.session = session;
          $scope.outcome = undefined;
          $scope.score = undefined;
          $scope.isComplete = false;

          ComponentRegister.reset();
        };

        function getSessionStatus() {
          return {
            allInteractionsHaveResponse: !ComponentRegister.hasEmptyAnswers(),
            interactionCount: ComponentRegister.interactionCount(),
            interactionsWithResponseCount: ComponentRegister.interactionsWithResponseCount()
          };
        }

        /**
         * Initialise the controller - this has to be the 1st thing you call
         */
        $scope.$on('initialise', function(event, data) {
          $log.debug("[Main] initialise");
          PlayerService.loadItemAndSession(
            function(itemAndSession) {
              $scope.onItemAndSessionLoaded(itemAndSession);

              if (currentMode !== undefined && currentMode !== null) {
                throw new Error('The mode is already set to ' + currentMode);
              }

              currentMode = data.mode;
              updateComponentsMode();

              if (data.mode === 'instructor') {
                $scope.loadInstructorData();
              }

              if (data.mode === 'evaluate') {

                /**
                 * settings passed to the components when they are creating the outcomes
                 */
                var settings = data.evaluate || {};
                $scope.loadOutcome(settings, function() {
                  $log.debug("[Main] outcome received");
                });
              }
            },
            $scope.onSessionLoadError,
            $scope.sessionId);
        });

        $scope.$on('reopenSession', function() {
          PlayerService.reopenSession($scope.onSessionReopenSuccess, $scope.onSessionReopenError, $scope.sessionId);
        });

        $scope.$on('resetSession', function() {
          PlayerService.resetSession($scope.onSessionResetSuccess, $scope.onSessionResetError, $scope.sessionId);
        });

        $scope.$on('saveResponses', function(event, data, callback) {
          $log.debug('[onSaveResponses] -> ', data, callback);
          $scope.save(data.isAttempt, data.isComplete, callback || function() {});
        });

        $scope.$on('countAttempts', function(event, data, callback) {
          callback(null, $scope.session && $scope.session.attempts || 0);
        });

        $scope.$on('getScore', function(event, data, callback) {

          function onScoreReceived(outcome) {
            var percentage = outcome.summary.percentage;
            var score = data.format === 'scaled' ? (percentage / 100) : percentage;
            callback(null, score);
          }

          $scope.getScore(onScoreReceived, callback);
        });

        $scope.$on('completeResponse', function(event, data, callback) {
          $scope.completeResponse(callback || function() {});
        });

        $scope.$on('isComplete', function(event, data, callback) {
          callback(null, $scope.isComplete || false);
        });

        $scope.$on('getSessionStatus', function(event, data, callback) {
          callback(null, getSessionStatus());
        });

        $scope.$on('editable', function(event, data) {
          ComponentRegister.setEditable(data.editable);
        });

        function updateComponentsMode() {
          var editable = (currentMode === 'gather');

          $timeout(function() {
            $log.debug("[Main] $timeout: set mode: ", currentMode);
            ComponentRegister.setEditable(editable);
            ComponentRegister.setMode(currentMode);
          }, 10);
        }

        /** Set mode to view, gather or evaluate
         * Updates the components mode and editable state.
         * Optionally save the responses too.
         * The data object contains:
         * ```
         * mode : view|gather|evaluate|instructor //required
         * saveResponses : { isAttempt : true|false, isComplete: true|false}
         * ```
         * saveResponses will save the client side data. Its optional - if not present nothing will be saved.
         */
        $scope.$on('setMode', function(event, data) {

          $log.debug("[Main] setMode: ", data);

          if (data.mode && data.mode === currentMode) {
            $log.warn("mode is already set to: ", data.mode);
            return;
          }


          currentMode = data.mode;
          updateComponentsMode();

          if (data.saveResponses) {
            saveResponses(updateOutcome);
          } else {
            updateOutcome();
          }

          function saveResponses(onSuccess) {
            $log.debug("[Main] saving responses");
            $scope.save(data.saveResponses.isAttempt, data.saveResponses.isComplete, function() {
              $log.debug("[Main] session save successful");
              onSuccess();
            });
          }

          function updateOutcome() {
            if (data.mode === 'evaluate') {
              loadOutcome();
            } else {
              clearOutcome();
              if (data.mode === 'instructor') {
                loadInstructorData();
              }
            }
          }

          function loadOutcome() {
            $timeout(function() {
              $log.debug("[Main] load outcome!!!");
              var settings = data.evaluate || {};
              $scope.loadOutcome(settings, function() {
                $log.debug("[Main] score received");
              });
            });
          }

          function loadInstructorData() {
            $timeout(function() {
              $log.debug("[Main] load instructor data");
              $scope.loadInstructorData(function() {
                $log.debug("[Main] instructor data received");
              });
            });
          }

          function clearOutcome() {
            $log.debug("[Main] clear outcome!!!");
            _.forIn($scope.outcome, function(value, key) {
              $scope.outcome[key] = {};
            });
            $scope.score = {};
          }

        });

      }
    ]);
