(function () {

  var MathJaxService = function ($timeout) {

    this.parseDomForMath = function (delay) {
      $timeout(function () {
        if (!_.isUndefined(MathJax)) {
          MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
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
