describe('player launcher', function() {


  var errorCodes = corespring.require('error-codes');
  var validationErrors;
  var PlayerFactory, player, mockLauncher, onError;

  beforeEach(function(){
    onError = jasmine.createSpy('onError');
    validationErrors = [];
    mockInstance = new org.corespring.mocks.launcher.MockInstance();
    var MockLauncher = org.corespring.mocks.launcher.MockLauncher(mockInstance);
    mockLauncher = new MockLauncher();

    corespring.mock.modules['client-launcher'] = function(){
      return mockLauncher;
    };

    PlayerFactory = corespring.require('player');
  });

  afterEach(function(){
    corespring.mock.reset();
  });



  function create(opts, isSecure, isComplete){
    isComplete = isComplete === true;

    mockLauncher.init.and.callFake(function(v){
      validationErrors = v(opts);
      return !validationErrors || validationErrors.length === 0;
    });

    mockInstance.send.and.callFake(function(t,cb){
      if(t === 'isComplete'){
        cb(null, isComplete);
      }
    });

    var Player = PlayerFactory.define(isSecure);
    var out = new Player('element', opts, onError);
    return out;
  }

  describe('validateOptions', function(){

    it('should return mode error if the mode is unknown', function() {
      create({mode: 'blah', itemId: 'itemId'}, false);
      expect(validationErrors[0].code).toEqual(errorCodes.INVALID_MODE.code);
    });

    it('should invoke error callback when mode is gather and there is no itemId/sessionId', function() {
      create({
        mode: 'gather',
        itemId: null,
        sessionId: null
      },false);
      expect(validationErrors[0].code).toEqual(errorCodes.NO_ITEM_OR_SESSION_ID.code);
    });

    it('should invoke error callback when changing mode from view => gather and session is complete in secure mode', function() {
      var player = create({
        sessionId: '1',
        mode: 'view',
        paths: {}
      }, true, true);
      expect(validationErrors).toEqual([]);
      player.completeResponse();
      player.setMode('gather');
      expect(onError).toHaveBeenCalledWith(errorCodes.NOT_ALLOWED);
    });

  });

  describe('init', function(){

    describe('width', function(){
      it('should not call width on the instance if explicit width is not set', function(){
        var player = create({ itemId: '1', mode: 'gather' });
        expect(mockInstance.width).not.toHaveBeenCalled();
      });

      it('should not call width on the instance if explicit width is set', function(){
        var player = create({ itemId: '1', mode: 'gather', width: '1000px' });
        expect(mockInstance.width).toHaveBeenCalledWith('1000px');
      });

    });

    it('calls loadInstance with mode \'gather\' if it\'s not defined', function(){
      var player = create({ itemId: '1', gather: {} });
      expect(mockLauncher.loadInstance).toHaveBeenCalledWith(jasmine.any(Object), undefined, {mode: 'gather', gather: {}});
    });

    it('creates new session if itemId is passed in and sessionId is not', function(){
      var player = create({ itemId: '1', mode: 'gather', gather: {} });
      expect(mockLauncher.loadCall).toHaveBeenCalledWith('createSession', jasmine.any(Function));
    });

    it('resumes session if sessionId is passed in', function(){
      var player = create({ sessionId: '1', mode: 'view', gather: {} });
      expect(mockLauncher.loadCall).toHaveBeenCalledWith('view', jasmine.any(Function));
    });

    it('resumes session and calls errorcallback if sessionId and itemId are both passed in', function(){
      var player = create({ itemId: '1', sessionId: '1', mode: 'view', gather: {} });
      expect(mockLauncher.loadCall).toHaveBeenCalledWith('view', jasmine.any(Function));
    });
  });

  describe('setMode', function() {

    var lastError;

    var modeErrorCallback;

    function create(opts, isSecure, isComplete){
      isComplete = isComplete === true;
      mockLauncher.init.and.returnValue(true);
      mockInstance.send.and.callFake(function(t,cb){
        if(t === 'isComplete'){
          cb(null, isComplete);
        }
      });

      var Player = PlayerFactory.define(isSecure);
      var out = new Player('element', opts, modeErrorCallback);
      return out;
    }

    beforeEach(function() {

      modeErrorCallback = jasmine.createSpy('modeErrorCallback');

      function createMessage(mc, pass) {
        return 'Change mode ' + mc.from + '->' + mc.to +
          ' with complete: ' + mc.complete +
          ' and secure: ' + mc.secure + ' passed? ' + pass;
      }

      jasmine.addMatchers({
        toSucceed: function(util, customEqualityTesters) {
          return {
            compare: function(mc){
              var pass = mc.errorCount === 0;
              return {
                pass: pass,
                message: createMessage(mc, pass)
              };
            }
          };
        }
      });
    });

    afterEach(function() {
      modeErrorCallback.calls.reset();
    });

    function setMode(fromAndTo, opts){
      var arr = fromAndTo.split('->');
      var fromMode = arr[0];
      var toMode = arr[1];
      var player = create({mode: fromMode}, opts.secure, opts.complete);
      player.setMode(toMode);
      var errorCount = modeErrorCallback.calls.count();
      modeErrorCallback.calls.reset();
      return {
        errorCount: errorCount,
        from: fromMode,
        to: toMode,
        secure: opts.secure,
        complete: opts.complete
      };
    }

    describe('pass mode options', function(){

      var player;
      var opts = {
        mode: 'gather',
        gather: { g : 'g'},
        view: { v: 'v'},
        evaluate: { e: 'e'}
      };

      beforeEach(function(){
        player = create(opts, false, function(){});
        mockInstance.send.calls.reset();
      });

      it('should pass the mode options', function(){
        player.setMode('evaluate');
        expect(mockInstance.send).toHaveBeenCalledWith('setMode',
        {
          mode: 'evaluate',
          evaluate: opts.evaluate,
          saveResponses: {isAttempt: false, isComplete: false}
        });
      });

      it('should pass the view mode options', function(){
        player.setMode('view');
        expect(mockInstance.send)
          .toHaveBeenCalledWith('setMode', { mode: 'view', view: opts.view });
      });

    });

    it("should work as expected when complete is false and secure is false", function() {
      var opts = {complete: false, secure: false};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toSucceed();
      expect(setMode('gather->instructor', opts)).toSucceed();
      expect(setMode('view->gather', opts)).toSucceed();
      expect(setMode('view->evaluate', opts)).toSucceed();
      expect(setMode('view->instructor', opts)).toSucceed();
      expect(setMode('evaluate->gather', opts)).toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
      expect(setMode('evaluate->instructor', opts)).toSucceed();
      expect(setMode('instructor->view', opts)).toSucceed();
      expect(setMode('instructor->gather', opts)).toSucceed();
      expect(setMode('instructor->evaluate', opts)).toSucceed();
    });

    it("should work as expected when complete is true and secure is false", function() {
      var opts = {complete: true, secure: false};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toSucceed();
      expect(setMode('gather->instructor', opts)).toSucceed();
      expect(setMode('view->gather', opts)).toSucceed();
      expect(setMode('view->evaluate', opts)).toSucceed();
      expect(setMode('view->instructor', opts)).toSucceed();
      expect(setMode('evaluate->gather', opts)).toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
      expect(setMode('evaluate->instructor', opts)).toSucceed();
      expect(setMode('instructor->view', opts)).toSucceed();
      expect(setMode('instructor->gather', opts)).toSucceed();
      expect(setMode('instructor->evaluate', opts)).toSucceed();
    });

    it("should work as expected when complete is false and secure is true", function() {
      var opts = {complete: false, secure: true};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).not.toSucceed();
      expect(setMode('gather->instructor', opts)).not.toSucceed();
      expect(setMode('view->gather', opts)).toSucceed();
      expect(setMode('view->evaluate', opts)).not.toSucceed();
      expect(setMode('view->instructor', opts)).not.toSucceed();
      expect(setMode('evaluate->gather', opts)).toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
      expect(setMode('evaluate->instructor', opts)).not.toSucceed();
    });

    it("should work as expected when complete is true and secure is true", function() {
      var opts = {complete: true, secure: true};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toSucceed();
      expect(setMode('gather->instructor', opts)).toSucceed();
      expect(setMode('view->gather', opts)).not.toSucceed();
      expect(setMode('view->evaluate', opts)).toSucceed();
      expect(setMode('view->instructor', opts)).toSucceed();
      expect(setMode('evaluate->gather', opts)).not.toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
      expect(setMode('evaluate->instructor', opts)).toSucceed();
    });
  });
});
