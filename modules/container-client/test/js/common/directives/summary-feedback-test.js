describe('summaryFeedback', function() {

  var compile, scope, element,
    completeSession, incompleteSession, itemWithFeedback, itemWithEmptyFeedback, itemWithoutFeedback;

  beforeEach(angular.mock.module('corespring-common.directives'));

  beforeEach(function() {
    completeSession = { isComplete: true };
    incompleteSession = { isComplete: false };
    itemWithEmptyFeedback = { summaryFeedback: '' };
    itemWithoutFeedback = {};
    itemWithFeedback = { summaryFeedback: "Oh hey, I'm feedback!" };
  });

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    compile = function(item, session) {
      item = item || itemWithFeedback;
      session = session || completeSession;
      scope.item = item;
      scope.session = session;
      element = angular.element('<summary-feedback item="item" session="session"></summary-feedback>');
      $compile(element)(scope);
      scope = element.isolateScope();
      scope.$apply();
    }
  }));

  it('should be hidden when summary feedback is missing, session is complete', function() {
    compile(itemWithoutFeedback, completeSession);
    expect(element.hasClass('ng-hide')).toBe(true);
  });

  it('should be hidden when summary feedback is empty string, session is complete', function() {
    compile(itemWithEmptyFeedback, completeSession);
    expect(element.hasClass('ng-hide')).toBe(true);
  });

  it('should be hidden when summary feedback is non-empty, session is incomplete', function() {
    compile(itemWithFeedback, incompleteSession);
    expect(element.hasClass('ng-hide')).toBe(true);
  });

  it('should be shown when summary feedback is non-empty, session is complete', function() {
    compile(itemWithFeedback, completeSession);
    expect(element.hasClass('ng-hide')).toBe(false);
  });

  it('should initialize with feedback panel closed', function() {
    compile();
    expect($('.panel-body', element).hasClass('ng-hide')).toBe(true);
  });

  it('should show feedback panel when panel heading is clicked', function() {
    compile();
    $('.panel-heading', element).click();
    expect($('.panel-body', element).hasClass('ng-hide')).toBe(false);
  });

});