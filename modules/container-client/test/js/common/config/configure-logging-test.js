describe('configureLogging', function() {

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-common.config'));

  var sut, provide;

  beforeEach(inject(function(configureLogging){
    sut = configureLogging;
    provide = {
      value: jasmine.createSpy('provide'),
      decorator: jasmine.createSpy('decorator')
    };
  }));


  describe('init', function() {

    it('should exist', function() {
      expect(_.isFunction(sut)).toBe(true);
    });

    it('should decorate LogFactory', function(){
      sut(provide);
      expect(provide.decorator).toHaveBeenCalledWith('LogFactory', jasmine.any(Function));
    });

    it('should decorate $log', function(){
      sut(provide);
      expect(provide.decorator).toHaveBeenCalledWith('$log', jasmine.any(Function));
    });

  });


});
