angular.module('corespring-editor.services')
  .factory('debounce', ['DEBOUNCE_IN_MILLIS', function(DEBOUNCE_IN_MILLIS) {
    return function (fn, ms) {
      return _.debounce(fn, ms || DEBOUNCE_IN_MILLIS || 5000, {
        trailing: true,
        leading: false
      });
    };
  }]);
