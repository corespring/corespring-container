describe('passage', function() {

  beforeEach(angular.mock.module('corespring-editing.directives'));


  var Msgr = {
    on: jasmine.createSpy('on'),
    send: jasmine.createSpy('send')
  };

  var ModalOpenDispatcher = {
    setListener: jasmine.createSpy('setListener')
  };

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('ModalOpenDispatcher', ModalOpenDispatcher);
      $provide.value('Msgr', Msgr);
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    var scope = $rootScope.$new();
    var element = angular.element('<div modal-positioner=""></div>');
    $compile(element)(scope);
  }));

  it('should call ModalOpenDispatcher.setListener(func)', function() {
    expect(ModalOpenDispatcher.setListener).toHaveBeenCalledWith(jasmine.any(Function));
  });

  describe('onModalOpened', function(){
    var onModalOpened, jqueryModal, pos;

    beforeEach(function(){
      onModalOpened = ModalOpenDispatcher.setListener.calls.mostRecent().args[0];
      Msgr.send.calls.reset();
      jqueryModal = {offset: jasmine.createSpy('offset')};
      onModalOpened(jqueryModal);
      var getScrollPositionCallback = Msgr.send.calls.mostRecent().args[1];
      pos = {top: 5};
      getScrollPositionCallback(null, pos);
    });

    it('should retrieve the scrollPosition', function(){
      expect(Msgr.send).toHaveBeenCalledWith('getScrollPosition', jasmine.any(Function));
    });

    it('should set the position of the modal to the value of getScrollPosition', function(){
      expect(jqueryModal.offset).toHaveBeenCalledWith({top: pos.top});
    });
  });

});