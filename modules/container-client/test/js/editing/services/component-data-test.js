describe('component data', function() {

  var componentData, register;

  window.MathJax = {
    Hub: {
      signal: {
        Interest: function() {
        }
      },
      Config: function() {}
    }
  };

  var MockBridge = function(){

    var isEditable;

    this.setDataAndSession = function(s){
      this.dataAndSession = s;
    };

    this.setResponse = function(r){
    };

    this.getSession = function(){
      return this.dataAndSession;
    };

    this.isAnswerEmpty = function(){
      return false;
    };

    this.editable = function(e){
    };

    this.setMode = function(mode){
    };

    this.reset = function(){
    };

    this.answerChangedHandler = function(){
    };
  };

  beforeEach(angular.mock.module('corespring-player.services'));
  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editing.services'));

  beforeEach(module(function($provide){
    $provide.value('$timeout', function(fn){
      fn();
    });
  }));

  beforeEach(inject(function(ComponentData, ComponentRegister) {
    componentData = ComponentData;
    register = ComponentRegister;
    componentData.setModel({});
  }));

  it('should init', function() {
    expect(componentData).not.toBe(null);
  });

  function assertComponent(comp) {
    expect(comp.compData).toBe('comp-data');
    expect(comp.clean).toBe(true);
    expect(comp.weight).toBe(1);
  }

  it('adding a component, merges the default data with the component data', function() {
    componentData.setModel({});
    var id = componentData.addComponentModel({compData: 'comp-data'});
    var component = null;
    componentData.registerPlaceholder(id, {
      setComponent: function(obj) {
        component = obj;
      }
    });

    assertComponent(component);
  });

  it('adding and removing components, gets the latest id available', function() {
    var id = componentData.addComponentModel({compData: 'comp-data'});
    expect(id).toBe(0);
    var idTwo = componentData.addComponentModel({compData: 'comp-data'});
    expect(idTwo).toBe(1);
    componentData.deleteComponent(1);
    var idThree = componentData.addComponentModel({compData: 'comp-data'});
    expect(idThree).toBe(2);
  });

  it('restore component', function() {
    var id = componentData.addComponentModel({compData: 'comp-data'});
    expect(id).toBe(0);
    componentData.deleteComponent(0);
    var idThree = componentData.restoreComponent(0);

    var restoredComp = null;
    componentData.registerPlaceholder(0, {
      setComponent: function(obj) {
        restoredComp = obj;
      }
    });
    assertComponent(restoredComp);
  });

  it('allows component registration', function() {
    var id = componentData.addComponentModel({ compData: 'comp-data'});
    var result = null;
    var bridge = new MockBridge();
    componentData.registerComponent(id, bridge);
    expect(bridge.dataAndSession).toEqual({data: { weight: 1, clean: true, compData: 'comp-data'}, session: {}});
  });

  it('allows component updates', function() {
    var id = componentData.addComponentModel({ compData: 'comp-data'});
    var result = null;
    var bridge = new MockBridge();
    componentData.registerComponent(id, bridge);
    componentData.updateComponent(id, { clean: false, compData: 'new data'});
    expect(bridge.dataAndSession).toEqual({data: {clean: false, compData: 'new data'}, session: {}});
  });

  it('adds and removes the component from the register', function() {

    var id = '1';
    var bridge = new MockBridge();

    componentData.setModel({ 1: {}});
    componentData.registerComponent(id, bridge);
    expect(_.keys(register.getSessions()).length).toEqual(1);

    componentData.deleteComponent(id);
    expect(_.keys(register.getSessions()).length).toEqual(0);

    componentData.restoreComponent(id);
    componentData.registerComponent(id, bridge);
    expect(_.keys(register.getSessions()).length).toEqual(1);
  });

  describe("item pruning", function(){
    it("does not pass feedback to setDataAndSession", function(){
      var id = '1';
      var bridge = new MockBridge();
      var model = { 1: {feedback:{}}};

      componentData.setModel(model);
      componentData.registerComponent(id, bridge);
      expect(bridge.dataAndSession).toEqual({data:{},session:{}});
    });
    it("does not pass correctResponse to setDataAndSession", function(){
      var id = '1';
      var bridge = new MockBridge();
      var model = { 1: {correctResponse:{}}};

      componentData.setModel(model);
      componentData.registerComponent(id, bridge);
      expect(bridge.dataAndSession).toEqual({data:{},session:{}});
    });
    it("does pass anything else to setDataAndSession", function(){
      var id = '1';
      var bridge = new MockBridge();
      var model = { 1: {anythingElse:{}}};

      componentData.setModel(model);
      componentData.registerComponent(id, bridge);
      expect(bridge.dataAndSession).toEqual({data:{anythingElse:{}},session:{}});
    });

    it("does not change the original model", function(){
      var id = '1';
      var bridge = new MockBridge();
      var model = { 1: {correctResponse:{}}};
      var saveModel = _.cloneDeep(model);

      componentData.setModel(model);
      componentData.registerComponent(id, bridge);
      expect(model).toEqual(saveModel);
    });

  });

});