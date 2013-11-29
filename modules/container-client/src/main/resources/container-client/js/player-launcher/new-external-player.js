exports.define = function(isSecure) {
  return function(element, options, errorCallback){

    var listener = require("root-level-listener").init();

    var isValidMode = function (m) {
      if (!m) return false;
      return ["gather", "view", "evaluate"].indexOf(m) !== -1;
    };

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


    var addSessionListener = function (message, callback, dataHandler) {

      dataHandler = (dataHandler || function (s) {
        return s._id.$oid;
      });

      listener.addListener(function (event) {
        try {
          var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;

          if (data.message == message && data.session) {
            callback(dataHandler(data.session));
          }
        }
        catch (e) {
          logError("Exception in ItemPlayer.addSessionListener: " + e);
        }
      });
    };

    var addInputReceivedListener = function(callback){
      listener.addListener(function (event) {
        try {
          var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;

          if (data.message == "inputReceived" && data.sessionStatus) {
            callback(data.sessionStatus);
          }
        }
        catch (e) {
          logError("Exception in ItemPlayer.addSessionListener: " + e);
        }
      });
    };


    var postMessage = function (message, data) {
      console.debug("Posting Message: ", message, data);
      try {
        var iframe = $(element).find('iframe')[0];
        if (!iframe) throw "iframe not found";

        var messageObject = {"message": message};
        iframe.contentWindow.postMessage(JSON.stringify($.extend(messageObject, data)), "*");
        return true;
      } catch (e) {
        console.error("no iframe");
        return false;
      }
    };

    var expectResult = function (message, callback, dataProcessor) {
      dataProcessor = dataProcessor || (function (data) {
        return data;
      });
      listener.addListener(function (event) {
        try {
          var dataString = event.data;
          var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;
          if (data.message == message) {
            callback(dataProcessor(data));
          }
        }
        catch (e) {
          logError("Exception in ItemPlayer.addSessionListener: " + e);
        }

      });
    };

    var asyncRequest = function (argObj) {
      postMessage(argObj.message, argObj.data);
      var extractPropertyFromMessage = function (message) {
        return message[argObj.property];
      };
      expectResult(argObj.message + "Result", argObj.callback, extractPropertyFromMessage);
    };


    var errors = {
      INVALID_MODE: {code: 101, message: "setMode was called with an invalid mode"},
      NO_ITEM_ID: {code: 102, message: "itemId is missing from options"},
      NO_SESSION_ID: {code: 103, message: "sessionId is missing from options"}
    };

    listener.clearListeners();

    errorCallback = errorCallback || function (error) {
      throw "error occurred, code: " + error.code + ", message: " + error.message;
    };

    var defaultOptions = require("defaultOptions");

    options = $.extend(defaultOptions, options);

    var renderPlayer = function (e, options) {
      var id = options.mode === "gather" ? options.itemId : options.sessionId;
      var path = options.mode === "gather" ? options.itemPath : options.sessionPath;
      var url = (options.corespringUrl + path).replace(":id", id);

      e.html("<iframe id='iframe-player' src='" + url + "' style='width: 100%; min-height: 700px; border: none'></iframe>");
      e.width(options.width ? options.width : "600px");
    };

    var result = validateOptions(options);

    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        errorCallback(result[i]);
      }
      return;
    }

    if (options.onSessionCreated) {
      addSessionListener("sessionCreated", options.onSessionCreated);
    }

    if(options.onInputReceived){
      addInputReceivedListener(options.onInputReceived);
    }

    /* API methods */
    this.setMode = function (mode) {
      if (isValidMode(mode)) {
        var modeOptions = options[mode] || {};
        postMessage("setMode", {mode: mode, options: modeOptions});
      } else {
        errorCallback(errors.INVALID_MODE);
      }
    };

    this.saveResponses = function (isAttempt) {
      postMessage("saveResponses", {isAttempt: isAttempt});
    };

    this.completeResponse = function () {
      postMessage("completeResponse");
    };

    this.resetItem = function () {
      postMessage("resetItem");
    };

    this.countAttempts = function (callback) {
      asyncRequest({
        message: "countAttempts",
        property: "count",
        callback: callback
      });
    };

    this.getScore = function (format, callback) {
      asyncRequest({
        message: "getScore",
        data: {format: format},
        property: "score",
        callback: callback
      });
    };

    this.isComplete = function (callback) {
      asyncRequest({
        message: "isComplete",
        property: "isComplete",
        callback: callback
      });
    };

    this.getSessionStatus = function (callback) {
      asyncRequest({
        message: "getSessionStatus",
        property: "sessionStatus",
        callback: callback
      });
    };

    this.isComplete = function(callback){
      asyncRequest({
        message: "isComplete",
        property: "isComplete",
        callback: callback
      });
    };

    this.reset = function(){
      postMessage("reset");
    };

    renderPlayer($(element), options);
  };
};



