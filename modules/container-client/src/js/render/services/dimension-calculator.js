angular.module('corespring-player.services').factory('DimensionCalculator', [function () {

  return DimensionCalculator;


  function DimensionCalculator() {

    var lastSizes = [{w: 0, h: 0}];

    this.calcUpdatedDimensions = calcUpdatedDimensions;

    //-------------------------------------------------

    function calcUpdatedDimensions(size) {
      if (sizeHasChanged(size)) {
        //to avoid oscillation, we check if the size has been
        //seen before and if so, we choose the tallest of the
        //recent sizes
        if (lastSizesContains(size)) {
          size = getTallest(lastSizes);
          if (!sizeHasChanged(size)) {
            return null;
          }
        }
        lastSizes.unshift(size);
        lastSizes = lastSizes.slice(0, 10);
        return size;
      }
      return null;
    }

    function sizeHasChanged(size) {
      var lastSize = lastSizes[0];
      return size.w !== lastSize.w || size.h !== lastSize.h;
    }

    function lastSizesContains(size) {
      for (var i = 0; i < lastSizes.length; i++) {
        var last = lastSizes[i];
        if (last.w === size.w && last.h === size.h) {
          return true;
        }
      }
      return false;
    }

    function getTallest(lastSizes) {
      var max = {w: 0, h: 0};
      for (var i = 0; i < lastSizes.length; i++) {
        var last = lastSizes[i];
        if (last.h > max.h) {
          max = last;
        }
      }
      return max;
    }
  }

}]);
