describe('MessageBridge', function() {

  var messageBridge;

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(function() {

  });

  beforeEach(inject(function(MessageBridge) {
    messageBridge = MessageBridge;
  }));

  describe('addMessageListener', function() {
    var listener = jasmine.createSpy('listener');

    describe('window.addEventListener is defined', function() {

      beforeEach(function() {
        spyOn(window, 'addEventListener');
        messageBridge.addMessageListener(listener);
      });

      it('should call addEventListener with message', function() {
        expect(window.addEventListener).toHaveBeenCalledWith('message', jasmine.any(Function), false);
      });

    });

    describe('window.addEventListener is not defined', function() {

      beforeEach(function() {
        window.addEventListener = undefined;
        window.attachEvent = jasmine.createSpy('attachEvent');
        messageBridge.addMessageListener(listener);
      });

      it('should call attachEvent with onmessage', function() {
        expect(window.attachEvent).toHaveBeenCalledWith('onmessage', jasmine.any(Function), false);
      });

    });

  });

  describe('sendMessage', function() {
    var message = {some: 'kind', of: 'message'};
    var postMessage = jasmine.createSpy('postMessage');

    describe('id parent', function() {

      var id = 'parent';

      beforeEach(function() {
        window.parent = {
          postMessage: postMessage
        };
        messageBridge.sendMessage('parent', message);
      });

      it('should call postMessage on parent with message', function() {
        expect(postMessage).toHaveBeenCalledWith(JSON.stringify(message), "*");
      });

    });

    describe('id not parent', function() {

      var id = 'not parent';

      beforeEach(function() {
        spyOn(document, 'getElementById').and.returnValue({
          contentWindow: {
            postMessage: postMessage
          }
        });
        messageBridge.sendMessage('parent', message);
      });

      it('should call postMessage on iframe with message', function() {
        expect(postMessage).toHaveBeenCalledWith(JSON.stringify(message), "*");
      });

    });

  });

});