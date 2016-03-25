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
    this.send = jasmine.createSpy('send');
    this.on = jasmine.createSpy('on');
    this.remove = jasmine.createSpy('remove');
  }

  var mockChannel;
  var ID = 'instance-test-element-id';
  var call = {method: 'GET', url: '/url'};

  beforeEach(function() {
    onError.calls.reset();
    var element = $('<div id="' + ID + '"></div>');
    $('body').append(element);
    originalMsgr = window.msgr;
    mockChannel = new MockChannel();
    window.msgr.Channel = function(){
      return mockChannel;
    };
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

  it('should submit a form if method is POST', function(){
    //how to intercept the form.submit();
    pending();
  });

  it('should not register handler for dimensionsUpdate', function(){
    instance = new InstanceDef({call: call}, '#' + ID, onError, {}, false);
    expect(mockChannel.on).not.toHaveBeenCalledWith('dimensionsUpdate', jasmine.any(Function));
  });
  
  it('should register handler for dimensionsUpdate', function(){
    instance = new InstanceDef({call: call}, '#' + ID, onError, {});
    expect(mockChannel.on).toHaveBeenCalledWith('dimensionsUpdate', jasmine.any(Function));
  });

  it('should not enable iframe scrolling if iframeScrollingEnabled is false', function(){
    instance = new InstanceDef({call: call}, '#' + ID, onError, {}, false, false);
    expect($('#' + ID).html()).toMatch("scrolling=\"no\"");
  });

  it('should enable iframe scrolling if iframeScrollingEnabled is true', function(){
    instance = new InstanceDef({call: call}, '#' + ID, onError, {}, false, true);
    expect($('#' + ID).html()).not.toMatch("scrolling=\"no\"");
  });

  it('should register a handler for autoScroll', function(){
    var instance = new InstanceDef({call: {method: 'GET', url: '/url'}}, '#' + ID, onError);
    expect(mockChannel.on).toHaveBeenCalledWith('autoScroll', jasmine.any(Function));
  });

  it('should register a handler for getScrollPosition', function(){
    var instance = new InstanceDef({call: {method: 'GET', url: '/url'}}, '#' + ID, onError);
    expect(mockChannel.on).toHaveBeenCalledWith('getScrollPosition', jasmine.any(Function));
  });

  describe('send', function(){

    it('should call channel.send', function() {
      var instance = new InstanceDef({call: {method: 'GET', url: '/url'}}, '#' + ID, onError);
      instance.send('isComplete', function(){});
      expect(mockChannel.send).toHaveBeenCalledWith('isComplete', jasmine.any(Function));
    });
  });

  describe('width', function(){
    it('calls $(element).width', function(){
      var el = $('#' + ID);
      instance = new InstanceDef({call: {method: 'GET', url: '/url'}}, el, onError);
      instance.width('100px');
      expect($('#' + ID + '').find('iframe').width()).toEqual(100);
    });

  });
  
  describe('css', function(){
    it('calls $(element).css', function(){
      var el = $('#' + ID);
      instance = new InstanceDef({call: {method: 'GET', url: '/url'}}, el, onError);
      instance.css('color', 'red');
      expect($('#' + ID + '').find('iframe').css('color')).toEqual('rgb(255, 0, 0)');
    });
  });
});