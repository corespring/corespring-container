describe('player launcher', function () {

  var errors = corespring.require("errors");

  var launcher = null;

  var MockInstanceIsCompleteReturnValue;

  var MockInstance = function () {

    this.isComplete = false;

    this.sendMessage = function (props) {
      if (props.message == "isComplete") {
        props.callback(MockInstanceIsCompleteReturnValue);
      }
    };

    this.addListener = function (name, cb) {
      if (name == "ready") {
        cb();
      }
    };
    return this;
  };

  var MockErrors = {
    hasErrors: false,
    errors: []
  };

  var mockInstance = null;
  var originalInstance = null;
  var lastError = null;

  var defaultOptions = corespring.module("default-options").exports;
  defaultOptions.corespringUrl = "http://blah.com";

  beforeEach(function () {
    MockInstanceIsCompleteReturnValue = true;
    originalInstance = corespring.require("instance");
    mockInstance = corespring.module("instance", MockInstance);
    launchErrors = corespring.module("launcher-errors", MockErrors);
    launcher = corespring.require("player");
  });

  afterEach(function () {
    corespring.module("player-instance", originalInstance);
  });

  var create = function (options, secureMode, playerErrors) {

    corespring.module("launcher-errors", playerErrors || MockErrors);

    secureMode = secureMode !== undefined ? secureMode : true;
    lastError = null;

    for (var x in options) {
      defaultOptions[x] = options[x];
    }

    var Player = launcher.define(secureMode);

    //$("body").append("<div id='blah'></div>")
    var player = new Player("blah", {}, function (err) {
      lastError = err;
    });

    return player;
  };

  it('should invoke error callback if there are launcher-errors', function () {
    var player = create({mode: null}, false, { hasErrors: true, errors: ["error one"]});
    expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("error one").code);
    expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("error one").message);
  });

  it('should invoke error callback with invalid mode', function () {
    var player = create({mode: null});
    expect(lastError.code).toEqual(errors.INVALID_MODE.code);
  });


  it('should invoke error callback when mode is gather and there is no itemId', function () {
    var player = create({mode: "gather", itemId: null});
    expect(lastError.code).toEqual(errors.NO_ITEM_ID.code);
  });

  it('should construct', function () {
    var player = create({ mode: "gather", itemId: "1", paths: {} });
    expect(player).toNotBe(null);
    expect(lastError).toBe(null);
  });

  it('should invoke error callback when changing mode from view => gather and session is complete', function () {
    var player = create({sessionId: "1", mode: "view", paths: {} });
    player.setMode("gather");
    expect(lastError.code).toEqual(errors.NOT_ALLOWED.code);
  });

  describe('setMode', function () {

    var complete = false, secure = false;

    function modeChange(fromMode, toMode, complete, secure) {
      MockInstanceIsCompleteReturnValue = complete;
      var player = create({sessionId: "1", mode: fromMode, paths: {} }, secure);
      player.setMode(toMode);
      return {fromMode: fromMode, toMode: toMode, complete: complete, secure: secure, lastError: lastError}
    }

    function createModeChangeResultMessage(modeChangeResult) {
      return "Change mode"
        + " from " + modeChangeResult.fromMode
        + " to " + modeChangeResult.toMode
        + " with complete = " + modeChangeResult.complete
        + " and secure = " + modeChangeResult.secure;
    }

    beforeEach(function () {
      this.addMatchers({
        toSucceed: function () {
          var pass = !this.actual.lastError;
          var message = createModeChangeResultMessage(this.actual)
            + " " + (pass ? "succeeded" : "failed");
          this.message = function () {
            return message
          }
          return pass;
        },
        toFail: function () {
          var pass = this.actual.lastError;
          var message = createModeChangeResultMessage(this.actual)
            + " " + (pass ? "should have failed" : "did not fail as expected.");
          this.message = function () {
            return message
          }
          return pass;
        }
      });
    });

    it("should work as expected when complete is false and secure is false", function () {
      var complete = false, secure = false;
      expect(modeChange("gather", "view", complete, secure)).toSucceed();
      expect(modeChange("gather", "evaluate", complete, secure)).toSucceed();
      expect(modeChange("view", "gather", complete, secure)).toSucceed();
      expect(modeChange("view", "evaluate", complete, secure)).toSucceed();
      expect(modeChange("evaluate", "gather", complete, secure)).toSucceed();
      expect(modeChange("evaluate", "view", complete, secure)).toSucceed();
    });

    it("should work as expected when complete is true and secure is false", function () {
      var complete = true, secure = false;
      expect(modeChange("gather", "view", complete, secure)).toSucceed();
      expect(modeChange("gather", "evaluate", complete, secure)).toSucceed();
      expect(modeChange("view", "gather", complete, secure)).toSucceed();
      expect(modeChange("view", "evaluate", complete, secure)).toSucceed();
      expect(modeChange("evaluate", "gather", complete, secure)).toSucceed();
      expect(modeChange("evaluate", "view", complete, secure)).toSucceed();
    });

    it("should work as expected when complete is false and secure is true", function () {
      var complete = false, secure = true;
      expect(modeChange("gather", "view", complete, secure)).toSucceed();
      expect(modeChange("gather", "evaluate", complete, secure)).toFail();
      expect(modeChange("view", "gather", complete, secure)).toSucceed();
      expect(modeChange("view", "evaluate", complete, secure)).toFail();
      expect(modeChange("evaluate", "gather", complete, secure)).toSucceed();
      expect(modeChange("evaluate", "view", complete, secure)).toSucceed();
    });

    it("should work as expected when complete is true and secure is true", function () {
      var complete = true, secure = true;
      expect(modeChange("gather", "view", complete, secure)).toSucceed();
      expect(modeChange("gather", "evaluate", complete, secure)).toSucceed();
      expect(modeChange("view", "gather", complete, secure)).toFail();
      expect(modeChange("view", "evaluate", complete, secure)).toSucceed();
      expect(modeChange("evaluate", "gather", complete, secure)).toFail();
      expect(modeChange("evaluate", "view", complete, secure)).toSucceed();
    });
  });
});