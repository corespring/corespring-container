describe('corespringDemoPlayer', function() {

  var scope, element;

  var componentSessions = {};

  beforeEach(angular.mock.module('corespring-player.directives'));

  function MockLog() {
    this.debug = {
      bind: function() {
      }
    };
    this.info = function(){};
  }

  var mockSubmitSession = jasmine.createSpy('submitSession').and.callFake(function(){
    var onSuccess = mockSubmitSession.calls.mostRecent().args[1];
    onSuccess({score: {summary: {percentage: 75}}});
  });
  var mockSetMode = jasmine.createSpy('setMode');
  var mockSetEditable = jasmine.createSpy('setEditable');
  var mockReset = jasmine.createSpy('reset');

  function MockPlayerService() {
    this.submitSession = mockSubmitSession;
  }

  function MockComponentRegister() {
    this.setMode = mockSetMode;
    this.setEditable = mockSetEditable;
    this.getComponentSessions = function() {
      return componentSessions;
    };
    this.reset = mockReset;
  }

  function MockMathJaxService() {
  }

  beforeEach(module(function($provide) {
    $provide.value('$log', new MockLog());
    $provide.value('DemoComponentRegister', new MockComponentRegister());
    $provide.value('ClientSidePlayerService', MockPlayerService);
    $provide.value('MathJaxService', MockMathJaxService);
  }));

  beforeEach(inject(function($rootScope, $compile, $timeout) {
    scope = $rootScope.$new();
    element = $compile('<div corespring-demo-player=""></div>')(scope);
    scope = element.isolateScope();
    scope.$digest();
  }));

  function resetMocks() {
    mockSubmitSession.calls.reset();
    mockSetMode.calls.reset();
    mockSetEditable.calls.reset();
    mockReset.calls.reset();
  }

  afterEach(resetMocks);

  describe('initialization', function() {

    var defaultPlayerSettings = {
      maxNoOfAttempts: 1,
      highlightUserResponse: true,
      highlightCorrectResponse: true,
      showFeedback: true,
      allowEmptyResponses: false
    };

    it('should have playerMode set to gather', function() {
      expect(scope.playerMode).toEqual('gather');
    });

    it('should set default player settings', function() {
      expect(scope.playerSettings).toEqual(defaultPlayerSettings);
    });

    it('should set score to NaN', function() {
      expect(scope.score).toEqual(NaN);
    });

    it('should set responses to {}', function() {
      expect(scope.responses).toEqual({});
    });

    it('should set session', function() {
      expect(scope.session).toEqual({
        remainingAttempts: 1,
        settings: defaultPlayerSettings
      });
    });

    it('should set itemSession to be {}', function() {
      expect(scope.itemSession).toEqual({});
    });

  });

  describe('button label and class', function() {

    it('default button label in gather mode is Submit Answer', function() {
      scope.playerMode = 'gather';
      expect(scope.submitButtonLabel()).toEqual('submit answer');
    });

    it('default button label in view/eval mode is Reset', function() {
      scope.playerMode = 'evaluate';
      expect(scope.submitButtonLabel()).toEqual('reset');
      scope.playerMode = 'view';
      expect(scope.submitButtonLabel()).toEqual('reset');
    });

  });

  describe('submitOrReset', function() {

    describe("mode === 'gather'", function() {

      beforeEach(function() {
        scope.playerMode = 'gather';
        scope.submitOrReset();
      });

      it('should submit session', function() {
        expect(mockSubmitSession)
          .toHaveBeenCalledWith({components: componentSessions}, jasmine.any(Function), jasmine.any(Function));
      });

      it('should set the score', function() {
        expect(scope.score).toEqual({summary:{percentage: 75}});
      });

    });

    describe("mode !== 'gather'", function() {

      beforeEach(function() {
        scope.score = {};
        scope.outcome = {};
        scope.responses = undefined;
        scope.playerMode = 'evaluate';
        scope.session = {};
        scope.submitOrReset();
      });

      it('should set session.isComplete to false', function() {
        expect(scope.session.isComplete).toBe(false);
      });

      it('should set session.remainingAttempts to 1', function() {
        expect(scope.session.remainingAttempts).toEqual(1);
      });

      it('should call reset on ComponentRegister', function() {
        expect(mockReset).toHaveBeenCalled();
      });

      it('should set score to undefined', function() {
        expect(scope.score).toBeUndefined();
      });

      it('should set outcome to undefined', function() {
        expect(scope.outcome).toBeUndefined();
      });

      it('should set responses to {}', function() {
        expect(scope.responses).toEqual({});
      });

      it('should set mode to gather', function() {
        expect(scope.playerMode).toEqual('gather');
        expect(mockSetMode).toHaveBeenCalledWith('gather');
        expect(mockSetEditable).toHaveBeenCalledWith(true);
      });

    });
  });

});
