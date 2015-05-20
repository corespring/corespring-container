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

    it('calls createItem if itemId is not set', function(){
      var editor = new Editor('element', {}, onError);
      expect($.ajax).toHaveBeenCalledWith({
        type: 'GET',
        url: 'createItem',
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
