(function(root){

  angular.module('corespring-editing.config')
    .value('configureTooltipProvider', configureTooltipProvider) //for testing
    .config(['$tooltipProvider', configureTooltipProvider]);

  function configureTooltipProvider($tooltipProvider) {
    //setTriggers sets up a map from events which open a tooltip to events which close this tooltip
    //Here we are adding ng-ui-tooltip-close as an event to close the tooltip
    //this enables you to hide the tooltip by calling elem.trigger('ng-ui-tooltip-close');
    $tooltipProvider.setTriggers({
      mouseenter: 'mouseleave ng-ui-tooltip-close',
      click: 'click ng-ui-tooltip-close',
      focus: 'blur ng-ui-tooltip-close'
    });
  }

})(this);