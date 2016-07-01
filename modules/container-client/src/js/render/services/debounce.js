angular.module('corespring-player.services')
  .value('debounce', function(fn, delay, options) {

    return _.debounce(fn, delay || 500, options || {
      trailing: true,
      leading: false
    });
  });