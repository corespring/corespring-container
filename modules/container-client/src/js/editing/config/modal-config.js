angular.module('corespring-editing.config')
  .config(['$provide', function($provide) {

  function ModalOpenDispatcher() {
    var listener = null;

    this.setListener = function (value) {
      listener = value;
    };

    this.propagate = function (jqueryModal) {
      try {
        listener(jqueryModal);
      } catch (e) {
        console.warn("[ModalOpenDispatcher] Error executing listener", listener, e);
      }
    };
  }

  function ModalDecorator($modalDelegate){

    this.open = function(b) {
      var maxAttemptsToFindModal = 10;
      var modalMarker = "modal-" + new Date().getTime();
      b.windowClass = b.windowClass + " " + modalMarker;
      setTimeout(findModalByMarker, 100);
      return $modalDelegate.open(b);

      function findModalByMarker() {
        var $modal = $('.' + modalMarker);
        if ($modal.length > 0) {
          modalOpenDispatcher.propagate($modal);
        } else {
          if (--maxAttemptsToFindModal > 0) {
            setTimeout(findModalByMarker, 100);
          }
        }
      }
    };
  }

  var modalOpenDispatcher = new ModalOpenDispatcher();
  $provide.value('ModalOpenDispatcher', modalOpenDispatcher);

  $provide.decorator('$modal', function($delegate) {
    return new ModalDecorator($delegate);
  });
}]);