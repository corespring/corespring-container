angular.module('corespring-editor.services')
  .value('throttle', function(fn){
    _.throttle(fn, 500, {trailing: true, leading: false});
  });
