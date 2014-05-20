angular.module('corespring.wiggi-wiz-features').factory('WiggiWizHelper', [
  '$timeout',
  function($timeout) {

    /**
     * Cross-browser support for moving caret of a [contenteditable=true] field to the end.
     * See: http://stackoverflow.com/a/4238971/985323
     */
    function moveCaretToEnd(el) {
      el.focus();
      if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
        var range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange !== "undefined") {
        var textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    }

    return {
      /**
       * Places caret at the end of element matching selector provided rooted at $element, then giving it focus. This
       * is on a slight delay in case Angular has not yet had time to render the directive at the root $element.
       */
      focusCaretAtEnd: function(selector, $element) {
        $timeout(function() {
          var el = $(selector, $element)[0];
          moveCaretToEnd(el);
          el.focus();
        }, 200);
      }

    };

  }
]);