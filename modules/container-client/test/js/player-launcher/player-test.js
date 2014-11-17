describe('player launcher', function() {

  var errors = corespring.require("errors");

  var launcher = null;

  var MockInstance = function() {

    this.isComplete = false;

    this.send = function() {
      var args = Array.prototype.slice.call(arguments);
      var message = args[0];
      var cb = typeof(args[1] == 'function') ? args[1] : args[2];
      var data = typeof(args[1] == 'function') ? null : args[1];

      if (message === "isComplete") {
        cb(null, this.isComplete);
      } else if (message === "completeResponse") {
        this.isComplete = true;
      }
    };

    this.on = function(name, cb) {
      if (name == "ready") {
        cb();
      }
    };
    return this;
  };


  function MockErrors(errs){
    this.errors = errs;
    this.hasErrors = function(){ 
      return this.errors && this.errors.length > 0; 
    };
  }

  function MockWarnings(wrns){
    this.warnings = wrns;
    this.hasWarnings = function(){ 
      return this.warnings && this.warnings.length > 0; 
    };
  }

  var mockInstance = null;
  var originalInstance = null;
  var lastError = null;
  var warnings = [];
  
  var origWarn = window.console.warn;


  var defaultOptions = corespring.module("default-options").exports;
  defaultOptions.corespringUrl = "http://blah.com";

  beforeEach(function() {
    originalInstance = corespring.require("instance");
    mockInstance = corespring.module("instance", MockInstance);
    launchErrors = corespring.module("launcher-errors", new MockErrors());
    launcher = corespring.require("player");
    warnings = [];
    window.console.warn = function(msg){
      warnings.push(msg);
    };
  });

  afterEach(function() {
    corespring.module("player-instance", originalInstance);
    window.console.warn = origWarn;
  });

  var create = function(options, secureMode, playerErrors, warnings) {

    corespring.module("launcher-errors", playerErrors || new MockErrors());
    corespring.module("launcher-warnings", warnings || new MockWarnings());
    corespring.module("query-params", {});

    secureMode = secureMode !== undefined ? secureMode : true;
    lastError = null;

    for (var x in options) {
      defaultOptions[x] = options[x];
    }

    var Player = launcher.define(secureMode);


    //$("body").append("<div id='blah'></div>")
    var player = new Player("blah", {}, function(err) {
      lastError = err;
    });

    return player;
  };

  it('should invoke error callback if there are launcher-errors', function() {
    var player = create({
      mode: null
      }, 
      false, 
      new MockErrors(["error one"])
    );

    expect(lastError.code).toEqual(errors.EXTERNAL_ERROR("error one").code);
    expect(lastError.message).toEqual(errors.EXTERNAL_ERROR("error one").message);
  });

  it('should log warnings if there are warnings', function(){
    var player = create({
      mode: null
      }, 
      false, 
      null, 
      new MockWarnings(['warning one'])
    );
    expect(warnings.length).toEqual(1);
  });

  it('should invoke error callback with invalid mode', function() {
    var player = create({
      mode: null
    });
    expect(lastError.code).toEqual(errors.INVALID_MODE.code);
  });


  it('should invoke error callback when mode is gather and there is no itemId/sessionId', function() {
    var player = create({
      mode: "gather",
      itemId: null,
      sessionId: null
    });
    expect(lastError.code).toEqual(errors.NO_ITEM_OR_SESSION_ID.code);
  });

  it('should construct', function() {
    var player = create({
      mode: "gather",
      itemId: "1",
      paths: {}
    });
    expect(player).toNotBe(null);
    expect(lastError).toBe(null);
  });

  it('should invoke error callback when changing mode from view => gather and session is complete', function() {
    var player = create({
      sessionId: "1",
      mode: "view",
      paths: {}
    });
    player.completeResponse();
    player.setMode("gather");
    expect(lastError.code).toEqual(errors.NOT_ALLOWED.code);
  });

  describe('setMode', function() {

    function ModeChangeTest() {
      this.lastError = {};
      this.from = function(value) {
        this.fromMode = value;
        return this;
      };
      this.to = function(value) {
        this.toMode = value;
        return this;
      };
      this.withComplete = function(value) {
        this.complete = value;
        return this;
      };
      this.andSecure = function(value) {
        this.secure = value;
        return this;
      };
      this.do = function() {
        var player = create({
          sessionId: "1",
          mode: this.fromMode,
          paths: {}
        }, this.secure);
        this.complete && player.completeResponse();
        player.setMode(this.toMode);
        this.lastError = lastError;
        return this;
      };
    }

    function createModeChangeResultMessage(modeChangeResult) {
      return "Change mode" +
        " from " + modeChangeResult.fromMode +
        " to " + modeChangeResult.toMode +
        " with complete = " + modeChangeResult.complete +
        " and secure = " + modeChangeResult.secure;
    }

    beforeEach(function() {
      this.addMatchers({
        toSucceed: function() {
          var testResult = this.actual.do();
          var pass = !testResult.lastError;
          var message = createModeChangeResultMessage(testResult) +
            " " + (pass ? "succeeded" : "failed");
          this.message = function() {
            return message;
          };
          return pass;
        },
        toFail: function() {
          var testResult = this.actual.do();
          var pass = testResult.lastError;
          var message = createModeChangeResultMessage(testResult) +
            " " + (pass ? "should have failed" : "did not fail as expected.");
          this.message = function() {
            return message;
          };
          return pass;
        }
      });
    });

    it("should work as expected when complete is false and secure is false", function() {
      var modeChange = new ModeChangeTest().withComplete(false).andSecure(false);
      expect(modeChange.from("gather").to("view")).toSucceed();
      expect(modeChange.from("gather").to("evaluate")).toSucceed();
      expect(modeChange.from("view").to("gather")).toSucceed();
      expect(modeChange.from("view").to("evaluate")).toSucceed();
      expect(modeChange.from("evaluate").to("gather")).toSucceed();
      expect(modeChange.from("evaluate").to("view")).toSucceed();
    });

    it("should work as expected when complete is true and secure is false", function() {
      var modeChange = new ModeChangeTest().withComplete(true).andSecure(false);
      expect(modeChange.from("gather").to("view")).toSucceed();
      expect(modeChange.from("gather").to("evaluate")).toSucceed();
      expect(modeChange.from("view").to("gather")).toSucceed();
      expect(modeChange.from("view").to("evaluate")).toSucceed();
      expect(modeChange.from("evaluate").to("gather")).toSucceed();
      expect(modeChange.from("evaluate").to("view")).toSucceed();
    });

    it("should work as expected when complete is false and secure is true", function() {
      var modeChange = new ModeChangeTest().withComplete(false).andSecure(true);
      expect(modeChange.from("gather").to("view")).toSucceed();
      expect(modeChange.from("gather").to("evaluate")).toFail();
      expect(modeChange.from("view").to("gather")).toSucceed();
      expect(modeChange.from("view").to("evaluate")).toFail();
      expect(modeChange.from("evaluate").to("gather")).toSucceed();
      expect(modeChange.from("evaluate").to("view")).toSucceed();
    });

    it("should work as expected when complete is true and secure is true", function() {
      var modeChange = new ModeChangeTest().withComplete(true).andSecure(true);
      expect(modeChange.from("gather").to("view")).toSucceed();
      expect(modeChange.from("gather").to("evaluate")).toSucceed();
      expect(modeChange.from("view").to("gather")).toFail();
      expect(modeChange.from("view").to("evaluate")).toSucceed();
      expect(modeChange.from("evaluate").to("gather")).toFail();
      expect(modeChange.from("evaluate").to("view")).toSucceed();
    });
  });
});