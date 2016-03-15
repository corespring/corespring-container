describe('player-service-definition', function () {

  var service, size, onSuccess, onFailure, http, promise;

  beforeEach(angular.mock.module('corespring-player.services'));

  beforeEach(module(function ($provide) {

    promise = {
      success: function(onSuccess){
        onSuccess();
        return promise;
      },
      error: function(){}
    };

    http = {
      get: jasmine.createSpy().and.returnValue(promise),
      put: jasmine.createSpy().and.returnValue(promise),
      delete: jasmine.createSpy().and.returnValue(promise),
      post: jasmine.createSpy().and.returnValue(promise)
    };

    $provide.value('$http', http);
    $provide.value('EmbeddedItemAndSession', {session:{}, item:{}});
    $provide.value('PlayerServiceEndpoints', {
      queryParams: {},
      session: {
        complete: {method: 'put', url: '/client/session/complete/56cc6d6660b2985b7cb27552.json'},
        getScore: {method: 'put', url: '/client/session/56cc6d6660b2985b7cb27552/score.json'},
        loadInstructorData: {method: 'get', url: '/client/session/load-instructor-data/56cc6d6660b2985b7cb27552.json'},
        loadSession: {method: 'get', url: '/client/session/item-and-session/56cc6d6660b2985b7cb27552.json'},
        loadOutcome: {method: 'put', url: '/client/session/load-outcome/56cc6d6660b2985b7cb27552.json'},
        reopen: {method: 'get', url: '/client/session/reopen/56cc6d6660b2985b7cb27552.json'},
        reset: {method: 'get', url: '/client/session/reset/56cc6d6660b2985b7cb27552.json'},
        save: {method: 'put', url: '/client/session/save/56cc6d6660b2985b7cb27552.json'}
      }
    });
  }));

  beforeEach(inject(function ($rootScope, PlayerServiceDefinition) {
    service = new PlayerServiceDefinition();
    onSuccess = jasmine.createSpy('success');
    onFailure = jasmine.createSpy('failure');
  }));

  it('should exist', function () {
    expect(service).toBeDefined();
  });

  describe('queued calls before loadItemAndSession', function(){

    it('should allow to call loadItemAndSession', function(){
      service.loadItemAndSession(onSuccess, onFailure);
      expect(onFailure).not.toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });


    function itOnlyCallsAfterLoadItemAndSession(name, fn){
    
      it('should only call  ' + name + ' callback after loadItemAndSession is complete', function(){
        var localOnSuccess = jasmine.createSpy('localOnSuccess');
        var localOnFailure = jasmine.createSpy('localOnFailure');
        fn(localOnSuccess, localOnFailure);
        expect(localOnSuccess).not.toHaveBeenCalled();
        expect(localOnFailure).not.toHaveBeenCalled();
        service.loadItemAndSession(onSuccess, onFailure);
        expect(localOnFailure).not.toHaveBeenCalled();
        expect(localOnSuccess).toHaveBeenCalled();
      });
    }

    itOnlyCallsAfterLoadItemAndSession('completeResponse', function(onSuccess, onFailure){
      service.completeResponse(onSuccess, onFailure);
    });
    
    itOnlyCallsAfterLoadItemAndSession('getScore', function(onSuccess, onFailure){
      service.getScore({components:{}}, onSuccess, onFailure);
    });
    
    itOnlyCallsAfterLoadItemAndSession('loadInstructorData', function(onSuccess, onFailure){
      service.loadInstructorData({}, onSuccess, onFailure);
    });
    
    itOnlyCallsAfterLoadItemAndSession('loadOutcome', function(onSuccess, onFailure){
      service.loadOutcome({}, onSuccess, onFailure);
    });
    
    itOnlyCallsAfterLoadItemAndSession('reopenSession', function(onSuccess, onFailure){
      service.reopenSession(onSuccess, onFailure);
    });
    
    itOnlyCallsAfterLoadItemAndSession('resetSession', function(onSuccess, onFailure){
      service.resetSession(onSuccess, onFailure);
    });
    
    itOnlyCallsAfterLoadItemAndSession('saveSession', function(onSuccess, onFailure){
      service.saveSession({}, onSuccess, onFailure);
    });

  });

});