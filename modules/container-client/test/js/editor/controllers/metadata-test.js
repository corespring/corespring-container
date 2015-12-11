describe('MetadataController', function() {

  var scope, element, rootScope, compile, timeout;
  var itemId = 1;

  var ItemService = {
    saveProfile: jasmine.createSpy('saveProfile')
  };

  var mockListener;

  var $window = {
    top: {
      addEventListener: function() {},
      postMessage: function() {}
    }
  };

  var MetadataService = {
    get: function() {
    }
  };

  var LogFactory = {
    getLogger: jasmine.createSpy('getLogger').and.returnValue({
      debug: function() {
      }
    })
  };

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$window', $window);
    $provide.value('ItemService', ItemService);
    $provide.value('MetadataService', MetadataService);
    $provide.value('LogFactory', LogFactory);
    $provide.value('EditorChangeWatcher', new org.corespring.mocks.editor.EditorChangeWatcher());
  }));

  afterEach(function() {
    _.each([ItemService, LogFactory], function(mock) {
      _.keys(mock, function(key) {
        if (_.isFunction(mock[key])) {
          mock[key].calls.reset();
        }
      });
    });
  });

  function render() {
    scope = rootScope.$new();
    scope.item = {itemId: itemId};
    element = compile('<div ng-controller="MetadataController"></div>')(scope);
    scope = element.scope();
  }

  beforeEach(inject(function($rootScope, $compile, $timeout) {
    spyOn(MetadataService, 'get').and.returnValue({
      then: function() {
      }
    });
    spyOn($window.top, 'addEventListener').and.callFake(function(msg, fn) {
      mockListener = fn;
    });
    spyOn($window.top, 'postMessage');
    rootScope = $rootScope;
    compile = $compile;
    timeout = $timeout;
    render();
  }));

  describe('initialization', function() {
    it('should request metadata for item', function() {
      expect(MetadataService.get).toHaveBeenCalledWith(itemId);
    });
  });

  describe('messaging', function() {
    it('adds listener', function() {
      expect($window.top.addEventListener).toHaveBeenCalled();
    });
    it('requests metadata on requestMetadata', function() {
      scope.selectedMetadata = {metadataKey: 'k'};
      scope.item.profile = {taskInfo: {extended: {k: {}}}};
      mockListener({data: {type: 'requestMetadata'}});
      expect($window.top.postMessage).toHaveBeenCalled();
    });
    it('updates metadata on updateMetadata', function() {
      scope.selectedMetadata = {metadataKey: 'k'};
      scope.item.profile = {taskInfo: {extended: {k: {}}}};
      mockListener({data: {type: 'updateMetadata', message: {apple: 'pear'}}});
      expect(scope.item.profile.taskInfo.extended.k.apple).toEqual('pear');
    });
  });

  describe('$watch extended metadata', function() {
    beforeEach(function() {
      scope.item.profile = {taskInfo: {extended: {apple: 'pear'}}};
      scope.$digest();
      ItemService.saveProfile.calls.reset();
    });
    it('profile is saved when metadata changes', function() {
      scope.item.profile.taskInfo.extended.apple = 'peach';
      scope.$digest();
      expect(ItemService.saveProfile).toHaveBeenCalled();
    });
    it('profile is not saved when metadata doesn\'t change', function() {
      scope.item.profile.taskInfo.extended.apple = 'pear';
      scope.$digest();
      expect(ItemService.saveProfile).not.toHaveBeenCalled();
    });
  });

});
