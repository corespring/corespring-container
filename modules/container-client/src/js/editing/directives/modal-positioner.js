angular.module('corespring-editing.directives')
  .directive('modalPositioner', ['$log', 'ModalOpenDispatcher', 'Msgr', ModalPositioner]);

function ModalPositioner($log, ModalOpenDispatcher, Msgr) {

  return {
    link: link
  };

  function link(scope, $element) {
    ModalOpenDispatcher.setListener(onModalOpened);

    function onModalOpened(jqueryModal){
      Msgr.send('getScrollPosition', function(err, pos){
        jqueryModal.offset({top: Math.abs(pos.top)});
      });
    }
  }
}