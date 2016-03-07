describe('configure-tooltip-provider', function() {

  var sut, tooltipProvider;

  beforeEach(angular.mock.module('corespring-editing.config'));

  beforeEach(inject(function(configureTooltipProvider){
    sut = configureTooltipProvider;
    tooltipProvider = {
      setTriggers: jasmine.createSpy('setTriggers')
    };

  }));

  describe('init', function() {

    it('should exist', function() {
      expect(_.isFunction(sut)).toBe(true);
    });

    it('should call setTriggers', function(){
      sut(tooltipProvider);
      expect(tooltipProvider.setTriggers).toHaveBeenCalledWith(jasmine.any(Object));
    });

  });


});
