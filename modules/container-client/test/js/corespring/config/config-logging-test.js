describe('configLogging', function() {

  var configLogging = new corespring.require("config-logging");

  var provide = {
    value: jasmine.createSpy('provide'),
    decorator: jasmine.createSpy('decorator')
  };

  describe('init', function() {

    it('should exist', function() {
      expect(_.isFunction(configLogging)).toBe(true);
    });

    it('should decorate LogFactory', function(){
      configLogging(provide);
      expect(provide.decorator).toHaveBeenCalledWith('LogFactory', jasmine.any(Function));
    });

    it('should decorate $log', function(){
      configLogging(provide);
      expect(provide.decorator).toHaveBeenCalledWith('$log', jasmine.any(Function));
    });

  });


});
