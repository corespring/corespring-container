var Instance = function(element, options, errorCallback, log) {

  var errors = require("errors");

  var that = this;

  log = log || {
    error: function(s) {
      console.error(s);
    },
    debug: function(s) {
      console.debug(s);
    },
    warn: function(s) {
      console.warn(s);
    }
  };

  var listener = require("root-level-listener")();
  listener.clearListeners();

  function dimensionChangeListener(element) {
    function listenerFunction(data, event) {
      try {
        var json = JSON.parse(data);
        if (json.message === 'dimensionsUpdate') {
          var frames = document.getElementsByTagName('iframe');
          var found = false;
          for (var i = 0; i < frames.length; i++) {
            if (frames[i].contentWindow === event.source) {
              $(frames[i]).height(json.h + 30);
              found = true;
              break;
            }
          }
          if (!found) {
            $(element).height(json.h + 30);
          }
        }
      } catch (e) {
        log.error("Exception in addDimensionChangeListener: " + e);
      }
    }

    listener.addListener(function(e) {
      listenerFunction(e.data, e);
    });
  }


  function initialize(e, options) {
    if (!options || !options.url) {
      errorCallback({
        code: 999,
        message: "No url specified"
      });
      return;
    }

    if ($(e).length === 0) {
      errorCallback(errors.CANT_FIND_IFRAME);
      return;
    }

    $(e).html("<iframe id='iframe-player' frameborder='0' src='" + options.url + "' style='width: 100%; border: none'></iframe>");

    if (options.forceWidth) {
      $(e).width(options.width ? options.width : "600px");
    }

    dimensionChangeListener(e);
  }

  function postMessage(message, data) {
    var postMessageFunc = require("post-message");
    try {
      postMessageFunc(message, data, element);
    } catch (e) {
      log.error("[player-instance]", message, data, e);
      return false;
    }
    return true;
  }

  function expectResult(message, callback, dataProcessor) {
    dataProcessor = dataProcessor || (function(data) {
      return data;
    });

    function resultHandler(event) {

      var uid = new Date().getTime();

      try {
        var dataString = event.data;
        var data = typeof(event.data) === "string" ? JSON.parse(event.data) : event.data;
        if (data.message === message) {
          callback(dataProcessor(data));
        }
      } catch (e) {
        log.error("Exception in [player-instance] : " + e);
      }
      listener.removeListener(this);
    }

    listener.addListener(resultHandler);
  }


  this.sendMessage = function(props) {
    if (props.callback) {
      expectResult(props.message + "Result", props.callback, extractPropertyFromMessage);
    }

    postMessage(props.message, props.data);

    function extractPropertyFromMessage(message) {
      return message[props.property];
    }
  };

  this.parseEvent = function(event) {
    if (typeof(event.data) === "string") {
      try {
        return JSON.parse(event.data);
      } catch (e) {
        log.warn("[player-instance] Can't parse: ", event.data, " as json");
        return {};
      }
    } else {
      return event.data;
    }
  };

  this.addListener = function(name, callback) {
    listener.addListener(function(event) {
      var data = that.parseEvent(event);

      log.debug("[addListener] [handler] message: " + data.message);
      log.debug("[addListener] [handler]", data.message, "===", name, data.message === name);
      log.debug("[addListener] [handler] name: ", name);
      if (data.message === name) {
        callback(data);
      }
    });
  };

  initialize(element, options);
};

module.exports = Instance;