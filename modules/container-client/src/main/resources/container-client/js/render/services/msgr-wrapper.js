angular
  .module('corespring-player.services')
  .service('Msgr', [function(){
    /* global msgr */
    /** see github.com/corespring/msgr.js */
    return new msgr.Channel(window, window.parent);
  }]);
