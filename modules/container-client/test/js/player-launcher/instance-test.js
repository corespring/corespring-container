describe('instance', function() {

  var InstanceDef, instance, receivedErrors, listeners, mockResult;
  var originalRootLevelListenerDef, originalPostMessage;
  var originalMsgr;
  var sessionUrl = '/session/create';
  var newSessionId = "554b66965d9ea8325264833b";
  var baseUrl = "http://corespring.org";
  var errorCodes = corespring.require('error-codes');
  var onError = jasmine.createSpy('onError');

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

  var ID = 'instance-test-element-id';
  var call = { url: '/url'};

  beforeEach(function() {
    onError.calls.reset();
    var element = $('<div id="' + ID + '"></div>');
    $('body').append(element);
    originalMsgr = window.msgr;
    window.msgr.Channel = MockChannel;
    InstanceDef = new corespring.require("instance");
  });

  afterEach(function() {
    window.msgr.Channel = originalMsgr.Channel;
    $('body').find('#' + ID).remove();
  });

  it('should have a InstanceDef', function() {
    expect(InstanceDef).toBeTruthy();
  });

  it('should be possible to create an instance', function() {
    instance = new InstanceDef( call, '#' + ID, function() {});
    expect(instance).toBeTruthy();
  });
  
  it('should report an error if call is missing', function() {
    instance = new InstanceDef(null, '#' + ID, onError);
    expect(onError).toHaveBeenCalledWith(errorCodes.NO_URL_SPECIFIED);
  });

  it('should report an error if call.url is missing', function() {
    instance = new InstanceDef({}, '#' + ID, onError);
    expect(onError).toHaveBeenCalledWith(errorCodes.NO_URL_SPECIFIED);
  });

  it('should report an error if element cannot be found', function() {
    instance = new InstanceDef(call, '#bad-' + ID, onError);
    expect(onError).toHaveBeenCalled();
  });

  it('should have a sendMessage method', function() {
    instance = new InstanceDef(call, '#' + ID, onError);
    expect(instance.hasOwnProperty('send')).toBeTruthy();
  });


  describe('send', function(){
    it('should be able to send a message', function() {
      instance = new InstanceDef({url: '/url'}, '#' + ID, onError);
      var resultFromCallback = null;
      var callback = function(err, result) {
        resultFromCallback = result;
      };
      mockResult = true;
      expect(onError).not.toHaveBeenCalled();
      instance.send('isComplete', callback);
      expect(resultFromCallback).toBe(true);
    });
  });

  describe('width', function(){
    it('calls $(element).width', function(){
      var el = $('#' + ID);
      instance = new InstanceDef({url: '/url'}, el, onError);
      instance.width('100px');
      expect($('#' + ID + '').find('iframe').width()).toEqual(100);
    });

  });
  
  describe('css', function(){
    it('calls $(element).css', function(){
      var el = $('#' + ID);
      instance = new InstanceDef({url: '/url'}, el, onError);
      instance.css('color', 'red');
      expect($('#' + ID + '').find('iframe').css('color')).toEqual('rgb(255, 0, 0)');
    });
  });
});