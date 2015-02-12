describe('NavController', function() {

  var scope, element;

  var ItemService = {
    load: jasmine.createSpy('load'),
    addSaveListener: jasmine.createSpy('addSaveListener')
  };

  var LogFactory = {
    getLogger: jasmine.createSpy('getLogger')
  };

  var modalCallbacks = jasmine.createSpy('then');
  var $modal = {
    open: jasmine.createSpy('open').and.returnValue({
      result: {
        then: modalCallbacks
      }
    })
  };

  var ConfigurationService = {
    getConfig: function() {}
  };

  afterEach(function() {
    ItemService.load.calls.reset();
    ItemService.addSaveListener.calls.reset();
    LogFactory.getLogger.calls.reset();
    $modal.open.calls.reset();
    modalCallbacks.calls.reset();
  });

  beforeEach(angular.mock.module('corespring-editor.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('ItemService', ItemService);
    $provide.value('LogFactory', LogFactory);
    $provide.value('$modal', $modal);
    $provide.value('ConfigurationService', ConfigurationService);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="NavController"></div>')(scope);
    scope = element.scope();
  }));

  describe('initialization', function() {

    function expectPopupFor(name, options) {
      function dash(name) {
        return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
      }
      expect($modal.open).toHaveBeenCalledWith({
        templateUrl: '/templates/popups/' + dash(name),
        controller: name.charAt(0).toUpperCase() + name.slice(1) + "PopupController",
        size: (options && options.size !== undefined) ? options.size : 'sm',
        backdrop: (options && options.backdrop !== undefined) ? options.backdrop : 'static',
        resolve: (options && options.resolve !== undefined) ? options.resolve : undefined
      });
    }

    it('should call ItemService.load', function() {
      expect(ItemService.load).toHaveBeenCalled();
    });

    it('should set saveStatus to null', function() {
      expect(scope.saveStatus).toBeNull();
    });

    it('should call addSaveListener', function() {
      expect(ItemService.addSaveListener).toHaveBeenCalledWith('nav', scope);
    });

    _.each(['open', 'copy', 'new', 'archive', 'delete'], function(word) {
      describe(word, function() {
        beforeEach(function() {
          scope[word]();
        });

        it('should be a function that calls $modal with "' + word + '" arguments', function() {
          expectPopupFor(word);
        });
      });
    });

    describe('editTitle', function() {
      beforeEach(function() {
        scope.editTitle();
      });

      it('should be a function that calls $modal with editTitle arguments', function() {
        expectPopupFor('editTitle', {resolve: {title: jasmine.any(Function)}});
      });
    });

    describe('questionInformation', function() {
      beforeEach(function() {
        scope.questionInformation();
      });

      it('should be a function that calls $modal with questionInformation arguments', function() {
        expectPopupFor('questionInformation', {size: 'lg', resolve: { item: jasmine.any(Function) }});
      });
    });

    describe('help', function() {
      beforeEach(function() {
        scope.help();
      });

      it('should be a function that calls $modal with help arguments', function() {
        expectPopupFor('help', {size: 'lg', backdrop: false});
      });
    });

    describe('handleSaveMessage', function() {
      var oldStatus = "this is old";
      var newStatus = "this is new";

      beforeEach(function() {
        scope.saveStatus = oldStatus;
        scope.handleSaveMessage(newStatus);
      });

      it('should set saveStatus', function() {
        expect(scope.saveStatus).toEqual(newStatus);
      });
    });

  });
});