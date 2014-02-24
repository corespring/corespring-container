describe('instance', function () {

  var InstanceDef, instance, receivedErrors, listeners, expectedResult;
  var originalRootLevelListenerDef, originalPostMessage;

  var log = {
    error: function(s){ console.error(s); },
    debug: function(s){ console.debug(s); },
    warn: function(s){ console.warn(s); }
  };

  function onError (err) {
    receivedErrors.push(err);
  };

  function hasError() {
    return receivedErrors.length > 0
  }

  function mockPostMessage(message, data){
    //log.debug("postMessage <" + message + "> data <" + data + "> listeners.length <" + listeners.length + ">");

    function createResultEvent(){
      return {
        event:'message',
        data: $.extend ({
          message: message + "Result",
          data: data},
          expectedResult)
      }
    }

    for (var i = 0; i < listeners.length; i++) {
      //invoke the listener within its own context.
      listeners[i].apply(listeners[i], [createResultEvent()]);
    }
  }

  function MockRootLevelListenerDef(){
    listeners = [];

    return {
      addListener: function(callback){
        log.debug("addListener " + callback);
        listeners.push(callback);
      },
      removeListener: function(callback){
        var index = listeners.indexOf(callback);
        if( index >= 0){
          listeners.slice(index, 1);
        }
      },
      clearListeners: function(){
        listeners = [];
      },
      listenerLength: function(){
        return listeners.length;
      }
    }
  }

  function clearRootLevelListeners(){
    var listener = corespring.require("root-level-listener")();
    listener.clearListeners();
  }

  beforeEach(function () {
    originalPostMessage = corespring.require("post-message");
    originalRootLevelListenerDef = corespring.require("root-level-listener");

    corespring.module("post-message", mockPostMessage);
    corespring.module("root-level-listener", MockRootLevelListenerDef);

    InstanceDef = new corespring.require("instance");
    receivedErrors = [];
  });

  afterEach(function(){
    corespring.module("post-message", originalPostMessage);
    corespring.module("root-level-listener", originalRootLevelListenerDef);
  })

  it('should have a InstanceDef', function () {
    expect(InstanceDef).toBeTruthy();
  });

  it('should be possible to create an instance', function () {
    instance = new InstanceDef("element-id", {}, function () { });
    expect(instance).toBeTruthy();
  });

  it('should report an error if options is missing', function () {
    instance = new InstanceDef("element-id", null, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should report an error if options.url is missing', function () {
    instance = new InstanceDef("element-id", {}, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should report an error if element cannot be found', function () {
    instance = new InstanceDef("element-id", {url:"http://corespring.org"}, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should have a sendMessage method', function () {
    expect(instance.hasOwnProperty('sendMessage')).toBeTruthy();
  });

  it('should be able to send a message', function () {
    var resultFromCallback = null;
    var callback = function(result){
      resultFromCallback = result;
    }
    expectedResult = {"isComplete": true};

    instance.sendMessage({
      message: "isComplete",
      property: "isComplete",
      callback: callback
    });

    expect(resultFromCallback).toBe(true);
  });


});