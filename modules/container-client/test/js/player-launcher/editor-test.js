describe('editor launcher', function () {

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

  /** Note: we make use of corespring.mock in these specs:
   *  console.log(corespring.mock);
   */
  function withRequire(obj, fn){
    
    var env = {
      'query-params' : {
        a: 'a'
      },
      'default-options': {
        corespringUrl: 'http://base/',
        paths: {
          create: mkCall('create'),
          createDraft: mkCall('createDraft'),
          editor: mkCall('editor/:draftId'),
          commitDraft: mkCall('commitDraft')
        }
      },
      instance : function(){
        this.on = function(){};
      },
      'launcher-errors' : new MockErrors([]) 
    };

    return function(){
      var e = _.assign(env,obj);
      _.map(e, function(value, key){
        corespring.mock.modules[key] = value;
      });
      fn();
    };
  }

  afterEach(function(){
    corespring.mock.reset();
  });

  var errors = corespring.require('errors');


  describe('constructor', function(){

    var onError;
    
    beforeEach(function(){
      onError = jasmine.createSpy('onError');
    }); 

    describe('launcherErrors', function(){

      it('calls the error handler if there are launcher errors', withRequire( 
          { 'launcher-errors': new MockErrors(['error one']) }, 
          function(){
            var editor = new (corespring.require('editor'))('blah', {}, onError);
            expect(onError).toHaveBeenCalledWith(errors.EXTERNAL_ERROR('error one'));
      }));


      it('calls error handler if options does not contain paths object', withRequire(
        { 'default-options' : { paths: {}}}, 
        function() {
          var editor = new (corespring.require('editor'))('blah', {}, onError);
          expect(onError).toHaveBeenCalledWith(errors.EXTERNAL_ERROR('create not part of options'));
      }));

    });

    describe('with no options', function(){

      it('should create item', withRequire({}, 
        function(){

          spyOn($, 'ajax');

          var opts = {
            onItemCreated: jasmine.createSpy('onItemCreated')
          };

          var editor = new (corespring.require('editor'))('blah', opts, onError);
          expect(onError).not.toHaveBeenCalled();
          var ajax = $.ajax.calls.mostRecent().args[0];
          expect(ajax.type).toEqual('create');
          expect(ajax.url).toEqual('http://base/create?a=a');
          expect(ajax.success).not.toBe(null);
          expect(ajax.error).not.toBe(null);
          expect(ajax.dataType).toEqual('json');

          ajax.success({id: '1'});
          expect(opts.onItemCreated).toHaveBeenCalledWith('1');
      }));

    });

    describe('with itemId', function(){
      it('should call create draft',  withRequire({}, function(){
        spyOn($, 'ajax');
        var opts =  {
          itemId: 'itemId',
          onDraftCreated: jasmine.createSpy('onDraftCreated')
        };

        var editor = new (corespring.require('editor'))('blah', opts, onError);
        var ajax = $.ajax.calls.mostRecent().args[0];
        expect(ajax.url).toEqual('http://base/createDraft?a=a');
        ajax.success({id: '2'});
        expect(opts.onDraftCreated).toHaveBeenCalledWith('2');
      }));
    });

    describe('with draftId', function(){

      var readyHandler = null;
      var instance = jasmine.createSpy('instance').and.callFake(function(){
        return {
          on: jasmine.createSpy('on').and.callFake(function(name, cb){
            if(name === 'ready'){
              readyHandler = cb;
            }
          }),
          send: jasmine.createSpy('send')
        };
      });

      it('should call load draft',  withRequire({
        instance: instance
      }, function(){
        spyOn($, 'ajax');
        console.log(corespring.mock.modules);
        var opts = {
          draftId: 'draftId',
          onDraftLoaded: jasmine.createSpy('onDraftLoaded')
        };
        var editor = new (corespring.require('editor'))('blah', opts, onError);
        expect(instance).toHaveBeenCalled();
        var constructorArgs = instance.calls.mostRecent().args[1];
        expect(constructorArgs.url).toEqual('http://base/editor/draftId');

        console.log('call readyHandler:', readyHandler);
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
});