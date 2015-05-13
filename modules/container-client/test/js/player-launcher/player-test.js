describe('player launcher', function() {


  var errorCodes = corespring.require('error-codes');

  var PlayerFactory, player, mockLauncher, onError;

  beforeEach(function(){
    onError = jasmine.createSpy('onError');
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


  describe('validateOptions', function(){

    var errors;
    beforeEach(function(){
      errors = [];
    });

    function create(opts, isSecure, isComplete){
      isComplete = isComplete === true;

      mockLauncher.init.and.callFake(function(v){
        errors = v(opts);
        return true;
      });

      mockInstance.send.and.callFake(function(t,cb){
        if(t === 'isComplete'){
          cb(null, isComplete);
        }
      });

      var Player = PlayerFactory.define(isSecure);
      var out = new Player('element', {}, onError);
      return out;
    }

    it('should return mode error if the mode is null', function() {
      create({mode: null}, false);
      expect(errors[0].code).toEqual(errorCodes.INVALID_MODE.code);
    });

    it('should invoke error callback when mode is gather and there is no itemId/sessionId', function() {
      create({
        mode: 'gather',
        itemId: null,
        sessionId: null
      },false);
      expect(errors[0].code).toEqual(errorCodes.NO_ITEM_OR_SESSION_ID.code);
    });

    it('should invoke error callback when changing mode from view => gather and session is complete in secure mode', function() {
      var player = create({
        sessionId: '1',
        mode: 'view',
        paths: {}
      }, true, true);
      expect(errors).toEqual([]);
      player.completeResponse();
      player.setMode('gather');
      expect(onError).toHaveBeenCalledWith(errorCodes.NOT_ALLOWED);
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

    /*function createModeChangeResultMessage(modeChangeResult) {
      return "Change mode" +
        " from " + modeChangeResult.fromMode +
        " to " + modeChangeResult.toMode +
        " with complete = " + modeChangeResult.complete +
        " and secure = " + modeChangeResult.secure;
    }*/

    beforeEach(function() {

      modeErrorCallback = jasmine.createSpy('modeErrorCallback');

      /*function mkCompareFn(expectSuccess, successMsg, failedMsg) {
        return function(actual, expected){
          var testResult = actual.do();
          var pass = expectSuccess ? !testResult.lastError : testResult.lastError;
          var message = createModeChangeResultMessage(testResult) +
            " " + (pass ? successMsg : failedMsg );
          return { pass: pass, message: message};
        };
      }*/

      function compareFn(count, label){
        return function(mc){
          function createMessage(mc, pass) {
            return label + 'Change mode ' + mc.from + '->' + mc.to +
              ' with complete: ' + mc.complete +
              ' and secure: ' + mc.secure + ' passed? ' + pass;
          }
          
          var pass = mc.errorCount === 0;
          return {
            pass: pass,
            message: createMessage(mc, pass)
          };
        };
      }

      jasmine.addMatchers({
        toSucceed: function(util, customEqualityTesters) {
          return {
            compare: function(mc){
              var pass = mc.errorCount === 0;
              return {
                pass: pass,
                message: createMessage(mc, pass) //'standard message'
              };
            }
          };
        },
        toFail: function(util, customEqualityTesters) {
          return {
            compare: function(mc){
              var pass = mc.errorCount === 1;
              return{
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

    it("should work as expected when complete is false and secure is false", function() {
      var opts = {complete: false, secure: false};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toSucceed();
      expect(setMode('view->gather', opts)).toSucceed();
      expect(setMode('view->evaluate', opts)).toSucceed();
      expect(setMode('evaluate->gather', opts)).toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
    });

    it("should work as expected when complete is true and secure is false", function() {
      var opts = {complete: true, secure: false};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toSucceed();
      expect(setMode('view->gather', opts)).toSucceed();
      expect(setMode('view->evaluate', opts)).toSucceed();
      expect(setMode('evaluate->gather', opts)).toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
    });

    it("should work as expected when complete is false and secure is true", function() {
      var opts = {complete: false, secure: true};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toFail();
      expect(setMode('view->gather', opts)).toSucceed();
      expect(setMode('view->evaluate', opts)).toFail();
      expect(setMode('evaluate->gather', opts)).toSucceed();
      expect(setMode('evaluate->view', opts)).toSucceed();
    });

    it("should work as expected when complete is true and secure is true", function() {
      var opts = {complete: true, secure: true};
      expect(setMode('gather->view', opts)).toSucceed();
      expect(setMode('gather->evaluate', opts)).toSucceed();
      expect(setMode('view->gather', opts)).toFail();
      expect(setMode('view->evaluate', opts)).toSucceed();
      expect(setMode('evaluate->gather', opts)).toFail();
      expect(setMode('evaluate->view', opts)).toSucceed();
    });
  });
});
