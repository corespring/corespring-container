angular.module('corespring-player.directives')
  .directive('dimensionPropagator', ['$log', '$timeout', 'Msgr', DimensionPropagator]);

function DimensionPropagator($log, $timeout, Msgr) {

  return {
    link: link
  };

  function link(scope, $element) {

    var highFrequencyDelay = 10;
    var lowFrequencyDelay = 100;
    var frequencyChangesAt = 2000;

    var counter = 0;
    var timeoutHandle;
    var lastSizes = [{w:0,h:0}];
    var $body = $element.parents('body');

    scope.$on('$destroy', function () {
      $timeout.cancel(timeoutHandle);
    });

    checkDimensions();

    //-----------------------------------------------------

    function checkDimensions() {
      if (dimensionsUpdated()) {
        counter = 0;
      } else {
        counter++;
      }
      var delay = (counter * highFrequencyDelay < frequencyChangesAt) ? highFrequencyDelay : lowFrequencyDelay;
      timeoutHandle = $timeout(checkDimensions, delay);
    }

    function dimensionsUpdated() {
      var b = $body[0];
      if (b) {
        var size = calculateSize(b);
        if (sizeHasChanged(size)) {
          //to avoid oscillation, we check if the size has been
          //seen before and if so, we choose the tallest of the
          //recent sizes
          if(lastSizesContains(size)) {
            size = getTallest(lastSizes);
            if(!sizeHasChanged(size)){
              return false;
            }
          }
          lastSizes.unshift(size);
          lastSizes = lastSizes.slice(0, 10);
          Msgr.send('dimensionsUpdate', size);
          return true;
        }
      }
      return false;
    }

    function calculateSize(b) {
      var w = b.clientWidth;
      var h = calculateContentHeight();
      var size = {w: w, h: h};
      return size;
    }

    function sizeHasChanged(size){
      var lastSize = lastSizes[0];
      return size.w !== lastSize.w || size.h !== lastSize.h;
    }

    function lastSizesContains(size){
      for(var i = 0; i < lastSizes.length; i++){
        var last = lastSizes[i];
        if(last.w === size.w && last.h === size.h){
          return true;
        }
      }
      return false;
    }

    function getTallest(lastSizes){
      var max = {w:0,h:0};
      for(var i = 0; i < lastSizes.length; i++){
        var last = lastSizes[i];
        if(last.h > max.h){
          max = last;
        }
      }
      return max;
    }

    function calculateContentHeight() {
      var visible = $("body :visible");
      var max = 0;
      visible.each(function () {
        var rect = this.getBoundingClientRect();
        max = Math.max(rect.bottom, max);
      });
      return max;
    }

  }
}
