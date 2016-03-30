describe('callback-utils', function() {

  var utils = new corespring.require('callback-utils');

  describe('instanceCallbackHandler', function() {

    var singleParamHandler, callback;

    beforeEach(function(){
      singleParamHandler = jasmine.createSpy('singleParamHandler');
      callback = utils.instanceCallbackHandler(singleParamHandler);
    });
    
    it('should return a callback', function() {
      expect(callback).toEqual(jasmine.any(Function));
    });
    
    it('the returned callback calls input function with result object with an error', function() {
      callback('error');
      expect(singleParamHandler).toHaveBeenCalledWith({error: 'error'});
    });
    
    it('the returned callback calls input function with result object with data', function() {
      callback(null, {success: true});
      expect(singleParamHandler).toHaveBeenCalledWith({result: {success: true}});
    });

  });

});
