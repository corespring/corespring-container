angular.module('corespring-player.controllers')
  .controller(
    'Main', [
      '$location',
      '$log',
      '$scope',
      '$timeout',
      'ComponentRegister',
      'PlayerService',
      function($location, $log, $scope, $timeout, ComponentRegister, PlayerServiceDef) {

        var PlayerService = new PlayerServiceDef();

        var currentMode = null;

        $scope.evaluateOptions = {
          showFeedback: true,
          allowEmptyResponses: true,
          highlightCorrectResponse: true,
          highlightUserResponse: true
        };

        $scope.sessionId = (function() {
          //TODO: This is a temporary means of extracting the session id
          return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
        })();

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
            },
            $scope.sessionId
          );
        };

        $scope.loadOutcome = function(options, cb) {
          //TODO - need to fetch the player options
          //Passed in to the launcher
          PlayerService.loadOutcome(options,
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
            },
            $scope.sessionId
          );
        };

        $scope.onOutcomeLoaded = function(data) {
          $scope.outcome = data.outcome;
          $scope.score = data.score;
        };

        $scope.loadOutcomeError = function(err) {
          $log.error(err);
        };

        $scope.getScore = function(onSuccess, onError) {
          PlayerService.getScore({
              components: ComponentRegister.getComponentSessions()
            },
            onSuccess,
            onError,
            $scope.sessionId
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
            },
            $scope.sessionId
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

        $scope.onSessionResetSuccess = function(session) {
          $log.info("onSessionResetSuccess", session);
          $scope.session = session;
          $scope.outcome = undefined;
          $scope.score = undefined;
          $scope.isComplete = false;

          ComponentRegister.reset();
        };

        var getSessionStatus = function() {
          return {
            allInteractionsHaveResponse: !ComponentRegister.hasEmptyAnswers(),
            interactionCount: ComponentRegister.interactionCount(),
            interactionsWithResponseCount: ComponentRegister.interactionsWithResponseCount()
          };
        };
        
        /**
         * Initialise the controller - this has to be the 1st thing you call
         */
        $scope.$on('initialise', function(event, data) {
          $log.debug('[on initialise]', data);
          PlayerService.setQueryParams(data.queryParams || {});
          PlayerService.loadItemAndSession(
            function(itemAndSession){
              $scope.onItemAndSessionLoaded(itemAndSession);
              
              if(currentMode !== undefined && currentMode !== null){
                throw new Error('The mode is already set to ' + currentMode);
              }

              currentMode = data.mode;
              updateRegisterMode();

              if(data.mode === 'evaluate'){
                $scope.loadOutcome(data.options, function() {
                  $log.debug("[Main] outcome received");
                });
              }
            }, 
            $scope.onSessionLoadError, 
            $scope.sessionId);
        });

        $scope.$on('resetSession', function() {
          PlayerService.resetSession($scope.onSessionResetSuccess, $scope.onSessionResetError, $scope.sessionId);
        });

        $scope.$on('saveResponses', function(event, data, callback) {

          $log.debug('[onSaveResponses] -> ', data, callback);

          function onSaved(err, result) {
            if (callback) {
              callback({
                result: {
                  error: err,
                  session: result
                }
              });
            }
          }

          $scope.save(data.isAttempt, data.isComplete, onSaved);
        });

        $scope.$on('countAttempts', function(event, data, callback) {
          callback({
            count: $scope.session.attempts
          });
        });

        $scope.$on('getScore', function(event, data, callback) {

          var onScoreReceived = function(outcome) {
            var percentage = outcome.summary.percentage;
            callback({
              score: data.format === 'scaled' ? (percentage / 100) : percentage
            });
          };
          $scope.getScore(onScoreReceived);
        });

        $scope.$on('completeResponse', function(event, data, callback) {
          $scope.completeResponse(function(err, isComplete) {
            if (callback) {
              callback({
                result: {
                  error: err,
                  isComplete: isComplete
                }
              });
            }
          });
        });

        $scope.$on('isComplete', function(event, data, callback) {
          callback({
            isComplete: $scope.isComplete || false
          });
        });

        $scope.$on('getSessionStatus', function(event, data, callback) {
          callback({
            sessionStatus: getSessionStatus()
          });
        });

        $scope.$on('editable', function(event, data) {
          ComponentRegister.setEditable(data.editable);
        });

        function updateRegisterMode(){
         var editable = (currentMode === 'gather');

          $timeout(function() {
            $log.debug("[Main] $timeout: set mode: ", currentMode);
            ComponentRegister.setEditable(editable);
            ComponentRegister.setMode(currentMode);
          }); 
        }

        /** Set mode to view, gather or evaluate
         * Optionally save the responses too.
         * The data object contains:
         * ```
         * mode : view|gather|evaluate //required
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
          updateRegisterMode();

          var afterMaybeSave = function() {
            if (data.mode === 'evaluate') {
              $timeout(function() {

                $log.debug("[Main] load outcome!!!");
                $scope.loadOutcome(data.options, function() {
                  $log.debug("[Main] score received");
                });
              });
            } else {
              _.forIn($scope.outcome, function(value, key) {
                $scope.outcome[key] = {};
              });
              $scope.score = {};
            }
          };

          if (data.saveResponses) {
            $scope.save(data.saveResponses.isAttempt, data.saveResponses.isComplete, function() {
              $log.debug("[Main] session save successful - call maybeSave");
              afterMaybeSave();
            });
          } else {
            $log.debug("[Main] no need to save responses - call maybeSave");
            afterMaybeSave();
          }
        });

      }
    ]);
