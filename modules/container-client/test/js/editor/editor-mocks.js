(function(){
  window.org = window.org || {};
  org.corespring = org.corespring || {};
  org.corespring.mocks = org.corespring.mocks || {};
  var e = org.corespring.mocks.editor = org.corespring.mocks.editor || {};
 

  e.MockPromise = function(){
    var onSuccess,onError;
    this.success = function(cb){
      onSuccess = cb;
      return this;
    };
    
    this.error = function(cb){
      onError = cb;
      return this;
    };

    this.triggerSuccess = function(){
      onSuccess.apply(null, Array.prototype.slice.call(arguments));
    };
    this.triggerError = function(){
      onError.apply(null, Array.prototype.slice.call(arguments));
    };
  };

  e.LogFactory = {
    getLogger: function(){
      return {
        debug: function(){},
        info: function(){},
        warn: function(){},
        error: function(){}
      };
    }
  };

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