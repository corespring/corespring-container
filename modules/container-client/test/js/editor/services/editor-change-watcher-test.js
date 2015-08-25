describe('editor-change-watcher', function(){

  var watcher;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(module(function($provide){
    $provide.value('LogFactory', { getLogger: function(){ return { debug: jasmine.createSpy()};}});
    $provide.value('debounce', org.corespring.mocks.editor.debounce);
  }));

  beforeEach(inject(function(EditorChangeWatcher){
    watcher = EditorChangeWatcher;
  }));

  describe('init', function(){
    it('has the makeWatcher function', function(){
      expect(watcher.makeWatcher).not.toBe(null);
    });
  });

  describe('makeWatcher', function(){

    var saveFn;
    var scope;
    var watcherFn;
    beforeEach(function(){
      saveFn = jasmine.createSpy('saveFn');
      scope = {
        $emit: jasmine.createSpy('$emit')
      };
     watcherFn = watcher.makeWatcher('name', saveFn, scope);
    });

    it('does nothing if the data is the same', function(){
      watcherFn('a', 'a');
      expect(saveFn).not.toHaveBeenCalled();
    });

    it('does nothing if the previous value was undefined (initialization)', function() {
      watcherFn('a', undefined);
      expect(saveFn).not.toHaveBeenCalled();
    });
    
    it('calls $emit', function(){
      watcherFn('a', 'b');
      expect(scope.$emit).toHaveBeenCalledWith('itemChanged', {partChanged: 'name'});
    });
    
    it('calls saveFn', function(){
      watcherFn('a', 'b');
      expect(saveFn).toHaveBeenCalledWith('a', 'b');
    });

  });

  describe('makeWatcher - errors', function(){

    it('throws an error if there is no partname', function(){
      expect(function(){
        watcher.makeWatcher();
      }).toThrow(new Error('no partName defined'));
    });
    
    it('throws an error if there is no saveFn', function(){
      expect(function(){
        watcher.makeWatcher('name');
      }).toThrow(new Error('no saveFn defined'));
    });
    
    it('throws an error if there is no scope', function(){
      expect(function(){
        watcher.makeWatcher('name', function(){});
      }).toThrow(new Error('no scope defined'));
    });
  });
  
});