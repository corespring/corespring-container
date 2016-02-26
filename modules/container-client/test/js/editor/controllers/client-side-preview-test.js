describe('ClientSidePreview', function() {

  var scope, element, imagePath = '/image-path';

  var mockSubmitSession = jasmine.createSpy('submitSession');

  function ClientSidePlayerService() {
    this.submitSession = mockSubmitSession;
  }

  var componentSessions = {
    'these': 'are',
    'some': 'sessions'
  };

  var ComponentData = {
    getSessions: jasmine.createSpy('getSessions').and.returnValue(componentSessions),
    setMode: jasmine.createSpy('setMode'),
    setEditable: jasmine.createSpy('setEditable'),
    reset: jasmine.createSpy('reset')
  };

  afterEach(function() {
    mockSubmitSession.calls.reset();
    ComponentData.getSessions.calls.reset();
    ComponentData.setMode.calls.reset();
    ComponentData.setEditable.calls.reset();
    ComponentData.reset.calls.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('ComponentData', ComponentData);
    $provide.value('ClientSidePlayerService', ClientSidePlayerService);
    $provide.constant('STATIC_PATHS', {
      assets: imagePath
    });
    $provide.constant('EDITOR_EVENTS', {
      CONTENT_ADDED_TO_EDITOR: 'content.added.to.editor'
    });
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="ClientSidePreview"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {
    var defaultSettings = {
      maxNoOfAttempts: 1,
      highlightUserResponse: true,
      highlightCorrectResponse: true,
      showFeedback: true,
      allowEmptyResponses: false
    };

    it('should set playerMode to gather', function() {
      expect(scope.playerMode).toEqual('gather');
    });

    it('should set playerSettings to default', function() {
      expect(scope.playerSettings).toEqual(defaultSettings);
    });

    it('should set score to NaN', function() {
      expect(scope.score).toEqual(NaN);
    });

    it('should set responses to empty object', function() {
      expect(scope.responses).toEqual({});
    });

    it('should set session to 1 remaining attempt with default settings', function() {
      expect(scope.session).toEqual({
        remainingAttempts: 1,
        settings: defaultSettings
      });
    });

  });

  describe('playerControlPanel.submit event', function() {

    describe('gather mode', function() {
      beforeEach(function() {
        scope.playerMode = 'gather';
        scope.$broadcast('playerControlPanel.submit');
      });

      it('should submit session', function() {
        expect(mockSubmitSession).toHaveBeenCalledWith({
          components: componentSessions
        }, jasmine.any(Function), jasmine.any(Function));
      });
    });

    describe('not gather mode', function() {
      beforeEach(function() {
        scope.playerMode = 'not gather';
        scope.$broadcast('playerControlPanel.submit');
      });

      it('should set mode to gather', function() {
        expect(scope.playerMode).toEqual('gather');
        expect(ComponentData.setMode).toHaveBeenCalledWith('gather');
      });

      it('should set ComponentData to editable', function() {
        expect(ComponentData.setEditable).toHaveBeenCalledWith(true);
      });

      it('should not submit session', function() {
        expect(mockSubmitSession).not.toHaveBeenCalled();
      });
    });

  });

  describe('playerControlPanel.reset event', function() {
    beforeEach(function() {
      scope.session = {
        isComplete: true,
        remainingAttempts: 0
      };
      scope.score = 1234;
      scope.outcome = {};
      scope.responses = {
        'these': 'are',
        'some': 'responses'
      };
      scope.$broadcast('playerControlPanel.reset');
    });

    it('should set session.isComplete to false', function() {
      expect(scope.session.isComplete).toBe(false);
    });

    it('should set session.remainingAttempts to 1', function() {
      expect(scope.session.remainingAttempts).toEqual(1);
    });

    it('should set score to be undefined', function() {
      expect(scope.score).toBeUndefined();
    });

    it('should set outcome to be undefined', function() {
      expect(scope.outcome).toBeUndefined();
    });

    it('should set responses to be empty object', function() {
      expect(scope.responses).toEqual({});
    });

    it('should call ComponentData.reset', function() {
      expect(ComponentData.reset).toHaveBeenCalled();
    });

    it('should set mode to gather', function() {
      expect(scope.playerMode).toEqual('gather');
      expect(ComponentData.setMode).toHaveBeenCalledWith('gather');
    });

    it('should set ComponentData to editable', function() {
      expect(ComponentData.setEditable).toHaveBeenCalledWith(true);
    });

  });

  describe('editor.click event', function() {

    describe('gather mode', function() {
      beforeEach(function() {
        scope.playerMode = 'gather';
        scope.$broadcast('editor.click');
      });

      it('should not call ComponentData.reset', function() {
        expect(ComponentData.reset).not.toHaveBeenCalled();
      });
    });

    describe('not gather mode', function() {
      beforeEach(function() {
        scope.playerMode = 'not gather';
        scope.$broadcast('editor.click');
      });

      it('should set session.isComplete to false', function() {
        expect(scope.session.isComplete).toBe(false);
      });

      it('should set session.remainingAttempts to 1', function() {
        expect(scope.session.remainingAttempts).toEqual(1);
      });

      it('should set score to be undefined', function() {
        expect(scope.score).toBeUndefined();
      });

      it('should set outcome to be undefined', function() {
        expect(scope.outcome).toBeUndefined();
      });

      it('should set responses to be empty object', function() {
        expect(scope.responses).toEqual({});
      });

      it('should call ComponentData.reset', function() {
        expect(ComponentData.reset).toHaveBeenCalled();
      });

      it('should set mode to gather', function() {
        expect(scope.playerMode).toEqual('gather');
        expect(ComponentData.setMode).toHaveBeenCalledWith('gather');
      });

      it('should set ComponentData to editable', function() {
        expect(ComponentData.setEditable).toHaveBeenCalledWith(true);
      });
    });

  });

  describe('content.added.to.editor event', function() {

    describe('gather mode', function() {
      beforeEach(inject(function(EDITOR_EVENTS) {
        scope.$broadcast(EDITOR_EVENTS.CONTENT_ADDED_TO_EDITOR);
      }));
      it('should set mode to gather', function() {
        expect(scope.playerMode).toEqual('gather');
        expect(ComponentData.setMode).toHaveBeenCalledWith('gather');
      });
    });
  });

  describe('component-editor.item-changed', function() {

    beforeEach(function() {
      scope.playerMode = 'not gather';
      scope.responses = "responses";
      scope.score = 100;
      scope.$broadcast('component-editor.item-changed');
    });

    it('should set session.isComplete to false', function() {
      expect(scope.session.isComplete).toBe(false);
    });

    it('should set session.remainingAttempts to 1', function() {
      expect(scope.session.remainingAttempts).toEqual(1);
    });

    it('should set score to be undefined', function() {
      expect(scope.score).toBeUndefined();
    });

    it('should set outcome to be undefined', function() {
      expect(scope.outcome).toBeUndefined();
    });

    it('should set responses to be empty object', function() {
      expect(scope.responses).toEqual({});
    });

    it('should call ComponentData.reset', function() {
      expect(ComponentData.reset).toHaveBeenCalled();
    });

    it('should set mode to gather', function() {
      expect(scope.playerMode).toEqual('gather');
      expect(ComponentData.setMode).toHaveBeenCalledWith('gather');
    });

    it('should set ComponentData to editable', function() {
      expect(ComponentData.setEditable).toHaveBeenCalledWith(true);
    });

  });

});