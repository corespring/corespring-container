describe('mathjax-holder', function(){

  var holder, formatUtils, EVENTS;

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editing.wiggi-wiz-features.mathjax'));

   var MathJaxService = {
    parseDomForMath: jasmine
      .createSpy('parseDomForMath')
      .and.callFake(function(){
        return null;
      })
  };

  beforeEach(angular.mock.module('wiggi-wiz.constants'));
  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editing.wiggi-wiz-features.mathjax'));
  
  beforeEach(module(function($provide) {
    $provide.value('MathJaxService', MathJaxService);
  }));

  beforeEach(inject(function($rootScope, $compile, MathFormatUtils, WIGGI_EVENTS) {
    formatUtils = MathFormatUtils;
    EVENTS = WIGGI_EVENTS;
    spyOn(formatUtils, 'getMathInfo').and.callThrough();
    parentScope = $rootScope.$new();
    parentScope.onDelete = jasmine.createSpy('onDelete');
    parentScope.onCallFeature = jasmine.createSpy('onCallFeature');
    element = angular.element('<div mathjax-holder>1 == 3</div>');
    $compile(element)(parentScope);
    scope = element.scope();
    scope.$apply();
  }));

  function MockEvent(){
    this.stopPropagation = function(){};
  }

  describe('compile', function(){

    it('should have originalMarkup', function(){
      expect(scope.originalMarkup).toEqual('1 == 3');
    });
    
  });

  describe('deleteNode', function(){
    it('should emit delete node event', function(){
      parentScope.$on(EVENTS.DELETE_NODE, parentScope.onDelete);
      var event = new MockEvent();
      scope.deleteNode(event);
      expect(parentScope.onDelete).toHaveBeenCalled();
      var elementInEvent = parentScope.onDelete.calls.mostRecent().args[1];
      expect(elementInEvent[0]).toBe(element[0]);
    });
  });

  describe('editNode', function(){

    function assertCall(assertion){
      return function(){
        parentScope.$on(EVENTS.CALL_FEATURE_METHOD, parentScope.onCallFeature);
        var event = new MockEvent();
        scope.editNode(event);
        expect(parentScope.onCallFeature).toHaveBeenCalled();
        assertion(parentScope.onCallFeature.calls.mostRecent());
      };
    }

    it('should emit call feature method event with methodName', assertCall(function(mostRecent){
      var methodName = mostRecent.args[1];
      expect(methodName).toEqual('editNode');
    }));
    
    it('should emit call feature method event with element', assertCall(function(mostRecent){
      var elementInEvent = mostRecent.args[2];
      expect(elementInEvent[0]).toBe(element[0]);
    }));
  });

  describe('updateDisplayMode', function(){
    it('should set class to block for MathML', function(){
      scope.originalMarkup = '<math></math>';
      expect(element.hasClass('block')).toBe(true);
    });

    it('should set class to inlne for LaTex', function(){
      scope.originalMarkup = '\\(1 == 4\\)';
      scope.$digest();
      expect(element.hasClass('inline')).toBe(true);
    });

    it('should set class to block for LaTex', function(){
      scope.originalMarkup = '\\[1 == 4\\]';
      scope.$digest();
      expect(element.hasClass('block')).toBe(true);
    });

  });

});