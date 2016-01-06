/* global MathJax */
(function() {

  var MathJaxMsgTypes = {
    endProcess: "End Process"
  };

  var MathJaxService = function($timeout) {

    this.parseDomForMath = function(delay, element) {

      function renderMath() {
        if (typeof MathJax !== 'undefined' && !_.isUndefined(MathJax)) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, element], function() {
            var $element;
            if (element) {
              $element = $(element);
              if ($element.attr('mathjax')) {
                $element.addClass('rendered');
              } else {
                $element.find('span[mathjax]').addClass('rendered');
              }
            } else {
              $('span[mathjax]').addClass('rendered');
            }
          });
        }
      }

      //TODO Clean up the code once we decide to use that 'fix'
      //Don't use the element, bc. it slows rendering down
      element = undefined;
      if (delay === 0) {
        renderMath();
      } else {
        $timeout(renderMath, delay || 100);
      }
    };

    var listeners = [];

    var onHubSignal = function(message) {
      _.each(listeners, function(listener) {
        if (message && _.isArray(message)) {
          var type = message[0];
          if (listener && listener.type === type) {
            try {
              listener.callback.apply(null, _.rest(message));
            } catch (e) {}
          }
        }
      });
    };

    this.onEndProcess = function(callback, element) {
      _.remove(listeners, _.isUndefined);
      var listener = {
        callback: callback,
        element: element,
        type: MathJaxMsgTypes.endProcess
      };

      listeners.push(listener);
    };

    this.off = function(callback, element) {
      _.remove(listeners, function(listener) {
        return listener.callback === callback && listener.element === element;
      });
    };

    // Register for hub signals
    MathJax.Hub.signal.Interest(onHubSignal);
    MathJax.Hub.Config({
      showProcessingMessages: false
    });

  };

  angular.module('corespring-common.services')
    .service('MathJaxService', [
        '$timeout',
        MathJaxService
      ]);
})();