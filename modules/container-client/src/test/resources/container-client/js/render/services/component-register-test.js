describe('component-register', function(){

  var register, bridge, defaultData;

  var MockBridge = function(){

    this.setModel = function(data){
      this.model = data;
    };

    this.setSession = function(s){
      this.session = s;
    };

    this.setAnswer = function(a){
      this.answer = a;
    };

    this.setResponse = function(r){
      this.response = r;
    };

    this.getAnswer = function(){
      return defaultAnswer;
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
    }
  };

  it('should setSession', setValue("setSession", "session", function(id,v) { return v; } ) );
  it('should setData', setValue("setData", "model", function(id,v){ return v[id].model;}) );
  it('should setAnswers', setValue("setAnswers", "answer") );
  it('should setResponses', setValue("setResponses", "response") );

  it('should getAnswers', function(){
    register.setData(defaultData);
    var answers = register.getAnswers();
    var expectedAnswers = { "1" :  defaultAnswer };
    expect(expectedAnswers).toEqual(answers);
  });
});