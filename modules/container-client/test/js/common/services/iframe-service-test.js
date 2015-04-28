describe('iFrameService', function() {

  var IFrameService;
  var location = {search:""};

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(module(function($provide) {
    $provide.value('$window', {
      location: location
    });
  }));

  beforeEach(inject(function(iFrameService) {
    IFrameService = iFrameService;
  }));

  describe('isInIFrame', function() {

    describe('top == window', function() {
      var _top = "window";
      var _window = "window";

      it('should return false', function() {
        expect(IFrameService.isInIFrame(_top, _window)).toBe(false);
      });
    });

    describe('top != window', function() {
      var _top = "top";
      var _window = "window";

      it('should return true', function() {
        expect(IFrameService.isInIFrame(_top, _window)).toBe(true);
      });
    });

  });

  describe('bypassIframeLaunchMechanism', function() {

    it('should return true when search is set', function() {
      location.search = "bypass-iframe-launch-mechanism";
      expect(IFrameService.bypassIframeLaunchMechanism()).toBe(true);
    });

    it('should return false  when search is not set', function() {
      location.search = "something else";
      expect(IFrameService.bypassIframeLaunchMechanism()).toBe(false);
    });

  });

});