angular.module('corespring-editor.controllers')
  .controller(
    'Root',
    [ '$scope', '$log', 'ItemService',
      function($scope, $log, ItemService){
        $log.debug('Root');
      }
   ]
);
