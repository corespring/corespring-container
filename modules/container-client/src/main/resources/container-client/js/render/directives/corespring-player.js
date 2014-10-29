angular.module('corespring-player.directives', ['corespring-player.services']).directive('corespringPlayer', [
  'CorespringPlayerDefinition',
  function(CorespringPlayerDefinition) {
    return new CorespringPlayerDefinition({
      mode: 'player'
    });
  }
]);