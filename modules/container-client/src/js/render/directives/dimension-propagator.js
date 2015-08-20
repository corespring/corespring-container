angular.module('corespring-player.directives')
  .directive('dimensionPropagator', ['$log', '$timeout', 'DimensionCalculator', 'Msgr', DimensionPropagator]);

function DimensionPropagator($log, $timeout, DimensionCalculator, Msgr) {

  return {
    link: link
  };

  function link(scope, $element) {

    var highFrequencyDelay = 10;
    var lowFrequencyDelay = 100;
    var frequencyChangesAt = 2000;

    var counter = 0;
    var timeoutHandle;

    var calculator = new DimensionCalculator();

    var $body = $element.parents('body');

    scope.$on('$destroy', function() {
      $timeout.cancel(timeoutHandle);
    });

    checkDimensions();

    //-----------------------------------------------------

    function checkDimensions() {
      var b = $body[0];
      if (b) {
        var updatedSize = calculator.calcUpdatedDimensions(calculateSize(b));
        if (updatedSize) {
          Msgr.send('dimensionsUpdate', updatedSize);
          counter = 0;
        } else {
          counter++;
        }
      }
      var delay = (counter * highFrequencyDelay < frequencyChangesAt) ? highFrequencyDelay : lowFrequencyDelay;
      timeoutHandle = $timeout(checkDimensions, delay);
    }

    function calculateSize(b) {
      var size = {
        w: b.clientWidth,
        h: calculateHeight()
      };
      return size;
    }

    function calculateHeight() {
      var visible = $("body :visible");
      var max = 0;
      visible.each(function() {
        var rect = this.getBoundingClientRect();
        max = Math.max(rect.bottom, max);
      });
      return max;
    }



  }
}