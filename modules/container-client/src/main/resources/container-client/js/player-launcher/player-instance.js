
var Instance = function(element, options, log){

  log = log || { error: function(s){ console.error(s); }, debug: function(s){ console.debug(s); } };

  var listener = require("root-level-listener").init();

  listener.clearListeners();

  //TODO: move this elsewhere?
  var renderPlayer = function (e, options) {
    var id = options.mode === "gather" ? options.itemId : options.sessionId;
    var path = options.mode === "gather" ? options.itemPath : options.sessionPath;
    var url = (options.corespringUrl + path).replace(":id", id);

    $(e).html("<iframe id='iframe-player' frameborder='0' src='" + url + "' style='width: 100%; min-height: 700px; border: none'></iframe>");
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

    var resultHandler = function(){

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

  this.addListener = function(name, callback){

     listener.addListener(function (event) {
        try {
          var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;

          if (data.message === name) {
            callback(data);
          }
        }
        catch (e) {
          log.error("Exception in [player-instance] addListener: " + e.message);
        }
      });
  };

  renderPlayer(element, options);
};

var instance = null;

exports.make = function(element, options){
  instance = new Instance(element, options);
  return instance;
};