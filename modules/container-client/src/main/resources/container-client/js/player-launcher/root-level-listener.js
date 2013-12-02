//Listener - requires the global window variable

var instance = null;

var rootListener = null;

var Listener = function(log){

  var uid = new Date().getTime();


  var eventName = function () {
    return window.addEventListener ? "message" : "onmessage";
  };

  var addEventFunctionName = function () {
    return window.addEventListener ? "addEventListener" : "attachEvent";
  };

  /** A cache of existing player listeners - gets overrwritten when a new ItemPlayer is instantiated */
  var listeners = [];

  /** only add one listener to the window, this function is expected to then delegate out to player listeners */
  var addRootLevelMessageListener = function (newListener) {
    if (rootListener !== null) {
      throw "A root level listener is already registered!";
    }
    rootListener = newListener;
    window[addEventFunctionName()](eventName(), rootListener, false);
  };

  /** The root listener implementation - forward event to all player listeners */
  var rootLevelListenerImpl = function (e) {
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](e);
    }
  };

  addRootLevelMessageListener(rootLevelListenerImpl);

  this.clearListeners = function(){
    listeners = [];
  };

  this.addListener = function(callback){
     if (listeners.indexOf(callback) == -1) {
      listeners.push(callback);
    }
  };
};

//new require('listener')(x)
exports.init = function(log){

  if(!log){

    log = {
      debug: function(){ console.debug(arguments);}
    }
  }

  if(!instance){
    instance = new Listener(log);
  } 
  return instance;
};

 