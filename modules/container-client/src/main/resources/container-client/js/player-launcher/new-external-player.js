exports.define = function(isSecure) {
  return function(element, options, errorCallback){

    var instanceFactory = require("player-instance");

    var defaultOptions = require("defaultOptions");

    options = $.extend(defaultOptions, options);


    var validateOptions = function (options) {
      var out = [];
      if (!options.itemId && options.mode === "gather") {
        out.push(errors.NO_ITEM_ID);
      }
      if (!options.sessionId && options.mode !== "gather") {
        out.push(errors.NO_SESSION_ID);
      }
      return out;
    };

    var result = validateOptions(options);

    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        errorCallback(result[i]);
      }
      return;
    }

    var instance = instanceFactory.make(element, options);

    var isValidMode = function (m) {
      if (!m) return false;
      return ["gather", "view", "evaluate"].indexOf(m) !== -1;
    };

    var isAllowed = function(mode){
      return true;
    };

  
    var errors = {
      INVALID_MODE: {code: 101, message: "setMode was called with an invalid mode"},
      NO_ITEM_ID: {code: 102, message: "itemId is missing from options"},
      NO_SESSION_ID: {code: 103, message: "sessionId is missing from options"},
      NOT_ALLOWED: {code: 104, message: "Not allowed perform this action"}
    };

    errorCallback = errorCallback || function (error) {
      throw "error occurred, code: " + error.code + ", message: " + error.message;
    };

    
    if (options.onSessionCreated) {
      instance.addListener("sessionCreated", function(data){
        options.onSessionCreated(data.session._id.$oid);
      });
    }

    if(options.onInputReceived){
      instance.addListener("inputReceived", function(data){
        options.onInputReceived(data.sessionStatus);
      });
    }

    /* API methods */
    this.setMode = function (mode) {
      if (isValidMode(mode)) {

        if(isAllowed(mode)){
          var modeOptions = options[mode] || {};
          instance.sendMessage( { message: "setMode", data: {mode: mode, options: modeOptions}});
        } else {
          errorCallback(errors.NOT_ALLOWED);
        }
      } else {
        errorCallback(errors.INVALID_MODE);
      }
    };

    this.saveResponses = function (isAttempt) {
      instance.sendMessage({ message: "saveResponses", data: {isAttempt: isAttempt} });
    };

    this.completeResponse = function () {
      instance.sendMessage( { message: "completeResponse" });
    };

    this.resetItem = function () {
      instance.sendMessage( { messaget: "resetItem" });
    };

    this.countAttempts = function (callback) {
      instance.sendMessage({
        message: "countAttempts",
        property: "count",
        callback: callback
      });
    };

    this.getScore = function (format, callback) {
      instance.sendMessage({
        message: "getScore",
        data: {format: format},
        property: "score",
        callback: callback
      });
    };

    this.isComplete = function (callback) {
      instance.sendMessage({
        message: "isComplete",
        property: "isComplete",
        callback: callback
      });
    };

    this.getSessionStatus = function (callback) {
      instance.sendMessage({
        message: "getSessionStatus",
        property: "sessionStatus",
        callback: callback
      });
    };

    this.isComplete = function(callback){
      instance.sendMessage({
        message: "isComplete",
        property: "isComplete",
        callback: callback
      });
    };

    this.reset = function(){
      instance.sendMessage({ message: "reset" });
    };
  };
};



