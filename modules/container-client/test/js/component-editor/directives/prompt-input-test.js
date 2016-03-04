describe('prompt-input', function(){

  var parentScope, scope, wiggiMathJaxFeatureDef;

  beforeEach(angular.mock.module('corespring-singleComponentEditor.directives'));

  beforeEach(module(function($provide) {
    wiggiMathJaxFeatureDef = jasmine.createSpy('WiggiMathJaxFeatureDef').and.returnValue({
      name: 'mock-feature-def'
    });

    $provide.value('WiggiMathJaxFeatureDef', wiggiMathJaxFeatureDef);
    $provide.factory('miniWiggiWizDirective', function(){ return {}; });
  }));

  beforeEach(inject(function($rootScope, $compile) {
    parentScope = $rootScope.$new();
    parentScope.prompt = 'this is a prompt';
    element = $compile('<div prompt-input="" prompt="prompt"></div>')(parentScope);
    scope = element.isolateScope();
    $rootScope.$digest();
  }));

  describe('init', function(){


    it('adds extraFeatures to scope', function(){
      expect(scope.extraFeatures).toEqual({ definitions: [{name: 'mock-feature-def'}]});
    });
  });
});