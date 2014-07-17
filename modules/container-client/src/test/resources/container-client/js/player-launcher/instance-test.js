describe('instance', function() {

  var InstanceDef, instance, receivedErrors, listeners, mockResult;
  var originalRootLevelListenerDef, originalPostMessage;

  var log = {
    error: function(s) {
      console.error(s);
    },
    debug: function(s) {
      console.debug(s);
    },
    warn: function(s) {
      console.warn(s);
    }
  };

  function onError(err) {
    receivedErrors.push(err);
  }

  function hasError() {
    return receivedErrors.length > 0;
  }

  function mockPostMessage(message, data, element) {
    //log.debug("postMessage <" + message + "> data <" + data + "> listeners.length <" + listeners.length + ">");

    function createResultEvent() {
      return {
        event: 'message',
        data: $.extend({
            message: message + "Result",
            data: data
          },
          mockResult)
      };
    }

    for (var i = 0; i < listeners.length; i++) {
      //invoke the listener within its own context.
      listeners[i].apply(listeners[i], [createResultEvent()]);
    }
  }

  function MockRootLevelListenerDef() {
    listeners = [];

    return {
      addListener: function(callback) {
        //log.debug("addListener " + callback);
        listeners.push(callback);
      },
      removeListener: function(callback) {
        var index = listeners.indexOf(callback);
        if (index >= 0) {
          listeners.slice(index, 1);
        }
      },
      clearListeners: function() {
        listeners = [];
      },
      listenerLength: function() {
        return listeners.length;
      }
    };
  }

  var ID = 'element-id';

  beforeEach(function() {

    var element = $('<div id="' + ID + '"></div>');
    $('body').append(element);
    originalPostMessage = corespring.require("post-message");
    originalRootLevelListenerDef = corespring.require("root-level-listener");

    corespring.module("post-message", mockPostMessage);
    corespring.module("root-level-listener", MockRootLevelListenerDef);

    InstanceDef = new corespring.require("instance");
    receivedErrors = [];
  });

  afterEach(function() {
    corespring.module("post-message", originalPostMessage);
    corespring.module("root-level-listener", originalRootLevelListenerDef);
    $('body').find('#' + ID).remove();
  });

  it('should have a InstanceDef', function() {
    expect(InstanceDef).toBeTruthy();
  });

  it('should be possible to create an instance', function() {
    instance = new InstanceDef('#' + ID, {}, function() {});
    expect(instance).toBeTruthy();
  });

  it('should report an error if options is missing', function() {
    instance = new InstanceDef('#' + ID, null, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should report an error if options.url is missing', function() {
    instance = new InstanceDef('#' + ID, {}, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should report an error if element cannot be found', function() {
    instance = new InstanceDef('#bad-' + ID, {
      url: "http://corespring.org"
    }, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should have a sendMessage method', function() {
    instance = new InstanceDef('#' + ID, {}, onError);
    expect(instance.hasOwnProperty('sendMessage')).toBeTruthy();
  });

  it('should not set the width if forceWidth is false', function() {

    instance = new InstanceDef('#' + ID, {
      url: "http://corespring.org"
    });
    expect($('#' + ID)[0].style.width).toBe('');
  });

  it('should set the width if forceWidth is true', function() {

    instance = new InstanceDef('#' + ID, {
      url: "http://corespring.org",
      forceWidth: true
    });
    expect($('#' + ID)[0].style.width).toBe('600px');
  });

  it('should set the custom width if forceWidth is true', function() {

    instance = new InstanceDef('#' + ID, {
      url: "http://corespring.org",
      forceWidth: true,
      width: '11px'
    });
    expect($('#' + ID)[0].style.width).toBe('11px');
  });

  it('should be able to send a message', function() {
    instance = new InstanceDef('#' + ID, {}, onError);
    var resultFromCallback = null;
    var callback = function(result) {
      resultFromCallback = result;
    };
    mockResult = {
      "isComplete": true
    };

    instance.sendMessage({
      message: "isComplete",
      property: "isComplete",
      callback: callback
    });

    expect(resultFromCallback).toBe(true);
  });


});