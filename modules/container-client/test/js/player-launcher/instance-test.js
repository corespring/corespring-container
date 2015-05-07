describe('instance', function() {

  var InstanceDef, instance, receivedErrors, listeners, mockResult;
  var originalRootLevelListenerDef, originalPostMessage;

  var originalMsgr;

  var sessionUrl = '/session/create';
  var newSessionId = "554b66965d9ea8325264833b";

  var baseUrl = "http://corespring.org";

  var log = {
    error: function(s) {
      console.error(s);
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

  function MockChannel() {
    console.log('new MockChannel');
    this.send = function(){
      console.log('mock:send', arguments);
      var args = Array.prototype.slice.call(arguments);
      var callback = typeof(args[1] === 'function') ? args[1] : args[2];
      callback(null, mockResult);
    };
    this.on = function(){
      console.log('mock:on', arguments);
    };

    this.remove = function(){};
  }

  var ID = 'element-id';

  beforeEach(function() {
    var element = $('<div id="' + ID + '"></div>');
    $('body').append(element);
    originalMsgr = window.msgr;
    window.msgr.Channel = MockChannel;

    InstanceDef = new corespring.require("instance");
    receivedErrors = [];

    var session = {"_id" : { "$oid" : newSessionId } };
    $.mockjax({
      url: sessionUrl,
      responseText: JSON.stringify(session)
    });
  });

  afterEach(function() {
    window.msgr.Channel = originalMsgr.Channel;
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
      url: baseUrl
    }, onError);
    expect(hasError()).toBeTruthy();
  });

  it('should have a sendMessage method', function() {
    instance = new InstanceDef('#' + ID, {}, onError);
    expect(instance.hasOwnProperty('send')).toBeTruthy();
  });

  it('should not set the width if forceWidth is false', function() {

    instance = new InstanceDef('#' + ID, {
      sessionUrl: sessionUrl,
      url: baseUrl
    });
    expect($('#' + ID)[0].style.width).toBe('');
  });

  it('should set the width if forceWidth is true', function() {

    instance = new InstanceDef('#' + ID, {
      sessionUrl: sessionUrl,
      url: baseUrl,
      forceWidth: true
    });
    expect($('#' + ID)[0].style.width).toBe('600px');
  });

  it('should set the custom width if forceWidth is true', function() {

    instance = new InstanceDef('#' + ID, {
      sessionUrl: sessionUrl,
      url: baseUrl,
      forceWidth: true,
      width: '11px'
    });
    expect($('#' + ID)[0].style.width).toBe('11px');
  });

  it('should be able to send a message', function() {

    instance = new InstanceDef('#' + ID, {sessionUrl: sessionUrl, url: 'http://blah.com'}, onError);
    var resultFromCallback = null;
    var callback = function(err, result) {
      resultFromCallback = result;
    };
    mockResult = true;

    expect(receivedErrors.length).toBe(0);
    instance.send("isComplete", callback);
    expect(resultFromCallback).toBe(true);
  });

});