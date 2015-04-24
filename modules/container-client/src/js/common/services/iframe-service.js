angular.module('corespring-common.services').service('iFrameService', [
  '$window',
  function($window) {

    function iFrameService() {

      this.isInIFrame = isInIFrame;
      this.bypassIframeLaunchMechanism = bypassIframeLaunchMechanism;

      function isInIFrame(_top, _window) {
        _top = _top ? _top : top;
        _window = _window ? _window : window;
        /** note use != to support ie8 instead of !== */
        return _top != _window; // jshint ignore:line
      }

      function bypassIframeLaunchMechanism() {
        var bypass = $window.location.search.indexOf('bypass-iframe-launch-mechanism') !== -1;
        return bypass;
      }
    }

    return new iFrameService();
  }
]);