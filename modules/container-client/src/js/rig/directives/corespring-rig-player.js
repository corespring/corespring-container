angular.module('corespring-rig.directives').directive('corespringRigPlayer', [
    '$log',
    'CorespringPlayerDefinition',
    function($log, CorespringPlayerDefinition) {
      return new CorespringPlayerDefinition({
        mode: 'rig'
      });
    }]);
