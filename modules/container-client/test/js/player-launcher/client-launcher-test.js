describe('client-launcher', function(){


  var ClientLauncher = corespring.require('client-launcher');
  var errorCodes = corespring.require('error-codes');
  var onError;
  var mockInstance; 
  var mockConfig = {};

  beforeEach(function(){
    corespring.mock.modules['launch-config'] = {};
    corespring.mock.modules.instance = org.corespring.mocks.launcher.MockInstance;
    onError = jasmine.createSpy('onError');
  });

  afterEach(function(){
    corespring.mock.reset();
  });

  describe('init', function(){

   var c = { 'launch-config' : {
      'errors' : ['error one']
    }};

    it('triggers an error if there are launchConfig errors', function(){
      corespring.mock.modules['launch-config'] = {errors: ['error one']};
      var launcher = new ClientLauncher('e', {}, onError);
      var ok = launcher.init();
      expect(ok).toBe(false);
      expect(onError).toHaveBeenCalledWith(errorCodes.EXTERNAL_ERROR('error one'));
      expect(onError.calls.count()).toEqual(1);
    });
    
    it('triggers 2 errors if there are launchConfig errors', function(){
      corespring.mock.modules['launch-config'] = {errors: ['error one', 'error two']};
      var launcher = new ClientLauncher('e', {}, onError);
      var ok = launcher.init();
      expect(ok).toBe(false);
      expect(onError).toHaveBeenCalledWith(errorCodes.EXTERNAL_ERROR('error two'));
      expect(onError.calls.count()).toEqual(2);
    });

    it('should return true if the validation function returns an empty array', function(){
      var launcher = new ClientLauncher('e', {}, onError);
      var ok = launcher.init(function (opts){
        return null; 
      });
      expect(ok).toEqual(true);
    });

    it('should return true if the validation function returns an empty array', function(){
      var launcher = new ClientLauncher('e', {}, onError);
      var ok = launcher.init(function (opts){
        return []; 
      });
      expect(ok).toEqual(true);
    });
    
    it('should return false if the validation returns an non empty array', function(){
      var launcher = new ClientLauncher('e', {}, onError);
      var ok = launcher.init(function (opts){
        return [{code: 1, message: 'msg'}]; 
      });
      expect(ok).toEqual(false);
    });
    
    it('should return call the errorCallback for a non empty array', function(){
      var launcher = new ClientLauncher('e', {}, onError);
      var ok = launcher.init(function (opts){
        return [{code: 1, message: 'msg'}]; 
      });
      expect(onError.calls.count()).toEqual(1);
    });

    it('logs warnings', function(){
      pending();
    });
  });


  describe('loadInstance', function(){

    var launcher;
    var instance; 

    var onReady;

    var opts = {onClientReady: jasmine.createSpy('onClientReady')};
    beforeEach(function(){
      onReady = jasmine.createSpy('onReady');
      launcher = new ClientLauncher('e', opts, onError);
      instance = launcher.loadInstance({}, {}, { init: true }, onReady);
    });

    it('creates the instance', function(){
      expect(instance).toBeDefined();
    });
    
    it('adds launch-error handler', function(){
      expect(instance.on).toHaveBeenCalledWith('launch-error', jasmine.any(Function));
    });
    
    it('calls the ready handler', function(){
      instance.trigger('ready');
      expect(onReady).toHaveBeenCalled();
    });

    it('calls onClientReady callback', function(){
      instance.trigger('ready');
      expect(opts.onClientReady).toHaveBeenCalled();
    });

    it('adds launch-config params', function(){
      corespring.mock.modules['launch-config'] = { queryParams: { a : 'a'}};
      launcher = new ClientLauncher('e', {}, onError);
      instance = launcher.loadInstance({url: 'url'}, {}, {}, function(){});
      expect(instance.constructorArgs[0]).toEqual( { call: {url: 'url'}, queryParams: {a: 'a'}, data: {}});
      expect(instance.constructorArgs[1]).toEqual('e');
    });
    
    it('calls the errorCallback if ready before loadInstance is called', function(){
      launcher = new ClientLauncher('e', {}, onError);
      instance = launcher.loadInstance({url: 'url'}, {}, {}, function(){});
      launcher.isReady = true;
      instance.trigger('ready');
      expect(onError).toHaveBeenCalled();  
      expect(instance.removeChannel).toHaveBeenCalled();  
    });
  });

  describe('loadCall', function(){

    var launcher;

    it('fails if the path does not exist', function(){
      launcher = new ClientLauncher('e', {}, onError);
      var call = launcher.loadCall('apple');
      expect(onError).toHaveBeenCalledWith(errorCodes.CANT_FIND_URL('can not find url for key: apple'));  
    });
    
    it('fails if the path does not exist in the launch config', function(){
      launcher = new ClientLauncher('e', {}, onError);
      var call = launcher.loadCall('apple.banana' );
      expect(onError).toHaveBeenCalledWith(errorCodes.CANT_FIND_URL('can not find url for key: apple.banana'));  
    });
    
    it('returns the call if it exists in the config', function(){
      var launchConfig = { corespringUrl: 'corespring.org/', paths : { apple: { banana: { method: 'GET', url: '/banana'}}}};
      corespring.mock.modules['launch-config'] = launchConfig;
      launcher = new ClientLauncher('e', {}, onError);
      var call = launcher.loadCall('apple.banana');
      var banana = launchConfig.paths.apple.banana;
      expect(call).toEqual(
        { method: banana.method, 
          url: launchConfig.corespringUrl + banana.url,
          key: 'apple.banana',
          queryParams: {}
        });
    });
  });
});
