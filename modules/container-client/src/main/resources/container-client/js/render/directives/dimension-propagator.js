angular.module('corespring-player.directives').directive('dimensionPropagator',
  ['$log', 'MessageBridge', function($log, MessageBridge) {

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
        var h = b.clientHeight;

        if(different(w,h)){
          lastW = w;
          lastH = h;
          $log.debug("dispatchDimensions", w, h);
          MessageBridge.sendMessage('parent', {message:'dimensionsUpdate', w: w, h: h});
        }
      }

      setInterval(dispatchDimensions, 400);
      dispatchDimensions();
    }
  };
}]);