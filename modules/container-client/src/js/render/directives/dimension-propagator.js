angular.module('corespring-player.directives').directive('dimensionPropagator',
  ['$log', 'Msgr', function($log, Msgr) {

  function calculateContentHeight(){
    var visible = $( "body :visible" );
    var max = 0;
    visible.each(function(){
      var rect = this.getBoundingClientRect();
      max = Math.max(rect.bottom,max);
    });
    return max;
  }

  return {

    link: function($scope, $element){

      var $body = $element.parents('body');

      var lastW;
      var lastH;

      function different(w,h){
        return lastW !== w || lastH !== h;
      }

      function dispatchDimensions(){
        var b = $body[0];
        if (!b) {return;}

        var w = b.clientWidth;
        var h = calculateContentHeight();

        if(different(w,h)){
          lastW = w;
          lastH = h;
          $log.debug("dispatchDimensions", w, h);
          Msgr.send('dimensionsUpdate',{w:w, h:h});
        }
      }

      setInterval(dispatchDimensions, 400);
      dispatchDimensions();
    }
  };
}]);
