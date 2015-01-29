angular.module('corespring-common.services').service('iFrameService', [
  function() {

    function iFrameService() {

      this.isInIFrame = function(_top, _window) {
        _top = _top ? _top : top;
        _window = _window ? _window : window;
        /** note use != to support ie8 instead of !== */
        return _top != _window; // jshint ignore:line
      };

    }

    return new iFrameService();
  }
]);