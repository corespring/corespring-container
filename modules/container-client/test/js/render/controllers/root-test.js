describe('render root', function() {

  var scope, element;
  var iFrame = false;

  var mockOn = jasmine.createSpy('on');
  var mockSend = jasmine.createSpy('send');

  function MockMsgr() {
    this.on = mockOn;
    this.send = mockSend;
  }

  var iFrameService = {
    isInIFrame: function() {
      return iFrame;
    }
  };

  afterEach(function() {
    mockOn.calls.reset();
    mockSend.calls.reset();
  })

  beforeEach(angular.mock.module('corespring-player.controllers'));

  beforeEach(module(function($provide) {
    $provide.value('$log', function() {});
    $provide.value('Msgr', new MockMsgr());
    $provide.value('iFrameService', iFrameService);
  }));

  function init($rootScope, $compile) {
    scope = $rootScope.$new();
    element = $compile('<div ng-controller="Root"></div>')(scope);
    scope = element.scope();
    spyOn(scope, "$broadcast").and.callThrough();
  }

  describe('not loaded in iframe', function() {

    beforeEach(inject(function($rootScope, $compile, $timeout) {
      init($rootScope, $compile);
      $timeout.flush();
    }));

    it('should broadcast initialise with mode gather', function() {
      expect(scope.$broadcast).toHaveBeenCalledWith('initialise', jasmine.objectContaining({ mode: 'gather' }));
    });

    it('should not send ready event to Msgr', function() {
      expect(mockSend).not.toHaveBeenCalledWith('ready');
    });

    describe('session-loaded event', function() {
      beforeEach(function() {
        scope.$emit('session-loaded');
      });

      it("should not interact with Msgr", function() {
        expect(mockSend).not.toHaveBeenCalled();
      });

    });

    describe('inputReceived event', function() {
      beforeEach(function() {
        scope.$emit('inputReceived');
      });

      it("should not interact with Msgr", function() {
        expect(mockSend).not.toHaveBeenCalled();
      });

    });

    describe('rendered event', function() {
      beforeEach(function() {
        scope.$emit('rendered');
      });

      it('should not interact with Msgr', function() {
        expect(mockSend).not.toHaveBeenCalled();
      });

    });

  });


  describe('loaded in iframe', function() {

    beforeEach(inject(function($rootScope, $compile) {
      iFrame = true;
      init($rootScope, $compile);
    }));

    it('should bind * to Msgr', function() {
      expect(mockOn).toHaveBeenCalledWith("*", jasmine.any(Function));
    });

    it('should send ready event to Msgr', function() {
      expect(mockSend).toHaveBeenCalledWith('ready');
    });

    describe('session-loaded event', function() {
      var session = {};
      beforeEach(function() {
        scope.$emit('session-loaded', session);
      });

      it("should send sessionCreated event to Msgr with session", function() {
        expect(mockSend).toHaveBeenCalledWith('sessionCreated', {session: session});
      });

    });

    describe('inputReceived event', function() {
      var data = {
        sessionStatus: 'great'
      };
      beforeEach(function() {
        scope.$emit('inputReceived', data);
      });

      it("should send inputReceived event to Msgr with sessionStatus", function() {
        expect(mockSend).toHaveBeenCalledWith('inputReceived', data.sessionStatus);
      });

    });

    describe('rendered event', function() {
      beforeEach(function() {
        scope.$emit('rendered');
      });

      it('should send rendered event to Msgr', function() {
        expect(mockSend).toHaveBeenCalledWith('rendered');
      });

    });

    afterEach(function() {
      iFrame = false;
    });

  });

});