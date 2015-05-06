describe('new catalog launcher', function () {

  var errors = corespring.require('errors');
  var CatalogDefinition;
  var errorCallback;
  var mockInstance;

  function MockLauncher(){

    this.mockInit = function(){
      this.loadClient();
    };
    this.init = jasmine.createSpy('init').and.callFake(this.mockInit);

    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(){
      return {method: 'GET', url: 'catalog/:itemId'};
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function(){
        return mockInstance;
    });
  }

  beforeEach(function () {
    mockInstance = {};
    mockLauncher = new MockLauncher();
    corespring.mock.modules['client-launcher'] = function(){
      return mockLauncher;
    };
    CatalogDefinition = corespring.require('new-catalog');
  });

  afterEach(function () {
    corespring.mock.reset();
  });

  function create(options) {
    errorCallback = jasmine.createSpy('errorCallback');
    var catalog = new CatalogDefinition('dummy-element', options, errorCallback);
    return catalog;
  }

  describe('loadClient -> loadItem', function(){
    it('should invoke error callback with NO_ITEM_ID if there is no itemId', function () {
      create({});
      expect(errorCallback).toHaveBeenCalledWith(errors.NO_ITEM_ID);
    });

    it('should not invoke an error if there is itemId', function () {
      create({itemId: '1'});
      expect(errorCallback).not.toHaveBeenCalledWith(errors.NO_ITEM_ID);
    });

    it('should call loadCall(\'catalog\') if there is itemId', function () {
      create({itemId: '1'});
      expect(mockLauncher.loadCall).toHaveBeenCalledWith('catalog');
    });

    it('should call mkInstance if there is itemId', function () {
      create({itemId: '1'});
      expect(mockLauncher.mkInstance).toHaveBeenCalledWith('catalog/1', null);
    });
  });

});
