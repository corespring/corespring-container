describe('configure-modal-open-dispatcher', function() {

  var sut, provide;

  beforeEach(angular.mock.module('corespring-editing.config'));

  beforeEach(inject(function(configureModalOpenDispatcher){
    sut = configureModalOpenDispatcher;
    provide = {
      value: jasmine.createSpy('provide'),
      decorator: jasmine.createSpy('decorator')
    };

  }));

  describe('init', function() {

    it('should exist', function() {
      expect(_.isFunction(sut)).toBe(true);
    });

    it('should provide a ModalOpenDispatcher', function(){
      sut(provide);
      expect(provide.value).toHaveBeenCalledWith('ModalOpenDispatcher', jasmine.any(Object));
    });

    it('should decorate $modal', function(){
      sut(provide);
      expect(provide.decorator).toHaveBeenCalledWith('$modal', jasmine.any(Function));
    });

  });


});
