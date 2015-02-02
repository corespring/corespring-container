describe('mathjax-dialog', function(){

  var render, parentScope, scope, element;

  var MathFormatUtils = {
    getMathInfo: jasmine.createSpy('getMathInfo').and.returnValue('LaTex'),
    wrapLatex:  jasmine.createSpy('wrapLatex')
      .and.callFake(function(text, displayType){
        return text;
    })
  };

  var MathJaxService = {
    parseDomForMath: jasmine
      .createSpy('parseDomForMath')
      .and.callFake(function(){
        return null;
      })
  };

  beforeEach(angular.mock.module('corespring-templates'));
  beforeEach(angular.mock.module('corespring.wiggi-wiz-features.mathjax'));
  
  beforeEach(module(function($provide) {
    $provide.value('MathFormatUtils', MathFormatUtils);
    $provide.value('MathJaxService', MathJaxService);
  }));

  beforeEach(inject(function($rootScope, $compile) {
    parentScope = $rootScope.$new();
    element = angular.element('<mathjax-dialog ng-model="math"></mathjax-dialog>');
    $compile(element)(parentScope);
    scope = element.scope();
    scope.$apply();
  }));

  it('compiles', function() {
    expect(element.hasClass('mathjax-dialog-root')).toBe(true);
    expect(MathFormatUtils.getMathInfo).toHaveBeenCalledWith('');
  });

  it('calls MathJaxService on change', function(done) {
    parentScope.math = '1 == 3';
    parentScope.$digest();
    setTimeout(function(){
      expect(MathJaxService.parseDomForMath).toHaveBeenCalled();
      var args = MathJaxService.parseDomForMath.calls.mostRecent().args;
      expect(args[1].html()).toEqual('1 == 3');
      done();
    }, 300);
  });

});