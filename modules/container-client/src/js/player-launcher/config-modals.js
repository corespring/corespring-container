module.exports = configModals;

function configModals($provide) {

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

  var modalOpenDispatcher = new ModalOpenDispatcher();

  $provide.value('ModalOpenDispatcher', modalOpenDispatcher);

  $provide.decorator('$modal', function ($delegate) {
    return {open: newOpen};

    function newOpen(b) {
      var maxAttemptsToFindModal = 10;
      var modalMarker = "modal-" + new Date().getTime();
      b.windowClass = b.windowClass + " " + modalMarker;
      setTimeout(findModalByMarker, 100);
      return $delegate.open(b);

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
    }
  });
}

