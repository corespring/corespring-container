console.log("external player");

(function (root) {

  this.org = this.org || {};
  org.corespring = org.corespring || {};
  org.corespring.players = org.corespring.players || {};

  var rootListener = null;
  var eventName = function() { return window.addEventListener ? "message" : "onmessage";};
  var addEventFunctionName = function(){ return window.addEventListener ? "addEventListener" : "attachEvent"; };

  /** A cache of existing player listeners - gets overrwritten when a new ItemPlayer is instantiated */
  var playerListeners = [];

  var logError = function (error) {
    console.error(error);
  };

  var addPlayerListener = function (fn) {
    if (playerListeners.indexOf(fn) == -1) {
      playerListeners.push(fn);
    }
  };

  var clearPlayerListeners = function () {
    playerListeners = [];
  };

  /** only add one listener to the window, this function is expected to then delegate out to player listeners */
  var addRootLevelMessageListener = function (newListener) {
    if (rootListener !== null) {
      throw "A root level listener is already registered!";
    }
    rootListener = newListener;
    window[addEventFunctionName()](eventName(), rootListener, false);
  };

  /** The root listener implementation - forward event to all player listeners */
  var rootLevelListener = function (e) {
    console.debug("rootLevelListener", e);

    for (var i = 0; i < playerListeners.length; i++) {
      playerListeners[i](e);
    }
  };

  addRootLevelMessageListener(rootLevelListener);

  var isValidMode = function (m) {
    if (!m) return false;

    return ["preview", "administer", "render", "aggregate"].indexOf(m) !== -1;
  };

  var renderPlayer = function (e, options) {
    var resourceType = options.mode == "gather" ? "item" : "session";
    var id = options.mode === "gather" ? options.itemId : options.sessionId;
    var path = options.mode === "gather" ? options.itemPath : options.sessionPath;
    var url = (options.corespringUrl + path).replace(":id", id);

    e.html("<iframe id='iframe-player' src='" + url + "' style='width: 100%; min-height: 700px; border: none'></iframe>");
    e.width(options.width ? options.width : "600px");

  };

  var expectResult = function (message, callback, dataProcessor) {
    dataProcessor = dataProcessor || (function (data) {
      return data;
    });
    addPlayerListener(function (event) {
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

  var validateOptions = function (options) {

    var out = [];
    if (!options.mode) {
      out.push("No mode");
    }

    if (!options.itemId && options.mode === "gather") {
      out.push("No itemId");
    }

    if (!options.sessionId && options.mode !== "gather") {
      out.push("No sessionId");
    }

    return out;
  };


  var addSessionListener = function (message, callback, dataHandler) {

    dataHandler = (dataHandler || function (s) {
      return s._id.$oid;
    });

    addPlayerListener(function (event) {
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

  org.corespring.players.ItemPlayer = function (elementSelector, options) {

    playerListeners = [];


    var defaultOptions = {
      corespringUrl : "http://localhost:9000",
      itemPath: "/client/item/:id/player",
      sessionPath: "/client/player/:id/index.html",
      mode: "gather"
    };

    options = $.extend(defaultOptions, options);

    var result = validateOptions(options);

    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        logError(result[i]);
      }
      return;
    }

    var postMessage = function (message, data) {
      console.debug("Posting Message: ", message, data);
      try {
        var iframe = $(elementSelector).find('iframe')[0];
        if (!iframe) throw "iframe not found";

        var messageObject = {"message": message};
        iframe.contentWindow.postMessage(JSON.stringify($.extend(messageObject, data)), "*");
        return true;
      } catch (e) {
        console.error("no iframe");
        return false;
      }
    };

    var asyncRequest = function (argObj) {
      postMessage(argObj.message, argObj.data);
      var extractPropertyFromMessage = function (message) {
        return message[argObj.property];
      };
      expectResult(argObj.message + "Result", argObj.callback, extractPropertyFromMessage);
    };

    if (options.onSessionCreated) {
      addSessionListener("sessionCreated", options.onSessionCreated);
    }

    /* API methods */
    this.setMode = function (mode) {
      postMessage("setMode", {mode: mode});
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

    renderPlayer($(elementSelector), options);
  };

})(this);