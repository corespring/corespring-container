describe('Main', function() {

  var scope, element, timeout;

  var hasEmptyAnswers = true, interactionCount = 0, interactionsWithResponseCount = [];

  var mockReset = jasmine.createSpy('reset');
  var mockSetEditable = jasmine.createSpy('setEditable');
  var mockSetMode = jasmine.createSpy('setMode');

  var sessionId = "554b98d854b108ef2f4871e1";

  function MockComponentRegister() {
    this.setAnswerChangedHandler = function(callback) { callback(); };
    this.hasEmptyAnswers = function() { return hasEmptyAnswers; };
    this.interactionCount = function() { return interactionCount; };
    this.interactionsWithResponseCount = function() { return interactionsWithResponseCount; };
    this.getComponentSessions = function() { return []; };
    this.setEditable = mockSetEditable;
    this.reset = mockReset;
    this.setMode = mockSetMode;
  }

  var mockSaveSession = jasmine.createSpy('saveSession');
  var mockLoadOutcome = jasmine.createSpy('loadOutcome');
  var mockLoadItemAndSession = jasmine.createSpy('loadItemAndSession');
  var mockCompleteResponse = jasmine.createSpy('completeResponse');
  var mockReopenSession = jasmine.createSpy('reopenSession');
  var mockResetSession = jasmine.createSpy('resetSession');
  var mockGetScore = jasmine.createSpy('getScore');
  var mockSetQueryParams = jasmine.createSpy('setQueryParams');

  function MockPlayerServiceDefinition() {
    this.saveSession = mockSaveSession;
    this.loadOutcome = mockLoadOutcome;
    this.loadItemAndSession = mockLoadItemAndSession;
    this.completeResponse = mockCompleteResponse;
    this.reopenSession = mockReopenSession;
    this.resetSession = mockResetSession;
    this.getScore = mockGetScore;
    this.setQueryParams = mockSetQueryParams;
  }

  var mockError = jasmine.createSpy('error');
  var mockInfo = jasmine.createSpy('info');
  var mockWarn = jasmine.createSpy('warn');

  function resetMocks() {
    mockReset.calls.reset();
    mockSetEditable.calls.reset();
    mockSaveSession.calls.reset();
    mockLoadOutcome.calls.reset();
    mockLoadItemAndSession.calls.reset();
    mockCompleteResponse.calls.reset();
    mockReopenSession.calls.reset();
    mockResetSession.calls.reset();
    mockGetScore.calls.reset();
    mockSetQueryParams.calls.reset();
    mockError.calls.reset();
    mockWarn.calls.reset();
    mockInfo.calls.reset();
  }

  afterEach(resetMocks);

  function MockLog() {
    this.error = mockError;
    this.debug = function() {};
    this.warn = mockWarn;
    this.info = mockInfo;
  }

  var MockDocument = [{}];

  beforeEach(angular.mock.module('corespring-player.services'));
  beforeEach(angular.mock.module('corespring-player.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$log', new MockLog());
    $provide.value('$document', MockDocument);
    $provide.value('ComponentRegister', new MockComponentRegister());
    $provide.value('PlayerServiceDefinition', MockPlayerServiceDefinition);
  }));

  beforeEach(inject(function($rootScope, $compile, $timeout) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="Main"></div>')(scope);
    timeout = $timeout;
    scope = element.scope();
    spyOn(scope, "$emit").and.callThrough();
    spyOn(scope, "$broadcast").and.callThrough();
  }));

  describe('initialization', function() {

    it('should set default evaluateOptions', function() {
      expect(scope.evaluateOptions).toEqual({
        showFeedback: true,
        allowEmptyResponses: true,
        highlightCorrectResponse: true,
        highlightUserResponse: true
      });
    });

  });

  describe('onAnswerChanged', function() {

    beforeEach(function() {
      scope.onAnswerChanged();
    });

    it('should $emit an inputReceived event with sessionStatus', function() {
      expect(scope.$emit).toHaveBeenCalledWith('inputReceived', { sessionStatus : {
        allInteractionsHaveResponse: !hasEmptyAnswers,
        interactionCount: interactionCount,
        interactionsWithResponseCount: interactionsWithResponseCount
      }});
    });

  });

  describe('canSubmit', function() {

    describe('when allowEmptyResponses = true', function() {

      beforeEach(function() {
        scope.evaluateOptions.allowEmptyResponses = true;
      });

      it('should return true', function() {
        expect(scope.canSubmit()).toBe(true);
      });
    });

    describe('when allowEmptyResponses = false and hasEmptyAnswers = false', function() {
      beforeEach(function() {
        scope.evaluateOptions.allowEmptyResponses = false;
        hasEmptyAnswers = false;
      });

      it('should return true', function() {
        expect(scope.canSubmit()).toBe(true);
      });
    });

    describe('when allowEmptyAnswers = false and hasEmptyAnswers = true', function() {
      beforeEach(function() {
        scope.evaluateOptions.allowEmptyResponses = false;
        hasEmptyAnswers = true;
      });

      it('should return false', function() {
        expect(scope.canSubmit()).toBe(false);
      });
    });

  });

  describe('save', function() {

    beforeEach(function() {
      scope.save();
    });

    it('should call PlayerService.saveSession', function() {
      expect(mockSaveSession).toHaveBeenCalled();
    });

  });

  describe('loadOutcome', function() {

    beforeEach(function() {
      scope.loadOutcome();
    });

    it('should call PlayerService.loadOutcome', function() {
      expect(mockLoadOutcome).toHaveBeenCalled();
    });

  });

  describe('onOutcomeLoaded', function() {
    var outcome = {this: 'is', the: 'outcome!'}, score = 1337;
    var data = {
      outcome: outcome,
      score: score
    };

    beforeEach(function() {
      scope.onOutcomeLoaded(data);
    });

    it('should set the outcome on the scope', function() {
      expect(scope.outcome).toBe(outcome);
    });

    it('should set the score on the scope', function() {
      expect(scope.score).toBe(score);
    });

  });

  describe('loadOutcomeError', function() {
    var error = "This is an error! It's serious!";

    beforeEach(function() {
      scope.loadOutcomeError(error);
    });

    it('should $log the error', function() {
      expect(mockError).toHaveBeenCalledWith(error);
    });

  });

  describe('completeResponse', function() {

    beforeEach(function() {
      scope.completeResponse();
    });

    it('should call PlayerService.loadOutcome', function() {
      expect(mockCompleteResponse).toHaveBeenCalled();
    });
  });

  describe('onSessionSaved', function() {
    var session = {looks: 'like', we: 'have', a: 'session'};

    beforeEach(function() {
      scope.onSessionSaved(session);
    });

    it('should set the session on the scope', function() {
      expect(scope.session).toBe(session);
    });

  });

  describe('updateSession', function() {
    var isFinished = true;
    var remainingAttempts = 3;
    var data = {
      session: {
        isFinished: isFinished,
        remainingAttempts: remainingAttempts
      }
    };

    beforeEach(function() {
      scope.session = {};
      scope.model = { session: { isFinished: isFinished } };
      scope.updateSession(data);
    });

    it('should set session.remainingAttempts', function() {
      expect(scope.session.remainingAttempts).toBe(remainingAttempts);
    });

    it('should set session.isFinished', function() {
      expect(scope.session.isFinished).toBe(isFinished);
    });

    it('should $broadcast a session-finished event', function() {
      expect(scope.$broadcast).toHaveBeenCalledWith("session-finished", isFinished);
    });

  });

  describe('onSessionLoadError', function() {
    var error = "This is an error! It's serious!";

    beforeEach(function() {
      scope.onSessionLoadError(error);
    });

    it('should $log.warn the error', function() {
      expect(mockWarn).toHaveBeenCalledWith('Error loading session', error);
    });

  });

  describe('onSessionResetError', function() {
    var error = "This is an error! It's serious!";

    beforeEach(function() {
      scope.onSessionResetError(error);
    });

    it('should $log.warn the error', function() {
      expect(mockWarn).toHaveBeenCalledWith('Error resetting session', error);
    });

  });

  describe('onSessionSaveError', function() {
    var error = "This is an error! It's serious!";

    beforeEach(function() {
      scope.onSessionSaveError(error);
    });

    it('should $log.warn the error', function() {
      expect(mockWarn).toHaveBeenCalledWith('Error saving session', error);
    });

  });

  describe('onItemAndSessionLoaded', function() {
    var data = {
      item: { this: 'is', an: 'item'},
      session: { isComplete: false }
    };

    beforeEach(function() {
      scope.onItemAndSessionLoaded(data);
    });

    it('should set scope.rootModel to data', function() {
      expect(scope.rootModel).toBe(data);
    });

    it('should set scope.item to be data.item', function() {
      expect(scope.item).toBe(data.item);
    });

    it('should set scope.session to be data.session', function() {
      expect(scope.session).toBe(data.session);
    });

    it('should set scope.isComplete to be data.session.isComplete', function() {
      expect(scope.session.isComplete).toBe(data.session.isComplete);
    });

    it('should $emit a session-loaded event', function() {
      expect(scope.$emit).toHaveBeenCalledWith('session-loaded', data.session);
    });

  });

  describe('onSessionReopenSuccess', function() {
    var session = {looks: 'like', we: 'have', a: 'session'};

    beforeEach(function() {
      scope.outcome = {};
      scope.score = 1337;
      scope.isComplete = true;
      scope.onSessionReopenSuccess(session);
    });

    it('should $log.info', function() {
      expect(mockInfo).toHaveBeenCalledWith('onSessionReopenSuccess', session);
    });

    it('should set scope.session to be session', function() {
      expect(scope.session).toBe(session);
    });

    it('should set outcome to be undefined', function() {
      expect(scope.outcome).toBeUndefined();
    });

    it('should set score to be undefined', function() {
      expect(scope.score).toBeUndefined();
    });

    it('should set isComplete to false', function() {
      expect(scope.isComplete).toBe(false);
    });

    it('should reset component register', function() {
      expect(mockReset).toHaveBeenCalled();
    });

  });

  describe('onSessionResetSuccess', function() {
    var session = {looks: 'like', we: 'have', a: 'session'};

    beforeEach(function() {
      scope.outcome = {};
      scope.score = 1337;
      scope.onSessionResetSuccess(session);
    });

    it('should $log.info', function() {
      expect(mockInfo).toHaveBeenCalledWith('onSessionResetSuccess', session);
    });

    it('should set scope.session to be session', function() {
      expect(scope.session).toBe(session);
    });

    it('should set outcome to be undefined', function() {
      expect(scope.outcome).toBeUndefined();
    });

    it('should set score to be undefined', function() {
      expect(scope.score).toBeUndefined();
    });

    it('should set isComplete to false', function() {
      expect(scope.isComplete).toBe(false);
    });

    it('should reset component register', function() {
      expect(mockReset).toHaveBeenCalled();
    });

  });

  describe('initialise event', function() {
    var data = {
      queryParams: 'these are some sweet query params'
    };

    beforeEach(function() {
      scope.$emit('initialise', data);
    });

    it('should call PlayerService.loadItemAndSession', function() {
      expect(mockLoadItemAndSession).toHaveBeenCalled();
    });

  });


  describe('reopenSession event', function() {

    beforeEach(function() {
      scope.$emit('reopenSession');
    });

    it('should call PlayerService.reopenSession', function() {
      expect(mockReopenSession)
        .toHaveBeenCalledWith(scope.onSessionReopenSuccess, scope.onSessionReopenError, scope.sessionId);
    });

  });

  describe('resetSession event', function() {

    beforeEach(function() {
      scope.$emit('resetSession');
    });

    it('should call PlayerService.resetSession', function() {
      expect(mockResetSession)
        .toHaveBeenCalledWith(scope.onSessionResetSuccess, scope.onSessionResetError, scope.sessionId);
    });

  });

  describe('saveResponses event', function() {
    var data = {
      isAttempt: false,
      isComplete: false
    };

    var callback = function() {};

    beforeEach(function() {
      spyOn(scope, 'save');
      scope.$emit('saveResponses', data, callback);
    });

    it('should call save', function() {
      expect(scope.save).toHaveBeenCalledWith(data.isAttempt, data.isComplete, callback);
    });

  });

  describe('countAttempts event', function() {
    var callback = jasmine.createSpy('callback');
    var session = {
      attempts: ['look', 'at', 'all', 'these', 'attempts!']
    };

    it("should call callback with session's attempts", function() {
      scope.session = session;
      scope.$emit('countAttempts', {}, callback);
      expect(callback).toHaveBeenCalledWith(null, scope.session.attempts);
    });

    it("should return 0, when session is not defined", function() {
      scope.session = undefined;
      scope.$emit('countAttempts', {}, callback);

      expect(callback).toHaveBeenCalledWith(null, 0);
    });

    it("should return 0, when session.attempts is undefined", function() {
      scope.session = {};
      scope.$emit('countAttempts', {}, callback);

      expect(callback).toHaveBeenCalledWith(null, 0);
    });

    it("should return 0, when session.attempts is null", function() {
      scope.session = {attempts: null};
      scope.$emit('countAttempts', {}, callback);

      expect(callback).toHaveBeenCalledWith(null, 0);
    });

    it("should return 0, when session.attempts is NaN", function() {
      scope.session = {attempts: Number.NaN};
      scope.$emit('countAttempts', {}, callback);

      expect(callback).toHaveBeenCalledWith(null, 0);
    });

  });

  describe('getScore event', function() {
    var data = {};
    var score = -1;
    var callback = function(err, result) {
      score = result;
    };

    beforeEach(function() {
      scope.$emit('getScore', data, callback);
    });

    it('should call PlayerService.getScore', function() {
      expect(mockGetScore).toHaveBeenCalled();
    });

    it('should return 0 when PlayerService.getScore returns an error', function() {
      expect(score).toBe(-1); //before the error callback has been called
      mockGetScore.calls.mostRecent().args[2]("ERROR");
      expect(score).toBe(0);
    });

  });

  describe('completeResponse event', function() {
    var callback = function() {};

    beforeEach(function() {
      spyOn(scope, 'completeResponse');
      scope.$emit('completeResponse', {}, callback);
    });

    it('should call completeResponse with callback', function() {
      expect(scope.completeResponse).toHaveBeenCalledWith(callback);
    });

  });

  describe('isComplete event', function() {
    var callback = jasmine.createSpy('callback');

    it('should call callback with false', function() {
      scope.$emit('isComplete', {}, callback);
      expect(callback).toHaveBeenCalledWith(null, false);
    });

    describe('isComplete is true', function() {
      it('should call callback with true', function() {
        scope.isComplete = true;
        scope.$emit('isComplete', {}, callback);
        expect(callback).toHaveBeenCalledWith(null, true);
      });
    });

    afterEach(function() {
      callback.calls.reset();
    });

  });

  describe('getSessionStatus event', function() {
    var callback = jasmine.createSpy('callback');

    beforeEach(function() {
      scope.$emit('getSessionStatus', {}, callback);
    });

    it('should call callback with session status', function() {
      expect(callback).toHaveBeenCalledWith(null, {
        allInteractionsHaveResponse: !hasEmptyAnswers,
        interactionCount: interactionCount,
        interactionsWithResponseCount: interactionsWithResponseCount
      });
    });

  });

  describe('editable event', function() {
    var data = {
      editable: true
    };

    beforeEach(function() {
      scope.$emit('editable', data);
    });

    it('should call ComponentRegister.setEditable with data.editable', function() {
      expect(mockSetEditable).toHaveBeenCalledWith(data.editable);
    });

  });

  describe('setMode event', function() {

    describe('data.saveResponses = true', function() {
      var data = {
        mode: "gather",
        saveResponses: true
      };

      beforeEach(function() {
        spyOn(scope, 'save');
        scope.$emit('setMode', data);
      });

      it('should call save', function() {
        expect(scope.save).toHaveBeenCalled();
      });

    });

    describe('data.saveResponses = false and mode is not evaluate', function() {
      var data = {
        mode: "gather",
        saveResponses: false
      };

      beforeEach(function() {
        spyOn(scope, 'save');
        spyOn(scope, 'loadOutcome');
        scope.outcome = {these: 'are', some: 'outcomes'};
        scope.$emit('setMode', data);
      });

      it('should not call save', function() {
        expect(scope.save).not.toHaveBeenCalled();
      });

      it('should not load outcomes', function() {
        expect(scope.loadOutcome).not.toHaveBeenCalled();
      });

      it('should set all outcomes to {}', function() {
        _.forIn(scope.outcome, function(value) {
          expect(value).toEqual({});
        });
      });

      it('should set score to {}', function() {
        expect(scope.score).toEqual({});
      });

    });

    describe('data.saveResponses = false and mode is evaluate', function() {
      var data = {
        mode: "evaluate",
        saveResponses: false
      };

      beforeEach(function() {
        spyOn(scope, 'save');
        spyOn(scope, 'loadOutcome');
        scope.outcome = {these: 'are', some: 'outcomes'};
        scope.$emit('setMode', data);
        timeout.flush();
      });

      it('should not call save', function() {
        expect(scope.save).not.toHaveBeenCalled();
      });

      it('should load outcomes', function() {
        expect(scope.loadOutcome).toHaveBeenCalled();
      });

    });

  });

});