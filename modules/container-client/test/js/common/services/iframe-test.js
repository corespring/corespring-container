describe('iFrameService', function() {

  var IFrameService;

  beforeEach(angular.mock.module('corespring-common.services'));

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

});