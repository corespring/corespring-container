angular.module('corespring-editor.services')
  .value('throttle', function(fn) {
    return _.throttle(fn, 500, {
      trailing: true,
      leading: false
    });
  });