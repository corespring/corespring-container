describe('player-service-definition', function () {

  var sut, size;

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(module(function ($provide) {
    $provide.value('EmbeddedItemAndSession', {session:{}, item:{}});
    $provide.value('PlayerServiceEndpoints', {
      queryParams: {},
      endpoints: {
        completeResponse: {method: 'put', url: '/client/session/complete/56cc6d6660b2985b7cb27552.json'},
        getScore: {method: 'put', url: '/client/session/56cc6d6660b2985b7cb27552/score.json'},
        loadInstructorData: {method: 'get', url: '/client/session/load-instructor-data/56cc6d6660b2985b7cb27552.json'},
        loadSession: {method: 'get', url: '/client/session/item-and-session/56cc6d6660b2985b7cb27552.json'},
        loadOutcome: {method: 'put', url: '/client/session/load-outcome/56cc6d6660b2985b7cb27552.json'},
        reopenSession: {method: 'get', url: '/client/session/reopen/56cc6d6660b2985b7cb27552.json'},
        resetSession: {method: 'get', url: '/client/session/reset/56cc6d6660b2985b7cb27552.json'},
        saveSession: {method: 'put', url: '/client/session/save/56cc6d6660b2985b7cb27552.json'}
      }
    });
  }));

  beforeEach(inject(function ($rootScope, PlayerServiceDefinition) {
    sut = new PlayerServiceDefinition();
  }));

  it('should exist', function () {
    expect(sut).toBeDefined();
  });

  describe('before loadItemAndSession', function(){
    var onSuccess, onFailure;

    beforeEach(function(){
      onSuccess = jasmine.createSpy('success');
      onFailure = jasmine.createSpy('failure');
    });

    it('should allow to call loadItemAndSession', function(){
      sut.loadItemAndSession(onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should return error when completeResponse is called', function(){
      sut.completeResponse(onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should return error when getScore is called', function(){
      sut.getScore({components:{}}, onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should return error when loadInstructorData is called', function(){
      sut.loadInstructorData({}, onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should return error when loadOutcome is called', function(){
      sut.loadOutcome({}, onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should return error when reopenSession is called', function(){
      sut.reopenSession(onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should return error when resetSession is called', function(){
      sut.resetSession(onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });
    it('should return error when saveSession is called', function(){
      sut.saveSession({}, onSuccess, onFailure);
      expect(onFailure).toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

  });

  describe('after loadItemAndSession', function(){
    var onSuccess, onFailure;

    beforeEach(function(){
      onSuccess = jasmine.createSpy('success');
      onFailure = jasmine.createSpy('failure');
      sut.loadItemAndSession(onSuccess, onFailure);
    });

    it('should allow to call loadItemAndSession again', function(){
      sut.loadItemAndSession(onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should return success when completeResponse is called', function(){
      sut.completeResponse(onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
    it('should return success when getScore is called', function(){
      sut.getScore({components:{}}, onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
    it('should return success when loadInstructorData is called', function(){
      sut.loadInstructorData({}, onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
    it('should return success when loadOutcome is called', function(){
      sut.loadOutcome({}, onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
    it('should return success when reopenSession is called', function(){
      sut.reopenSession(onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
    it('should return success when resetSession is called', function(){
      sut.resetSession(onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
    it('should return success when saveSession is called', function(){
      sut.saveSession({}, onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });

  });



});