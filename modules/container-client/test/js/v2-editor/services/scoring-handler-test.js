describe('component data', function() {

  var scoringHandler;

  beforeEach(angular.mock.module('ui.bootstrap'));
  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editor.services'));

  function MockModal(){
    this.open = function(){
      throw new Error('!!');
    };
  }

  beforeEach(module(function($provide) {
    $provide.value('$modal', new MockModal() );
  }));

  beforeEach(inject(function(ScoringHandler) {
    scoringHandler = ScoringHandler;
  }));

  it('should init', function() {
    expect(scoringHandler).toNotBe(null);
  });

});