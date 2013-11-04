describe('component-register', function(){

  var register, bridge, defaultData;

  var MockBridge = function(){

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

  it('should setResponses', setValue("setResponses", "response") );


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