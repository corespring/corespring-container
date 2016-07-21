describe('component-register', function(){

  var register, bridge, defaultData, defaultAnswer;

  var MockBridge = function(){

    var isEditable; 

    this.setDataAndSession = function(s){
      this.dataAndSession = s;
    };

    this.setResponse = function(r){
      this.response = r;
    };

    this.getSession = function(){
      return {
        answers: defaultAnswer
      };
    };

    this.isAnswerEmpty = function(){
      return _.isEmpty(this.getSession().answers);
    };

    this.editable = function(e){
      if(e !== undefined){
        isEditable = e;
      } else {
        return isEditable;
      } 
    };

    this.setMode = function(mode){

    };

    this.reset = function(){

    };

    this.answerChangedHandler = function(){

    };
  };

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(inject(function ($rootScope, ComponentRegister) {
    register = ComponentRegister;
    bridge = new MockBridge();
    defaultData = { "1" : { model : {blah: "blah" } }};
    defaultAnswer = { answer: "blah" };
    register.registerComponent("1", bridge);
  }));

  var setValue = function(functionName, bridgeName, extractValue){
    extractValue = extractValue || function(id, v){return v[id];};

    return function(){
      register[functionName](defaultData);
      var expected = bridge[bridgeName];
      expect(expected).toEqual(extractValue("1",defaultData));
    };
  };

  describe('setOutcomes', function(){
    it('should setOutcomes', function(){
      register.setOutcomes(defaultData);
      expect(bridge.response).toEqual(defaultData[1]);
    });
    it('should clone the outcome data', function(){
      register.setOutcomes(defaultData);
      expect(bridge.response).not.toBe(defaultData[1]);
    });
  });

  it('should set editable', function(){
    register.setEditable(true);
    expect(bridge.editable()).toEqual(true);
    register.setEditable(false);
    expect(bridge.editable()).toEqual(false);
  });

  it('should set editable on newly registered components', function(){
    var newBridge = new MockBridge();
    register.setEditable(true);
    register.registerComponent("2", newBridge);
    expect(newBridge.editable()).toEqual(true);
    register.setEditable(false);
    expect(newBridge.editable()).toEqual(false);
  });

  it('should setDataAndSession', setValue("setDataAndSession", "dataAndSession") );

  it('should getAnswers', function(){
    register.setDataAndSession( { data : defaultData } );
    var answers = register.getComponentSessions();
    var expectedAnswers = { "1" :  { answers: defaultAnswer } };
    expect(expectedAnswers).toEqual(answers);
  });

  it('has Empty is correct ', function(){
    register.setDataAndSession( { data : defaultData } );
    expect(register.hasEmptyAnswers()).toEqual(false);

    // simulate empty session
    bridge.getSession = function() {
      return {
        answers: []
      };
    };
    expect(register.hasEmptyAnswers()).toEqual(true);
  });
});