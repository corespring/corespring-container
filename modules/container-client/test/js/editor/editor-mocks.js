(function(){
  window.org = window.org || {};
  org.corespring = org.corespring || {};
  org.corespring.mocks = org.corespring.mocks || {};
  var e = org.corespring.mocks.editor = org.corespring.mocks.editor || {};
 

  e.$modalInstance = function(){

    this.reset = function(){
      this.close.calls.reset();
      this.dismiss.calls.reset();
      this.opened.then.calls.reset();
    };

    this.close = jasmine.createSpy('close');
    this.dismiss = jasmine.createSpy('dismiss');
    this.opened = {
      then: jasmine.createSpy('opened.then').and.callFake(function(cb){
        cb();
      })
    };
  };

  e.Msgr = function(){ 
    return {
      on: jasmine.createSpy('on'),
      send: jasmine.createSpy('send')
    };
  };

  e.DesignerService = function(){ return { 
    loadAvailableUiComponents: jasmine.createSpy('loadAvailableUiComponents')
      .and.callFake(function(done){
      done([]);
    })};
  };

  e.ComponentDefaultData = function(){
    return {
      getDefaultData: jasmine.createSpy('getDefaultData').and.returnValue({})
    };
  };

  e.ComponentData = function(){ 
    return {
      setModel: jasmine.createSpy('setModel'),
      registerComponent: jasmine.createSpy('registerComponent'),
      setEditable: jasmine.createSpy('setEditable')
    };
  };

  e.iFrameService = function(){
    return {
      isInIFrame: jasmine.createSpy('isInIFrame'),
      bypassIframeLaunchMechanism: jasmine.createSpy('bypassIframeLaunchMechanism')
    };
  };

  e.$timeout =  function() {
    var timeout = function(fn){
      fn();
    };
    timeout.cancel = function(){};
    timeout.flush = function(){};
    return timeout; 
  };

  e.Stash = function Stash(holder, name, mock){

    var stashed;

    stashed = holder[name];
    holder[name] = mock;
    
    this.unstash = function(){
      holder[name]= stashed;
    };
  };

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


  e.$log = function(){ 
    return {
      debug: jasmine.createSpy('debug'),
      error: jasmine.createSpy('error')
    };
  };

  e.LogFactory = function(){

    this.getLogger = function(){
      this.logger = {
        debug: jasmine.createSpy('debug'),
        log: jasmine.createSpy('log'),
        info: jasmine.createSpy('info'),
        warn: jasmine.createSpy('warn'),
        error: jasmine.createSpy('error')
      };
      return this.logger;
    };
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
        if(newValue && newValue !== oldValue){
          fn(newValue, oldValue);
        }
      };
    });
  };


  e.withWindowMocks = function(mocks, fn){

    function getTargetObject(root, key){

      function _getTarget(root, steps){
        if(steps.length === 1){
          return { target: root, key: steps[0]};
        } else {
          var subKey = steps.shift();
          root[subKey] = root[subKey] || {};
          return _getTarget(root[subKey], steps.slice());
        }
      }
      return _getTarget(root, key.split('.'));
    }

    var stash = {};
    beforeEach(function(){
      for(var x in mocks){
        var targetAndKey = getTargetObject(window, x);
        stash[x] = targetAndKey.target[targetAndKey.key];
        targetAndKey.target[targetAndKey.key] = mocks[x];
      }
    });

    fn(mocks);

    afterEach(function(){
      for(var x in stash){
        var tk = getTargetObject(window, x);
        tk.target[tk.key] = stash[x];
      }
    });
  };

  e['com.ee.RawFileUploader'] = function(){
    return function(file, result, url, name, opts){
      var uploadOpts = opts;
      this.beginUpload = jasmine.createSpy('beginUpload').and.callFake(function(){
        uploadOpts.onUploadComplete({}, 200);
      });
    };
  };

  e.FileReader = function(){
    return function(){
      var out = {};
      out.readAsBinaryString =  jasmine.createSpy('readAsBinaryString').and.callFake(function(){
        out.onloadend();
      });
      return out;
    };
  };
})();