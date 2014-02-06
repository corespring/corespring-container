
var Instance = function(element, options, errorCallback, log){

  var errors = require("errors");

  var that = this;

  log = log || { 
    error: function(s){ console.error(s); }, 
    debug: function(s){ console.debug(s); },
    warn: function(s){ console.warn(s); }
  };

  var listener = require("root-level-listener")();

  listener.clearListeners();

  var initialize = function (e, options) {

    if(!options || !options.url){
      errorCallback( { code: 999, message: "No url specified" })
      return;
    }

    if($(e).length == 0){
      errorCallback( errors.CANT_FIND_IFRAME);
      return;
    }

    $(e).html("<iframe id='iframe-player' frameborder='0' src='" + options.url + "' style='width: 100%; min-height: 700px; border: none'></iframe>");
    $(e).width(options.width ? options.width : "600px");
  };

  var postMessage = function (message, data) {
    log.debug("Posting Message: ", message, data);
    try {
      var iframe = $(element).find('iframe')[0];
      if (!iframe) throw "iframe not found";

      var messageObject = {"message": message};
      iframe.contentWindow.postMessage(JSON.stringify($.extend(messageObject, data)), "*");
      return true;
    } catch (e) {
      log.error( "[player-instance]", message, data, e);
      return false;
    }
  };

  var expectResult = function (message, callback, dataProcessor) {
    
    dataProcessor = dataProcessor || (function (data) {
      return data;
    });

    var resultHandler = function(event){

      var uid = new Date().getTime();

      try {
        var dataString = event.data;
        var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;
        if (data.message == message) {
          callback(dataProcessor(data));
        }
      }
      catch (e) {
        log.error("Exception in [player-instance] : " + e);
      }
      listener.removeListener(this);
    };

    listener.addListener(resultHandler);
  };


  this.sendMessage = function(props){
    postMessage(props.message, props.data);

    var extractPropertyFromMessage = function (message) {
      return message[props.property];
    };

    if(props.callback){
      expectResult(props.message + "Result", props.callback, extractPropertyFromMessage);
    }
  };

  this.parseEvent = function(event){
     if(typeof(event.data) == "string"){
        try {
          return JSON.parse(event.data);
        }
        catch(e){
          log.warn( "[player-instance] Can't parse: ", event.data, " as json");
          return {};
        }
     } else {
        return event.data;
     }
  };

  this.addListener = function(name, callback){

    listener.addListener(function (event) {
      var data = that.parseEvent(event);

      log.debug("message: " + data.message);

      if (data.message === name) {
        callback(data);
      }
    });
  };

  initialize(element, options);
};

module.exports = Instance;
