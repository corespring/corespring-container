describe('configModals', function() {

  var configModals = new corespring.require("config-modals");

  var provide = {
    value: jasmine.createSpy('provide'),
    decorator: jasmine.createSpy('decorator')
  };

  describe('init', function() {

    it('should exist', function() {
      expect(_.isFunction(configModals)).toBe(true);
    });

    it('should provide a ModalOpenDispatcher', function(){
      configModals(provide);
      expect(provide.value).toHaveBeenCalledWith('ModalOpenDispatcher', jasmine.any(Object));
    });

    it('should decorate $modal', function(){
      configModals(provide);
      expect(provide.decorator).toHaveBeenCalledWith('$modal', jasmine.any(Function));
    });

  });


});
