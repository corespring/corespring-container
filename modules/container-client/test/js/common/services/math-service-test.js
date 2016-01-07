describe('MathJaxService', function() {

  var realMathJax;
  var mathJaxService, timeout, onHubSignal;

  function MockMathJax() {
    this.Hub = {
      Config: function() {},
      Queue: function(params, callback) {
        if (callback) {
          callback();
        }
      },
      signal: {
        Interest: function(signal) {
          onHubSignal = signal;
        }
      }
    };
  }

  beforeEach(function() {
    realMathJax = MathJax;
    MathJax = new MockMathJax();
    spyOn(MathJax.Hub, 'Config').and.callThrough();
    spyOn(MathJax.Hub, 'Queue').and.callThrough();
    spyOn(MathJax.Hub.signal, 'Interest').and.callThrough();
  });

  afterEach(function() {
    MathJax = realMathJax;
  });

  beforeEach(angular.mock.module('corespring-common.services'));

  beforeEach(inject(function(MathJaxService, $timeout) {
    mathJaxService = MathJaxService;
    timeout = $timeout;
  }));

  describe('initialize', function() {

    it('should call MathJax.Hub.Queue', function() {
      expect(MathJax.Hub.signal.Interest).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('should configure MathJax to not show processing messages', function() {
      expect(MathJax.Hub.Config).toHaveBeenCalledWith({showProcessingMessages: false});
    });

  });

  describe('parseDomForMath', function() {
    describe('with delay', function() {
      beforeEach(function() {
        mathJaxService.parseDomForMath(100);
        timeout.flush();
      });

      it('should queue a MathJax typeset', function() {
        expect(MathJax.Hub.Queue).toHaveBeenCalledWith(["Typeset", MathJax.Hub], jasmine.any(Function));
      });
    });

    describe('without delay', function() {
      beforeEach(function() {
        mathJaxService.parseDomForMath(0);
      });

      it('should queue a MathJax typeset immediately', function() {
        expect(MathJax.Hub.Queue).toHaveBeenCalledWith(["Typeset", MathJax.Hub], jasmine.any(Function));
      });
    });

  });

  describe('onEndProcess', function() {
    var args = [1,2,3];
    var element = $("<div></div>");
    var callback = jasmine.createSpy('callback');

    beforeEach(function() {
      mathJaxService.onEndProcess(callback, element);
      onHubSignal(["End Process"].concat(args));
    });

    it('should add a listener for callback and element', function() {
      expect(callback).toHaveBeenCalledWith(args[0], args[1], args[2]);
    });

  });

  describe('off', function() {
    var args = [1,2,3];
    var element = $("<div></div>");
    var callback = jasmine.createSpy('callback');

    beforeEach(function() {
      mathJaxService.onEndProcess(callback, element);
      mathJaxService.off(callback, element);
      onHubSignal(["End Process"].concat(args));
    });

    it('should remove listener for callback and element', function() {
      expect(callback).not.toHaveBeenCalled();
    });
  });


});