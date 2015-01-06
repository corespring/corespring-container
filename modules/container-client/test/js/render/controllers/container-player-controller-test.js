describe('ContainerPlayerController', function() {

  var scope, controller;

  beforeEach(angular.mock.module('corespring-player.controllers'));
  beforeEach(function() {
    function MockLocation() {
      this.searchResult = {};
      this.search = function () {
        return this.searchResult;
      };

      this.hashResult = {};
      this.hash = function () {
        return this.hashResult;
      };
    }

    module(function($provide) {
      $provide.value('$log', function() {});
      $provide.value('$location', new MockLocation());
    })
  });
  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    controller = $controller('ContainerPlayerController', {
      '$scope': scope
    });
  }));

  it('should initialize', function() {
    expect(controller).toBeDefined();
  });


  describe('displaySummaryFeedback', function() {

    var completeSession, incompleteSession, itemWithFeedback, itemWithEmptyFeedback, itemWithoutFeedback;

    beforeEach(function() {
      completeSession = { isComplete: true };
      incompleteSession = { isComplete: false };
      itemWithEmptyFeedback = { summaryFeedback: '' };
      itemWithoutFeedback = {};
      itemWithFeedback = { summaryFeedback: "Oh hey, I'm feedback!" };
    });

    it('should return false when summary feedback is empty string, session is complete', function() {
      scope.session = completeSession;
      scope.item = itemWithoutFeedback;
      expect(scope.displaySummaryFeedback()).toBe(false);
    });


    it('should return false when summary feedback is empty string, session is complete', function() {
      scope.session = completeSession;
      scope.item = itemWithoutFeedback;
      expect(scope.displaySummaryFeedback()).toBe(false);
    });

    it('should return true when summary feedback is undefined, session is complete', function() {
      scope.session = completeSession;
      scope.item = itemWithoutFeedback;
      expect(scope.displaySummaryFeedback()).toBe(false);
    });

    it('should return false when session is incomplete', function() {
      scope.session = incompleteSession;

      scope.item = itemWithFeedback;
      expect(scope.displaySummaryFeedback()).toBe(false);

      scope.item = itemWithoutFeedback;
      expect(scope.displaySummaryFeedback()).toBe(false);

      scope.item = itemWithEmptyFeedback;
      expect(scope.displaySummaryFeedback()).toBe(false);
    });

  });

});