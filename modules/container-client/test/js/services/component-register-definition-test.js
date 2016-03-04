describe('ComponentRegisterDefinition', function() {

  var componentRegister;
  var id = 'id';
  var unregisteredId = '_id';
  var mockSession = {this: 'is', a: 'mock'};

  var mockComponentMethods = {
    answerChangedHandler: jasmine.createSpy('answerChangedHandler'),
    editable: jasmine.createSpy('editable'),
    setDataAndSession: jasmine.createSpy('setDataAndSession'),
    reset: jasmine.createSpy('reset'),
    getSession: (function() {
      var spy = jasmine.createSpy('getSession');
      spy.and.returnValue(mockSession);
      return spy;
    })(),
    resetStash: jasmine.createSpy('resetStash'),
    isAnswerEmpty: (function() {
      var spy = jasmine.createSpy('isEmpty');
      spy.and.returnValue(true);
      return spy;
    })(),
    setResponse: jasmine.createSpy('setResponse'),
    setMode: jasmine.createSpy('setMode')
  };

  function MockComponent() {
    for (var method in mockComponentMethods) {
      this[method] = mockComponentMethods[method];
    }
  }

  function resetMocks() {
    for (var method in mockComponentMethods) {
      mockComponentMethods[method].calls.reset();
    }
  }

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(inject(function(ComponentRegisterDefinition, $timeout) {
    componentRegister = new ComponentRegisterDefinition();
  }));

  afterEach(resetMocks);

  var component;

  beforeEach(function(){
    component = new MockComponent();
  });

  describe('registerComponent', function() {
    var editable = true;
    var answerChangedHandler = function() {};
  
    beforeEach(function(){
      componentRegister.setEditable(editable);
      componentRegister.setAnswerChangedHandler(answerChangedHandler);
    }); 

    describe('when data is set before the component', function(){

      var dataAndSession;

      beforeEach(function(){
        dataAndSession = { 
          data: {isData: true},
          session: {isSession: true}
        };

        componentRegister.setDataAndSession({id: dataAndSession});
        componentRegister.registerComponent('id', component);
      });

      it('sets the data on the component', function(){
        expect(mockComponentMethods.setDataAndSession).toHaveBeenCalledWith(dataAndSession);
      });

    });
    
    describe('when the component is registered before the data', function(){
      beforeEach(function() {
        componentRegister.registerComponent('id', component);
      });

      it('should set editable on component', function() {
        expect(mockComponentMethods.editable).toHaveBeenCalledWith(editable);
      });

      it('should set answerChangedHandler on component', function() {
        expect(mockComponentMethods.answerChangedHandler).toHaveBeenCalledWith(answerChangedHandler);
      });

    });
  });

  describe('setSingleDataAndSession', function() {
    var data = {this: 'is', the: 'data'};
    var session = {this: 'is', the: 'session'};

    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.setSingleDataAndSession(id, data, session);
    });

    it('should set data and session on registered component', function() {
      expect(mockComponentMethods.setDataAndSession).toHaveBeenCalledWith({data: data, session: session});
    });

  });

  describe('getSessions', function() {
    var expectedSessions = {};
    expectedSessions[id] = mockSession;

    beforeEach(function() {
      componentRegister.registerComponent(id, component);
    });

    it('should return session from registered component', function() {
      var sessions = componentRegister.getSessions();
      expect(mockComponentMethods.getSession).toHaveBeenCalled();
      expect(sessions).toEqual(expectedSessions);
    });

  });

  describe('deregisterComponent', function() {
    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.deregisterComponent(id);
    });

    it('should remove component', function() {
      expect(componentRegister.hasComponent(id)).toBe(false);
    });

  });

  describe('hasComponent', function() {
    beforeEach(function() {
      componentRegister.registerComponent(id, component);
    });

    describe('unregistered component', function() {
      it('should return false', function() {
        expect(componentRegister.hasComponent(unregisteredId)).toBe(false);
      });
    });

    describe('registered component', function() {
      it('should return true', function() {
        expect(componentRegister.hasComponent(id)).toBe(true);
      });
    });

  });

  describe('resetStash', function() {
    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.resetStash();
    });

    it('should resetStash on components', function() {
      expect(mockComponentMethods.resetStash).toHaveBeenCalled();
    });

  });

  describe('isAnswerEmpty', function() {
    beforeEach(function() {
      componentRegister.registerComponent(id, component);
    });

    it('should return false for unregistered component', function() {
      expect(componentRegister.isAnswerEmpty(unregisteredId)).toBe(true);
    });

    it('should return true for registered component with empty answer', function() {
      expect(componentRegister.isAnswerEmpty(id)).toBe(true);
    });

  });

  describe('setOutcomes', function() {
    var component = new MockComponent();
    var outcomes = {};
    outcomes[id] = {some: 'kind', of: 'outcome'};

    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.setOutcomes(outcomes);
    });

    it('should call setResponse on component', function() {
      expect(mockComponentMethods.setResponse).toHaveBeenCalledWith(outcomes[id]);
    });

  });

  describe('reset', function() {
    var component = new MockComponent();

    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.reset();
    });

    it('should call reset on component', function() {
      expect(mockComponentMethods.reset).toHaveBeenCalled();
    });
  });

  describe('interactionCount', function() {
    var n = 10;

    beforeEach(function() {
      var components = (function() {
        var components = [];
        for (var i = 0; i < n; i++) {
          components.push(new MockComponent());
        }
        return components;
      })();
      for (var i in components) {
        componentRegister.registerComponent("id_" + i, components[i]);
      }
    });

    it('should count number of registered components', function() {
      expect(componentRegister.interactionCount()).toEqual(n);
    });

  });

  describe('setEditable', function() {
    var editable = false;

    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.setEditable(editable);
    });

    it('should call reset on component', function() {
      expect(mockComponentMethods.editable).toHaveBeenCalledWith(editable);
    });
  });

  describe('setMode', function() {
    var mode = 'evaluate';

    beforeEach(function() {
      componentRegister.registerComponent(id, component);
      componentRegister.setMode(mode);
    });

    it('should call reset on component', function() {
      expect(mockComponentMethods.setMode).toHaveBeenCalledWith(mode);
    });
  });

});