describe('component data', function() {

  var scoringHandler;

  beforeEach(angular.mock.module('ui.bootstrap'));
  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editor.services'));

  var modalOpts = null, mockModal = null;

  function MockModalInstance(opts){
    this.result = {
      then: function(onClose,onCancel){
        this.onClose = onClose;
        this.onCancel = onCancel;
      }
    };
  }

  function MockModal(){

    var modalInstance;

    this.simulateOk = function(data){
      if(modalInstance){
        modalInstance.result.onClose(data);
      }
    };

    this.open = function(opts){
      modalOpts = opts;
      modalInstance = new MockModalInstance(opts);
      return modalInstance;
    };
  }

  beforeEach(module(function($provide) {
    mockModal = new MockModal();
    $provide.value('$modal', mockModal );
  }));

  beforeEach(inject(function(ScoringHandler) {
    scoringHandler = ScoringHandler;
  }));

  it('should init', function() {
    expect(scoringHandler).not.toBe(null);
  });

  it('should resolve components', function(){

    var comps = { 1: { componentType: 'a', weight: 1, data: {}}};
    var xhtml = '<h1>Helo</h1>';
    scoringHandler.scoring(comps, xhtml, function(){
    });

    var resolvedComps = modalOpts.resolve.components();
    expect(resolvedComps).toEqual({1: {componentType: 'a', weight: 1}});
  });

  function assertSaveCalled(isCalled, changeWeight){
    var comps = { 1: { componentType: 'a', weight: 1, data: {}}};
    var xhtml = '<h1>Helo</h1>';
    var saveCalled = false;
    scoringHandler.scoring(comps, xhtml, function(){
      saveCalled = true;
    });

    var update = changeWeight ? { 1: {componentType: 'a', weight: 1.5}} : comps;
    mockModal.simulateOk(update);
    expect(saveCalled).toBe(isCalled);
  }

  it('should not trigger a save if the weights change', function(){
    assertSaveCalled(false, false);
  });

  it('should trigger a save if the weights change', function(){
    assertSaveCalled(true, true);
  });

});
