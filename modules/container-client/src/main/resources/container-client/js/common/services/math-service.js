/* global MathJax */
(function () {

  var MathJaxMsgTypes = {
    endProcess:"End Process"
  };

  var MathJaxService = function ($timeout) {

    this.parseDomForMath = function(delay, element) {
      $timeout(function () {
        if (typeof MathJax !== 'undefined' && !_.isUndefined(MathJax)) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
        }
      }, delay || 100);
    };

    var listeners = [];

    var onHubSignnal = function(message) {
      _.each(listeners,function(listener){
        if (message && _.isArray(message)){
          var type = message[0];

          if (listener.type === type){
            try{
              listener.callback.apply(null, _.rest(message));
            }catch(e){}
          }
        }
      });
    };

    this.onEndProcess = function(callback,element){

      var listener = {
        callback: callback,
        element: element,
        type: MathJaxMsgTypes.endProcess
      };

      listeners.push(listener);
    };

    this.off = function(callback,element){
      _.remove(listeners, function(listener) {
        return listener.callback === callback && listener.element === element;
      });
    };

    // Register for hub signals
    MathJax.Hub.signal.Interest(onHubSignnal);

  };

  angular.module('corespring-common.services')
    .service('MathJaxService',
      [
        '$timeout',
        MathJaxService
      ]
    );
})();
