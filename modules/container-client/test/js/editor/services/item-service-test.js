describe('ItemService', function(){

  var service, http, onSuccess, onFailure, itemUrls;
  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(module(function($provide) {
    var e = org.corespring.mocks.editor;
    http = e.$http();

    itemUrls = {
      saveSubset: {
        method: 'PUT',
        url: 'saveSubset'
      },
      saveConfigXhtmlAndComponents: {
        method: 'PUT',
        url: 'saveConfigXhtmlAndComponents'
      }
    };

    $provide.value('$http', http);
    $provide.value('$timeout', e.$timeout());
    $provide.value('ItemUrls', itemUrls);
    $provide.value('LogFactory', new e.LogFactory());
    $provide.value('QueryParamUtils', new e.QueryParamUtils());
  }));

  beforeEach(inject(function(ItemService){
    service = ItemService;
  }));

  describe('addSaveListener', function(){

    var saveListener;

    beforeEach(function(){
      saveListener = {
        handleSaveMessage: jasmine.createSpy('saveListener')
      };

      onSuccess = jasmine.createSpy('onSuccess');
      onFailure = jasmine.createSpy('onFailure');
      service.addSaveListener('1', saveListener);
      service.saveSummaryFeedback({summaryFeedback: 'hi'}, onSuccess, onFailure);
    });

    it('gets \'saving\' event', function(){
      expect(saveListener.handleSaveMessage).toHaveBeenCalledWith('saving');
    });
    
    it('gets \'saved\' event on success', function(){
      http.prototype.promise.triggerSuccess();
      expect(saveListener.handleSaveMessage).toHaveBeenCalledWith('saved');
    });
    
    it('gets \'error\' event on failure', function(){
      http.prototype.promise.triggerError();
      expect(saveListener.handleSaveMessage).toHaveBeenCalledWith('error');
    });
  });

  function describeSave(name, raw, expected){

    expected = expected || raw;

    describe(name, function(){
      beforeEach(function(){
        itemUrls[name] = {
          method: 'PUT',
          url: name
        };

        onSuccess = jasmine.createSpy('onSuccess');
        onFailure = jasmine.createSpy('onFailure');
        service[name](raw, onSuccess, onFailure);
      });

      it('call $http saveSubset', function(){
        expect(http).toHaveBeenCalledWith({ method: 'PUT', url: 'saveSubset', data: expected});
      });
      
      it('calls onSuccess', function(){
        http.prototype.promise.triggerSuccess({});
        expect(onSuccess).toHaveBeenCalledWith({});
      });
      
      it('calls onFailure', function(){
        http.prototype.promise.triggerError('error');
        expect(onFailure).toHaveBeenCalledWith('error');
      });
    });
  }

  describeSave('saveComponents', {components: {}});
  describeSave('saveCustomScoring', '//custom scoring', {customScoring: '//custom scoring'});
  describeSave('saveProfile', {profile: {}});
  describeSave('saveSummaryFeedback', 'summary feedback', {summaryFeedback: 'summary feedback'});
  describeSave('saveXhtml', '<div/>', {xhtml: '<div/>'});
  describeSave('saveCollectionId', 'collectionId', {collectionId: 'collectionId'});
  
  describe('saveConfigXhtmlAndComponents', function(){

    beforeEach(function(){
      onSuccess = jasmine.createSpy('onSuccess');
      onFailure = jasmine.createSpy('onFailure');
      service.saveConfigXhtmlAndComponents({}, '<div/>', {}, onSuccess, onFailure);
    });

    it('call $http', function(){
      expect(http).toHaveBeenCalledWith({ method: 'PUT', url: 'saveConfigXhtmlAndComponents', data: {config: {}, xhtml: '<div/>', components: {}}});
    });
    
    it('calls onSuccess', function(){
      http.prototype.promise.triggerSuccess({});
      expect(onSuccess).toHaveBeenCalledWith({});
    });
    
    it('calls onFailure', function(){
      http.prototype.promise.triggerError('error');
      expect(onFailure).toHaveBeenCalledWith('error');
    });
  });
});