angular.module('corespring-player.directives').directive('corespringPlayer', [
  'CorespringPlayerDef',
  function(CorespringPlayerDef) {
    return new CorespringPlayerDef('player');
  }
]);