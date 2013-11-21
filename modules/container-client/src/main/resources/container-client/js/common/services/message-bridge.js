 var MessageBridge = function(){

  /**
   * Add handler for 'message'
   * @param fn
   */
  this.addMessageListener = function (fn) {
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    eventer(messageEvent,function(e) {
      fn(e);
    },false);
  };

  var getParent = function(){ return (parent && parent != window) ? parent : null; };
  
  var getIframe = function(id){
    try{
      return document.getElementById(id).contentWindow;
    }
    catch(e){
      return null;
    }
  };

  /**
   * @param id - target either an iframe id or 'parent'
   * @param msg - a string or object - gets JSON.stringified unless disableStringify is true
   * @param disableStringify - Boolean, if true msg won't be JSON.stringified (please note
   * that IE only supports sending strings as message)
   */
  this.sendMessage = function (id, msg, disableStringify) {

    var target = (!id || id === "parent" ) ? getParent() : getIframe(id);

    if(target){
      target.postMessage(disableStringify ? msg : JSON.stringify(msg), "*");
    }
  };
};


angular.module('corespring-common.services').service('MessageBridge', [ MessageBridge ]);
