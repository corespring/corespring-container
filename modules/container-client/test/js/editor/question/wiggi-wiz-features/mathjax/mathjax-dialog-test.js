describe('mathjax-dialog', function(){

  var render, parentScope, scope, element, formatUtils;

  var math = [
    '<math>',
    '  <msup>',
    '    <msqrt>',
    '      <mrow>',
    '        <mi>a</mi>',
    '      </mrow>',
    '    </msqrt>',
    '    <mn>27</mn>',
    '  </msup>',
    '</math>'
  ].join('\n');

  var MathJaxService = {
    parseDomForMath: jasmine
      .createSpy('parseDomForMath')
      .and.callFake(function(){
        return null;
      })
  };

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring-editing.wiggi-wiz-features.mathjax'));
  
  beforeEach(module(function($provide) {
    $provide.value('MathJaxService', MathJaxService);
  }));

  beforeEach(inject(function($rootScope, $compile, MathFormatUtils) {

    spyOn(_, 'debounce').and.callFake(function(fn){
      return fn;
    });

    formatUtils = MathFormatUtils;
    spyOn(formatUtils, 'getMathInfo').and.callThrough();
    parentScope = $rootScope.$new();
    element = angular.element('<mathjax-dialog ng-model="math"></mathjax-dialog>');
    $compile(element)(parentScope);
    scope = element.scope();
    scope.$apply();

  }));

  it('compiles', function() {
    expect(element.hasClass('mathjax-dialog-root')).toBe(true);
    expect(formatUtils.getMathInfo).toHaveBeenCalledWith('');
  });

  function assertMathJaxServiceCalled(html){
    expect(MathJaxService.parseDomForMath).toHaveBeenCalled();
    var args = MathJaxService.parseDomForMath.calls.mostRecent().args;
    expect(args[1].innerHTML).toEqual(html);
  }

  describe('user update', function(){
    
    it('updates with LaTex - inline', function() {
      scope.preppedMath = '1 == 3';
      scope.displayType = 'inline';
      scope.$digest();
      expect(scope.mathType).toEqual('LaTex');
      expect(scope.displayType).toEqual('inline');
      assertMathJaxServiceCalled('\\(1 == 3\\)');
    });

    it('updates with LaTex - block', function() {
      scope.preppedMath = '1 == 3';
      scope.displayType = 'block';
      scope.$digest();
      expect(scope.mathType).toEqual('LaTex');
      expect(scope.displayType).toEqual('block');
      assertMathJaxServiceCalled('\\[1 == 3\\]');
    });

    it('updates with MathML', function(){
      scope.preppedMath = math;
      scope.$digest();
      expect(scope.mathType).toEqual('MathML');
      expect(scope.displayType).toEqual('block');
      assertMathJaxServiceCalled(math);
    });

  });

});