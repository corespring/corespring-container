describe('catalog launcher', function () {

  var errorCodes = corespring.require('error-codes');
  var CatalogDefinition;
  var errorCallback;
  var mockInstance;

  function MockLauncher(){

    this.init = jasmine.createSpy('init').and.returnValue(true);

    this.loadInstance = jasmine.createSpy('loadInstance').and.returnValue(mockInstance);
    
    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(){
      return {method: 'GET', url: 'catalog/:itemId'};
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function(){
        return mockInstance;
    });
  }

  beforeEach(function () {
    mockInstance = {remove: jasmine.createSpy('remove')};
    mockLauncher = new MockLauncher();
    corespring.mock.modules['client-launcher'] = function(){
      return mockLauncher;
    };
    CatalogDefinition = corespring.require('catalog');
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
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.NO_ITEM_ID);
    });

    it('should not invoke an error if there is itemId', function () {
      create({itemId: '1'});
      expect(errorCallback).not.toHaveBeenCalledWith(errorCodes.NO_ITEM_ID);
    });

    it('should call loadCall(\'catalog\') if there is itemId', function () {
      create({itemId: '1'});
      expect(mockLauncher.loadCall).toHaveBeenCalledWith('catalog', jasmine.any(Function));
    });

    it('should call mkInstance if there is itemId', function () {
      create({itemId: '1'});
      expect(mockLauncher.loadInstance).toHaveBeenCalledWith({method: 'GET', url: 'catalog/:itemId'},{});
    });
  });

  describe('remove', function(){
    it('should call instance.remove', function(){
      var catalog = create({itemId: '1'});
      expect(mockInstance.remove).not.toHaveBeenCalled();
      catalog.remove();
      expect(mockInstance.remove).toHaveBeenCalled();
    });
  });

});
