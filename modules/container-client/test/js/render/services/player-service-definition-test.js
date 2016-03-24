describe('player-service-definition', function () {

  var service, size, onSuccess, onFailure, http, promise, queryParamUtils;

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

    queryParamUtils = org.corespring.mocks.editor.QueryParamUtils();

    $provide.value('$http', http);
    $provide.value('EmbeddedItemAndSession', {session:{}, item:{}});
    $provide.value('QueryParamUtils', queryParamUtils); 
    $provide.value('PlayerServiceEndpoints', {
      session: {
        complete: {method: 'put', url: 'complete'},
        getScore: {method: 'put', url: 'getScore'},
        loadInstructorData: {method: 'get', url: 'loadInstructorData'},
        loadSession: {method: 'get', url: 'loadSession'},
        loadOutcome: {method: 'put', url: 'loadOutcome'},
        reopen: {method: 'get', url: 'reopen'},
        reset: {method: 'get', url: 'reset'},
        save: {method: 'put', url: 'save'}
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