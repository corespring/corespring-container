angular.module('corespring-player.services')
  .factory('ComponentRegister', ['$log', '$rootScope','ComponentRegisterDefinition',
  function($log, $rootScope, ComponentRegisterDefinition) {
    var log = $log.debug.bind($log, '[component-register]');
    return new ComponentRegisterDefinition();
  }
]);
