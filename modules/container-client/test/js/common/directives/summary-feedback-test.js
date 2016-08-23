describe('summaryFeedback', function() {

  var compile, scope, element;

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-common.directives'));

  beforeEach(module(function($provide) {
    $provide.value('MathJaxService', {
      parseDomForMath: function() {
      }
    });
  }));

  beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();
    compile = function(opts) {
      scope.feedback = opts.feedback;
      scope.sessionComplete = opts.sessionComplete;
      element = angular.element('<div summary-feedback="" ng-model="feedback" session-complete="sessionComplete"></div>');
      $compile(element)(scope);
      element.scope().$apply();
      scope = element.isolateScope();
    };
  }));

  it('should be hidden when summary feedback is missing, session is complete', function() {
    compile({ feedback: undefined, sessionComplete: true });
    expect(element.hasClass('ng-hide')).toBe(true);
  });

  it('should be hidden when summary feedback is empty string, session is complete', function() {
    compile({ feedback: '', sessionComplete: true });
    expect(element.hasClass('ng-hide')).toBe(true);
  });

  it('should be hidden when summary feedback is non-empty, session is incomplete', function() {
    compile({ feedback: "I've got feedback!", sessionComplete: false });
    expect(element.hasClass('ng-hide')).toBe(true);
  });

  it('should be shown when summary feedback is non-empty, session is complete', function() {
    compile({ feedback: "I've got feedback!", sessionComplete: true });
    expect(element.hasClass('ng-hide')).toBe(false);
  });

  it('should initialize with feedback panel closed', function() {
    compile({ feedback: "I've got feedback!" });
    expect($('.panel-body', element).length).toBe(0);
  });

  it('should show feedback panel when panel heading is clicked', function() {
    compile({ feedback: "I've got feedback!" });
    $('.panel-heading', element).click();
    expect($('.panel-body', element).hasClass('ng-hide')).toBe(false);
  });

});
