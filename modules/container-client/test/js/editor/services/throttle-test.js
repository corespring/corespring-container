describe('throttle', function() {

  var injectedThrottle;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(inject(function(throttle) {
    injectedThrottle = throttle;
  }));

  it('should init', function() {
    expect(_.isFunction(injectedThrottle)).toBe(true);
  });

  it('should return a function', function() {
    expect(_.isFunction(injectedThrottle(function(){}))).toBe(true);
  });
});