describe('playerControlPanel', function() {

  var rootScope, compile;

  beforeEach(angular.mock.module('corespring-player.directives'));

  beforeEach(inject(function($rootScope, $compile) {
    rootScope = $rootScope;
    compile = $compile;
  }));

  describe('initial state', function() {
    var scope, element;

    beforeEach(function() {
      scope = rootScope.$new();
      element = compile('<div player-control-panel=""></div>')(scope);
      scope = element.isolateScope();
      scope.$digest();
    });

    it('should set defaults for settingsEnabled', function() {
      expect(scope.settingsEnabled).toEqual({
        maxNoOfAttempts: true,
        highlightUserResponse: true,
        highlightCorrectResponse: true,
        showFeedback: true,
        allowEmptyResponses: false
      });
    });

    it('should set defaults for playerButtonSettings', function() {
      expect(scope.playerButtonSettings).toEqual({
        "class": "btn action submit", "text": "Submit Answer", "mode": "gather"
      });
    });

  });

  describe('showSettingsButton attribute', function() {

    describe('undefined', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel=""></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should hide settings', function() {
        expect($('.settings-holder', element).hasClass('ng-hide')).toBe(true);
      });

    });

    describe('true', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel="" show-settings-button="true"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should show settings', function() {
        expect($('.settings-holder', element).hasClass('ng-hide')).toBe(false);
      });

    });

    describe('false', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel="" show-settings-button="false"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should hide settings', function() {
        expect($('.settings-holder', element).hasClass('ng-hide')).toBe(true);
      });

    });

  });

  describe('show-submit-button attribute', function() {

    describe('undefined', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel=""></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      xit('should show submit button', function() {
        expect($('.submit-button-holder', element).hasClass('ng-hide')).toBe(false);
      });

    });

    describe('true', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel="" show-submit-button="true"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should show submit button', function() {
        expect($('.submit-button-holder', element).hasClass('ng-hide')).toBe(false);
      });

    });

    describe('false', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel="" show-submit-button="false"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should hide submit button', function() {
        expect($('.submit-button-holder', element).hasClass('ng-hide')).toBe(true);
      });

    });

  });

  describe('show-score attribute', function() {

    describe('undefined', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        element = compile('<div player-control-panel=""></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should show score', function() {
        expect($('.score-holder', element).hasClass('ng-hide')).toBe(false);
      });

    });

    describe('true', function() {
      var element, scope;

      beforeEach(function() {
        var scope = rootScope.$new();
        element = compile('<div player-control-panel="" show-score="true"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should show score', function() {
        expect($('.score-holder', element).hasClass('ng-hide')).toBe(false);
      });

    });

    describe('false', function() {
      var element, scope;

      beforeEach(function() {
        var scope = rootScope.$new();
        element = compile('<div player-control-panel="" show-score="false"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should show score', function() {
        expect($('.score-holder', element).hasClass('ng-hide')).toBe(true);
      });

    });

  });

  describe('updatePlayer', function() {
    var scope, element;

    beforeEach(function() {
      scope = rootScope.$new();
      element = compile('<div player-control-panel=""></div>')(scope);
      scope = element.isolateScope();
      spyOn(scope, '$emit');
    });

    describe("mode === 'evaluate'", function() {
      beforeEach(function() {
        scope.playerButtonSettings.mode = 'evaluate';
        scope.updatePlayer();
      });

      it('should $emit a reset event', function() {
        expect(scope.$emit).toHaveBeenCalledWith('playerControlPanel.reset');
      });

      xit('should set playerButtonSettings to submit', function() {
        expect(scope.playerButtonSettings).toEqual({
          "class": "btn action submit", "text": "Submit Answer", "mode": "gather"
        });
      });

    });

    describe("mode !== 'evaluate'", function() {
      beforeEach(function() {
        scope.playerButtonSettings.mode = 'gather';
        scope.updatePlayer();
      });

      it('should $emit a submit event', function() {
        expect(scope.$emit).toHaveBeenCalledWith('playerControlPanel.submit');
      });

      it('should set playerButtonSettings to reset', function() {
        expect(scope.playerButtonSettings).toEqual({
          "class": "btn action reset", "text": "    Reset    ", "mode": "evaluate"
        });
      });

    });

  });

  describe('preview', function() {
    var scope, element;

    beforeEach(function() {
      scope = rootScope.$new();
      element = compile('<div player-control-panel=""></div>')(scope);
      scope = element.isolateScope();
      spyOn(scope, '$emit');
      scope.preview();
    });

    it('should $emit a playerControlPanel.preview event', function() {
      expect(scope.$emit).toHaveBeenCalledWith('playerControlPanel.preview');
    });

  });

  describe('settingsChange', function() {
    var scope, element;

    beforeEach(function() {
      scope = rootScope.$new();
      element = compile('<div player-control-panel=""></div>')(scope);
      scope = element.isolateScope();
      spyOn(scope, '$emit');
      scope.settingsChange();
    });

    it('should $emit a playerControlPanel.settingsChange event', function() {
      expect(scope.$emit).toHaveBeenCalledWith('playerControlPanel.settingsChange');
    });

  });

  describe('hasScore', function() {

    describe('scope.score is undefined', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        scope.score = undefined;
        element = compile('<div player-control-panel="" score="score"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should be false', function() {
        expect(scope.hasScore()).toBe(false);
      });
    });

    describe('scope.score is defined and scope.score.summary is undefined', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        scope.score = {
          summary: undefined
        };
        element = compile('<div player-control-panel="" score="score"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should be false', function() {
        expect(scope.hasScore()).toBe(false);
      });
    });

    describe('scope.score is defined and scope.score.summary is defined', function() {
      var scope, element;

      beforeEach(function() {
        scope = rootScope.$new();
        scope.score = {
          summary: {}
        };
        element = compile('<div player-control-panel="" score="score"></div>')(scope);
        scope = element.isolateScope();
        scope.$digest();
      });

      it('should be true', function() {
        expect(scope.hasScore()).toBe(true);
      });

    });

  });

});