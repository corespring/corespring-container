describe('component-register', function(){

  var rootScope, compile, mockRegister;

  var MockRegister = function(){
    this.setDataAndSession = function(ds){
      this.dataAndSession = ds;
    }
  };

  var MockMathService = function(){

    this.parseDomForMath = function(){

    }
  }


  beforeEach(angular.mock.module('corespring-player.directives'));

  beforeEach(function () {
    module(function ($provide) {


      mockRegister = new MockRegister();

      $provide.value('ComponentRegister', mockRegister);
      $provide.value('MathJaxService', new MockMathService());
    });
  });

  beforeEach(inject(function ($compile, $rootScope) {
    rootScope = $rootScope.$new();
    compile = $compile;
  }));

  it('should init', function(){
    var elem = compile("<corespring-player/>")(rootScope);
    expect(elem).toNotBe(null);
  });


  it('should with data', function(){

    rootScope.item = {
      components: {
        "1" : {
          value : "component data"
        }
      }
    };

    rootScope.session = {
      components : {
        "1" : {
          value : "session data"
        }
      }
    };


    var elem = compile("<corespring-player player-item='item' player-session='session'/>")(rootScope);


    rootScope.$digest();

    var expected = {
      "1" : {
        data : rootScope.item.components["1"],
        session : rootScope.session.components["1"]
      }
    };

    expect(mockRegister.dataAndSession).toEqual(expected);
  });
});