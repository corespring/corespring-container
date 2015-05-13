describe('player-launcher.editor', function () {

  var origRequire = corespring.require;

  function MockErrors(errs) {
    this.errors = errs;
    this.hasErrors = function () {
      return this.errors && this.errors.length > 0;
    };
  }

  function mkCall(name){
    return {method: name, url: name};
  }
  
  var mockLauncher, mockInstance;

  function MockLauncher(){

    this.init = jasmine.createSpy('init').and.returnValue(true);

    this.loadInstance = jasmine.createSpy('loadInstance').and.returnValue(mockInstance);
    
    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(){
      return {method: 'GET', url: 'catalog/:itemId'};
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function(){
      return mockInstance;
    });

    this.prepareUrl = jasmine.createSpy('prepareUrl').and.callFake(function(){
      return Array.prototype.join.call(arguments, '-');
    });

    this.log = function(){};
  }


  /**
   * Mock some of the dependencies loaded by 'require' by using corespring.mock.
   * Call the callback and pass the configured env.
   * Note: we make use of corespring.mock in these specs:
   *  console.log(corespring.mock);
   */
  function withRequire(obj, fn){

    mockLauncher = new MockLauncher();

    var env = {
      'client-launcher' : function(){
        return mockLauncher;
      }
    };

    return function(){
      var e = _.assign(env,obj);
      _.map(e, function(value, key){
        console.log('adding', key, 'to mock modules');
        corespring.mock.modules[key] = value;
      });
      fn(e);
    };
  }

  afterEach(function(){
    corespring.mock.reset();
  });

  var errorCodes = corespring.require('error-codes');


  describe('constructor', function(){

    describe('init', function(){

      var onError;
      var editor;
      beforeEach(function(){
        onError = jasmine.createSpy('onError');
        var Editor = new corespring.require('editor');
        var editor = new Editor('element', {}, onError);
      });

      it('calls launcher.init', function(){
        expect(true).toEqual(false);
      });
    });

    /*describe('with no options', function(){

      it('should create the item and draft', withRequire({},
        function(){

          spyOn($, 'ajax');

          var opts = {
            onItemCreated: jasmine.createSpy('onItemCreated'),
            onDraftCreated: jasmine.createSpy('onDraftCreated')
          };

          var editor = new (corespring.require('editor'))('blah', opts, onError);
          expect(onError).not.toHaveBeenCalled();
          var ajax = $.ajax.calls.mostRecent().args[0];
          expect(ajax.type).toEqual('createItemAndDraft');
          expect(ajax.url).toEqual('http://base/createItemAndDraft?a=a');
          expect(ajax.success).not.toBe(null);
          expect(ajax.error).not.toBe(null);
          expect(ajax.dataType).toEqual('json');

          ajax.success({itemId: '1', draftName: 'name'});
          expect(opts.onDraftCreated).toHaveBeenCalledWith('1', 'name');
      }));*/

    });

    /*describe('with itemId', function(){

      var instance = jasmine.createSpy('instance-one').and.callFake(function(){
        return {
          on: jasmine.createSpy('on').and.callFake(function(name, cb){
          }),
          send: jasmine.createSpy('send')
        };
      });

      it('should load the editor with itemId and a generated draftName',  withRequire({ 'instance' : instance },
       function(env){
        var opts =  {
          itemId: 'itemId',
          onDraftCreated: jasmine.createSpy('onDraftCreated')
        };
        var editor = new (corespring.require('editor'))('blah', opts, onError);
        expect(instance).toHaveBeenCalled();
        var constructorArgs = instance.calls.mostRecent().args[1];
        expect(constructorArgs.itemId).toEqual('itemId');
        expect(constructorArgs.url.indexOf('http://base/editor/itemId~')).toEqual(0);
      }));
    });

    describe('with draftName', function(){

      var readyHandler = null;
      var instance = jasmine.createSpy('instance!!').and.callFake(function(){
        return {
          on: jasmine.createSpy('on').and.callFake(function(name, cb){
            if(name === 'ready'){
              readyHandler = cb;
            }
          }),
          send: jasmine.createSpy('send')
        };
      });

      it('should load the editor with itemId~draftName',  withRequire({
        instance: instance
      }, function(){
        var opts = {
          itemId: 'itemId',
          draftName: 'draftName',
          onDraftLoaded: jasmine.createSpy('onDraftLoaded')
        };
        var editor = new (corespring.require('editor'))('blah', opts, onError);
        expect(instance).toHaveBeenCalled();
        var constructorArgs = instance.calls.mostRecent().args[1];
        expect(constructorArgs.url).toEqual('http://base/editor/itemId~draftName');
        readyHandler();
        expect(opts.onDraftLoaded).toHaveBeenCalled();
      }));
    });
  });

  describe('commitDraft', function(){
    it('calls commitDraft endpoint and returns an error', withRequire({}, function(){
      var editor = new (corespring.require('editor'))('blah', {draftId: 'draftId'}, function(){});
      spyOn($, 'ajax').and.callFake(function(opts){
        opts.error({responseJSON: { error: 'error!'}});
      });
      var callback = jasmine.createSpy('callback');
      editor.commitDraft(false, callback);
      expect(callback).toHaveBeenCalledWith({code: 111, msg: 'error!'});
    }));

    it('calls commitDraft endpoint and returns success', withRequire({}, function(){
      var editor = new (corespring.require('editor'))('blah', {draftId: 'draftId'}, function(){});
      spyOn($, 'ajax').and.callFake(function(opts){
        opts.success({});
      });
      var callback = jasmine.createSpy('callback');
      editor.commitDraft(false, callback);
      expect(callback).toHaveBeenCalledWith(null);
    }));
  });
  */
});
