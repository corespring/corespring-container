(function(){
  window.org = window.org || {};
  org.corespring = org.corespring || {};
  org.corespring.mocks = org.corespring.mocks || {};
  var e = org.corespring.mocks.editor = org.corespring.mocks.editor || {};

  e.debounce = function(fn){
    return function(){
      var args = Array.prototype.slice.call(arguments);
      fn.apply(null, args);
    };
  };

  e.EditorChangeWatcher = function(){ 
    this.makeWatcher = jasmine.createSpy('makeWatcher').and.callFake(function(part, fn, scope){
      return function(newValue, oldValue){
        if(newValue){
          fn(newValue, oldValue);
        }
      };
    });
  };
})();