(function () {

  var MathJaxService = function ($timeout) {

    this.parseDomForMath = function (delay) {
      if (!_.isUndefined(MathJax)) {
        $timeout(function () {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub])
        }, delay || 0);
      }
    }

  };

  angular.module('corespring-common.services')
    .service('MathJaxService',
      [
        '$timeout',
        MathJaxService
      ]
    );
})();
