describe('item-editor', function(){

  var mockLauncher, mockInstance;
  var errorCodes = corespring.require('error-codes');
  var onError, editor, Editor;

  beforeEach(function() {
    $.ajax = jasmine.createSpy('$.ajax');
    mockInstance = new org.corespring.mocks.launcher.MockInstance();
    var MockLauncher = org.corespring.mocks.launcher.MockLauncher(mockInstance);
    mockLauncher = new MockLauncher();

    corespring.mock.modules['client-launcher'] = function() {
      return mockLauncher;
    };
    onError = jasmine.createSpy('onError');
    Editor = new corespring.require('item-editor');
  });

  afterEach(function() {
    corespring.mock.reset();
    $.ajax.calls.reset();
  });

  describe('constructor', function(){

    it('calls launcher.init', function(){
      var editor = new Editor('element', {}, onError);
      expect(mockLauncher.init).toHaveBeenCalled();
    });

    describe('createItem', function(){
      it('calls createItem if itemId is not set', function(){
        var editor = new Editor('element', {}, onError);
        expect($.ajax).toHaveBeenCalledWith({
          type: 'GET',
          url: 'itemEditor.createItem',
          data: {},
          success: jasmine.any(Function),
          error: jasmine.any(Function),
          dataType: 'json'
        });
      });

      it('calls options.onItemCreated when item is created', function(){

        var onItemCreated = jasmine.createSpy('onItemCreated');

        $.ajax.and.callFake(function(opts){
          opts.success({itemId: 'new-itemId'});
        });

        var editor = new Editor('element', { onItemCreated: onItemCreated }, onError);
        expect(onItemCreated).toHaveBeenCalledWith('new-itemId');
      });

      it('calls errorCallback when item creation fails', function(){

        $.ajax.and.callFake(function(opts){
          opts.error({responseJSON: {error: 'err'}});
        });

        var editor = new Editor('element', {}, onError);
        expect(onError).toHaveBeenCalledWith(errorCodes.CREATE_ITEM_FAILED('err'));
      });
    });
  });

  describe('loadItem', function(){

    it('calls launcher.loadInstance', function(){
      var editor = new Editor('element', {itemId: 'itemId'}, onError);
      expect(mockLauncher.loadInstance)
      .toHaveBeenCalledWith({method: 'GET', url: 'itemEditor.editor'}, undefined, {}, jasmine.any(Function), undefined);
    });

    it('calls launcher.loadInstance with hash set to profile', function(){
      var editor = new Editor('element', {selectedTab: 'profile', itemId: 'itemId'}, onError);
      expect(mockLauncher.loadInstance)
        .toHaveBeenCalledWith({method: 'GET', url: 'itemEditor.editor', hash: '/profile'},
        undefined, jasmine.any(Object), jasmine.any(Function), undefined);
    });

    it('calls launcher.loadInstance with hash set to supporting-materials', function(){
      var editor = new Editor('element', {selectedTab: 'supporting-materials', itemId: 'itemId'}, onError);
      expect(mockLauncher.loadInstance)
        .toHaveBeenCalledWith(
          {method: 'GET', url: 'itemEditor.editor', hash: '/supporting-materials/0'},
           undefined, jasmine.any(Object), jasmine.any(Function), undefined);
    });

    it('calls launcher.loadInstance with showSaveMessage ', function(){
      var editor = new Editor('element', { showSaveMessage: true, itemId: 'itemId'}, onError);
      expect(mockLauncher.loadInstance)
        .toHaveBeenCalledWith(
          {method: 'GET', url: 'itemEditor.editor'},
           undefined, {showSaveMessage: true}, jasmine.any(Function), undefined);
    });

    it('calls options.onItemLoaded in the onReady callback', function(){

      mockLauncher.loadInstance.and.callFake(function(call, qp, init, cb){
        cb(mockInstance);
      });

      var onItemLoaded = jasmine.createSpy('onItemLoaded');
      var editor = new Editor('element', {onItemLoaded: onItemLoaded, itemId: 'itemId'}, onError);
      expect(onItemLoaded).toHaveBeenCalledWith('itemId');
    });

    it('calls instance.css when devEditor is true in the onReady callback', function(){

      mockLauncher.loadInstance.and.callFake(function(call, qp, init, cb){
        cb(mockInstance);
      });

      var editor = new Editor('element', {devEditor: true, itemId: 'itemId'}, onError);
      expect(mockInstance.css).toHaveBeenCalledWith('height', '100%');
    });
  });
});
