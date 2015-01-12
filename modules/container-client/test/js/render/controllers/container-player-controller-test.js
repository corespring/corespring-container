describe('corespring-player-controller', function() {

  var scope, element;

  beforeEach(angular.mock.module('corespring-player.controllers'));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="ContainerPlayerController"></div>')(scope);
    scope = element.scope();
    spyOn(scope, "$emit").and.callThrough();
    spyOn(scope, "$broadcast").and.callThrough();
  }));

  describe('playerControlPanel.submit event', function() {

    describe('mode is not gather', function() {

      beforeEach(function() {
        scope.playerMode = 'not gather';
        scope.$emit('playerControlPanel.submit');
      });

      it('should set mode to gather', function() {
        expect(scope.playerMode).toBe('gather');
        expect(scope.$broadcast).toHaveBeenCalledWith('setMode', {'mode' : 'gather'});
      });

    });

    describe('mode is gather', function() {

      beforeEach(function() {
        scope.playerMode = 'gather';
        scope.$emit('playerControlPanel.submit');
      });

      it('should set mode to evaluate and save responses', function() {
        expect(scope.playerMode).toBe('evaluate');
        expect(scope.$broadcast).toHaveBeenCalledWith('setMode', _.extend(
          { options : scope.playerSettings, saveResponses: { isAttempt: true, isComplete: true }},
          { mode : 'evaluate'})
        );
      });

    });

  });

  describe('playerControlPanel.preview event', function() {

    beforeEach(function() {
      scope.$emit('playerControlPanel.preview');
    });

    it('should $emit a launch-catalog-preview event', function() {
      expect(scope.$emit).toHaveBeenCalledWith('playerControlPanel.preview');
      expect(scope.$emit).toHaveBeenCalledWith('launch-catalog-preview');
    });

  });

  describe('playerControlPanel.reset event', function() {

    beforeEach(function() {
      scope.$emit('playerControlPanel.reset');
    });

    it('should $broadcast resetSession and set mode to gather', function() {
      expect(scope.$broadcast).toHaveBeenCalledWith('resetSession');
      expect(scope.playerMode).toBe('gather');
      expect(scope.$broadcast).toHaveBeenCalledWith('setMode', {'mode' : 'gather'});
    });

  });

  describe('playerControlPanel.settingsChange event', function() {

    describe('mode set to gather', function() {

      beforeEach(function() {
        scope.playerMode = "gather";
        scope.$emit('playerControlPanel.settingsChange');
      });

      it('should not change mode', function() {
        expect(scope.$broadcast).not.toHaveBeenCalled();
      });

    });

    describe('mode not set to gather', function() {

      beforeEach(function() {
        scope.playerMode = "not gather";
        scope.$emit('playerControlPanel.settingsChange');
      });

      it('should set mode to gather then set mode to evaluate with playerSettings', function() {
        expect(scope.$broadcast).toHaveBeenCalledWith('setMode', {'mode' : 'gather'});
        expect(scope.playerMode).toBe('evaluate');
        expect(scope.$broadcast).toHaveBeenCalledWith('setMode',
          _.extend({'options' : scope.playerSettings}, {'mode' : 'evaluate'}));
      });

    });

  });

  describe('initialise event', function() {

    describe('without data', function() {

      var playerMode;

      beforeEach(function() {
        playerMode = scope.playerMode;
        scope.$emit('initialise');
      });

      it('does not change the player mode', function() {
        expect(scope.playerMode).toBe(playerMode);
      });

    });

    describe('with data', function() {

      var data = {
        mode : 'new mode'
      };

      beforeEach(function() {
        scope.$emit('initialise', data);
      });

      it('sets player mode to data.mode', function() {
        expect(scope.playerMode).toBe(data.mode);
      });

    });

  });

});