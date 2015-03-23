describe('editor launcher', function () {

  var origRequire = corespring.require;

  function MockErrors(errs) {
    this.errors = errs;
    this.hasErrors = function () {
      return this.errors && this.errors.length > 0;
    };
  }

  function p(name){
    return {method: name, url: name};
  }


  function MockInstance(){
    this.callbacks = {};
    this.on = function(name, cb){
      this.callbacks[name] = cb;
    };
  }

  function withRequire(obj, fn){
    
    var env = {
      'query-params' : {
        a: 'a'
      },
      'default-options': {
        corespringUrl: 'http://base/',
        paths: {
          create: p('create'),
          createDraft: p('createDraft'),
          editor: p('editor/:draftId')
        }
      },
      'instance' : MockInstance, 
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
            expect(onError).toHaveBeenCalledWith(errors.EXTERNAL_ERROR("error one"));
      }));


      it('calls error handler if options does not contain paths object', withRequire(
        { 'default-options' : { paths: {}}}, 
        function() {
          var editor = new (corespring.require('editor'))('blah', {}, onError);
          expect(onError).toHaveBeenCalledWith(errors.EXTERNAL_ERROR("create not part of options"));
      }));

    });

    describe("with no options", function(){

      it('should create item', withRequire({}, 
        function(){
          spyOn($, 'ajax');
          var editor = new (corespring.require('editor'))('blah', {}, onError);
          expect(onError).not.toHaveBeenCalled();
          var opts = $.ajax.calls.mostRecent().args[0];
          expect(opts.type).toEqual('create');
          expect(opts.url).toEqual('http://base/create?a=a');
          expect(opts.success).not.toBe(null);
          expect(opts.error).not.toBe(null);
          expect(opts.dataType).toEqual('json');
      }));

    });

    describe("with itemId", function(){
      it('should call create draft',  withRequire({}, function(){
        spyOn($, 'ajax');
        var editor = new (corespring.require('editor'))('blah', {itemId: 'itemId'}, onError);
        expect($.ajax.calls.mostRecent().args[0].url).toEqual('http://base/createDraft?a=a');
      }));
    });

    describe("with draftId", function(){

      var instance = jasmine.createSpy('instance').and.callFake(function(){
        return {
          on: jasmine.createSpy('on'),
          send: jasmine.createSpy('send')
        };
      });

      it('should call load draft',  withRequire({
        instance: instance
      }, function(){
        spyOn($, 'ajax');
        console.log(corespring.mock.modules);
        var editor = new (corespring.require('editor'))('blah', {draftId: 'draftId'}, onError);
        expect(instance).toHaveBeenCalled();
        var opts = instance.calls.mostRecent().args[1];
        expect(opts.url).toEqual('http://base/editor/draftId');
      }));
    });
  });

});