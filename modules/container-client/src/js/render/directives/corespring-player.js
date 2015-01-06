angular.module('corespring-player.directives').directive('corespringPlayer', [
  'CorespringPlayerDefinition',
  function(CorespringPlayerDefinition) {
    return new CorespringPlayerDefinition({
      mode: 'player'
    });
  }
]);