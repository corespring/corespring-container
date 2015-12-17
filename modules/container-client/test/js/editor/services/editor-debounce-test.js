describe('editor-debounce', function(){

  var debounce;

  var mockDebounce = jasmine.createSpy('debounce').and.callFake(function(delay, fn){
    var out = function(){
      fn.apply(null, Array.prototype.slice.call(arguments));
    };

    out.flushPending = jasmine.createSpy('flushPending');
    return out;
  });

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(module(function($provide){
    $provide.value('LogFactory', new org.corespring.mocks.editor.LogFactory() );
    $provide.value('debounce', mockDebounce);
    $provide.value('DEBOUNCE_IN_MILLIS', null);
  }));

  beforeEach(inject(function(editorDebounce){
    debounce = editorDebounce;
  }));

  var fn, debounced;
  beforeEach(function(){
    fn = jasmine.createSpy('fn');
  });

  describe('debounce', function(){

    beforeEach(function(){
      debounced = debounce(fn);
      debounced('hi');
      debounce.flush();
    });

    it('calls the underlying debounce function', function(){
      expect(mockDebounce).toHaveBeenCalledWith(5000, fn);
    });

    it('calls the debounced function with the function parameters', function(){
      expect(fn).toHaveBeenCalledWith('hi');
    });
    
    it('does not call flushPending', function(){
      expect(debounced.flushPending).not.toHaveBeenCalled();
    });
  });

  describe('flush', function(){
    
    beforeEach(function(){
      debounced = debounce(fn, null, true);
      debounce.flush();
    });

    it('calls flushPending on the debouncedFn', function(){
      expect(debounced.flushPending).toHaveBeenCalled();
    });
  });
});