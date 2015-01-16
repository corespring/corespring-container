angular.module('corespring-player.directives').directive('dimensionPropagator',
  ['$log', 'Msgr', function($log, Msgr) {

    function calculateContentHeight() {
      var visible = $("body :visible");
      var max = 0;
      visible.each(function() {
        var rect = this.getBoundingClientRect();
        max = Math.max(rect.bottom, max);
      });
      return max;
    }

    return {

      link: function($scope, $element) {

        var $body = $element.parents('body');

        var lastW, lastH;
        var counter = 0;
        var highFrequencyDelay = 10;
        var lowFrequencyDelay = 100;
        var frequencyChangesAt = 2000;

        function different(w, h) {
          return lastH !== h || lastW !== w;
        }

        function dispatchDimensions() {
          var b = $body[0];
          if (!b) {
            return;
          }

          var w = b.clientWidth;
          var h = calculateContentHeight();

          if (different(w, h)) {
            lastW = w;
            lastH = h;
            Msgr.send('dimensionsUpdate', {w: w, h: h});

            counter = 0;
          }
          var delay = (counter * highFrequencyDelay < frequencyChangesAt) ? highFrequencyDelay : lowFrequencyDelay;
          counter = counter + 1;
          clearTimeout(timeout);
          timeout = setTimeout(dispatchDimensions, delay);
        }

        var timeout = setTimeout(dispatchDimensions, 1);
        dispatchDimensions();
      }
    };
  }]);
