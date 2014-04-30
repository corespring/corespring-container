describe('componentWeights', function() {

  beforeEach(angular.mock.module('corespring-editor.directives'));

  var rootScope, compile, timeout;

  beforeEach(inject(function($compile, $rootScope, $timeout) {
    rootScope = $rootScope.$new();
    compile = $compile;
    timeout = $timeout;
  }));

  it('should init', function() {
    var elem = compile("<component-weights/>")(rootScope);
    expect(elem).toNotBe(null);
  });

});