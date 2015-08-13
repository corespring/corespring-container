angular.module('corespring-editor.services')
  .service('editorDebounce', ['debounce', 'DEBOUNCE_IN_MILLIS', function(debounce, DEBOUNCE_IN_MILLIS){

    var flushables = {};

    function main(fn, delay, flushable){

      flushable = flushable === true;

      var debouncedFn = debounce(delay || DEBOUNCE_IN_MILLIS || 5000, fn);
      
      if(flushable && !flushables[fn]){
        flushables[fn] = debouncedFn; 
      }

      return debouncedFn;
    }

    main.flush = function(){
      _.mapValues(flushables, function(debouncedFn){
        debouncedFn.flushPending();
      });
    };
    return main;
  }]);
