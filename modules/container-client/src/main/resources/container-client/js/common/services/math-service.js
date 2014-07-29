/* global MathJax */
(function () {

  var MathJaxService = function ($timeout) {

    this.parseDomForMath = function(delay, element) {
      $timeout(function () {
        if (typeof MathJax !== 'undefined' && !_.isUndefined(MathJax)) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
        }
      }, delay || 100);
    };
  };

  angular.module('corespring-common.services')
    .service('MathJaxService',
      [
        '$timeout',
        MathJaxService
      ]
    );
})();
