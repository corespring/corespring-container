angular.module('corespring-player.directives').directive('dimensionPropagator', ['MessageBridge', function(MessageBridge) {

  return {

    link: function($scope, $element){

      var $body = $element.parent('body');

      var lastW = null;
      var lastH = null;

      var different = function(w,h){
        if(!lastW || !lastH){
          return true;
        }
        return lastW !== w || lastH !== h;
      };

      var dispatchDimensions = function(){
        var b = $body[0];
        if (!b) {return;}

        var w = b.clientWidth;
        var h = b.clientHeight;

        if(different(w,h)){
          lastW = w;
          lastH = h;
          var msg = {message:'dimensionsUpdate', w: w, h: h};
          MessageBridge.sendMessage('parent', msg, false);
        }
      };

      setInterval(dispatchDimensions, 400);
      dispatchDimensions();
    }
  };
}]);