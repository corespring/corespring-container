var Instance = function(element, options, errorCallback, log) {

  var errors = require("errors");

  var that = this;

  log = log || {
    error: function(s) {
      console.error(s);
    },
    warn: function(s) {
      console.warn(s);
    }
  };

  var findInstanceIframe = function() {
    if (that.iframeRef) {
      return that.iframeRef;
    }
    that.iframeRef = $(element).find('iframe');
    if (!that.iframeRef) {
      log.error("No iframe was found in player instance");
    }
  };

  var isMessageDestinedForInstance = function(event) {
    var eventIframe = findDestinationIframe(event);
    var instanceIframe = findInstanceIframe();
    if (instanceIframe === eventIframe) {
      return true;
    } else {
      return (instanceIframe && eventIframe) && instanceIframe[0] === eventIframe[0];
    }
  };

  var forThisInstance = function(fn) {
    return function(event) {
      if (isMessageDestinedForInstance(event)) {
        fn(event);
      }
    };
  };

  var listener = require("root-level-listener")(log);
  var listenersToRemove = [];

  var findDestinationIframe = function(event) {
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === event.source) {
        return $(frames[i]);
      }
    }
  };

  function detachOnRemove(handler) {
    listenersToRemove.push(handler);
  }

  function removeListeners() {
    for (var i = 0; i < listenersToRemove.length; i++) {
      listener.removeListener(listenersToRemove[i]);
    }
    listenersToRemove = [];
  }

  function dimensionChangeListener(element) {
    function listenerFunction(data, event) {
      try {
        var json = JSON.parse(data);
        if (json.message === 'dimensionsUpdate') {
          var iframe = findDestinationIframe(event);
          if (iframe) {
            iframe.height(json.h);
          } else {
            $(element).height(json.h);
          }
        }
      } catch (e) {
        // Ignore json parsing errors (message was not meant for us)
        if (!(e instanceof SyntaxError)) {
          log.error("Exception in dimensionChangeListener: " + e + " for data: " + data);
        }
      }
    }

    var listenerFn = function(e) {
      listenerFunction(e.data, e);
    };

    listener.addListener(listenerFn);
    detachOnRemove(listenerFn);
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

    function makeUrl(url, queryParams) {
      var Builder = require('url-builder');
      return new Builder().build(url, queryParams);
    }

    var url = makeUrl(options.url, options.queryParams);
    if (options.showPreview === true) {
      url += "#/?showPreviewButton";
    }

    $(e).html("<iframe id='iframe-player' frameborder='0' src='" + url + "' style='width: 100%; border: none'></iframe>");

    if (options.forceWidth) {
      $(e).width(options.width ? options.width : "600px");
    }

    dimensionChangeListener(e);

    $(element).parent().bind('DOMNodeRemoved', function(e) {
      if ('#'+e.target.id === element) {
        removeListeners();
      }
    });
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

    var resultHandlerForThisInstance;

    var resultHandler = function(event) {
      listener.removeListener(resultHandlerForThisInstance);
      var index = listenersToRemove.indexOf(resultHandlerForThisInstance);
      if (index >= 0) {
        listenersToRemove.splice(index, 1);
      }

      try {
        var data = typeof(event.data) === "string" ? JSON.parse(event.data) : event.data;
        if (data.message === message) {
          callback(dataProcessor(data));
        }
      } catch (e) {
        log.error("Exception in [player-instance] : " + e);
      }
    };

    resultHandlerForThisInstance = forThisInstance(resultHandler);
    listener.addListener(resultHandlerForThisInstance);
    detachOnRemove(resultHandlerForThisInstance);
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
        log.warn("[player-instance] Can't parse: " + event.data + " as json", event);
        return {};
      }
    } else {
      return event.data;
    }
  };

  this.addListener = function(name, callback) {
    var listenerForThisInstance = forThisInstance(function(event) {
      var data = that.parseEvent(event);

      if (data.message === name) {
        callback(data);
      }
    });

    listener.addListener(listenerForThisInstance);
    detachOnRemove(listenerForThisInstance);
  };

  this.remove = function() {
    removeListeners();
    $(element).remove();
  };

  initialize(element, options);
};

module.exports = Instance;