describe('draft', function() {

  var draft, done, errorCodes, createResult;

  beforeEach(function(){

    errorCodes = corespring.require('error-codes');
    createResult = {itemId: 'itemId', draftName: 'draftName'}; 

    $.ajax = jasmine.createSpy('$.ajax').and.callFake(function(opts){
      opts.success(createResult);
    }); 
    done = jasmine.createSpy('done');
    draft = new corespring.require('draft');
  });

  describe('createItemAndDraft', function() {

    var onItemCreated, onDraftCreated;
    describe('when successful', function(){

      onItemCreated = jasmine.createSpy('onItemCreated');
      onDraftCreated = jasmine.createSpy('onDraftCreated');

      it('calls $.ajax', function(){
        draft.createItemAndDraft({url: 'url', method: 'POST'}, {
          onItemCreated: onItemCreated,
          onDraftCreated: onDraftCreated
        }, done);
        expect($.ajax).toHaveBeenCalledWith({
          type: 'POST',
          url: 'url', 
          data: jasmine.any(Object),
          success: jasmine.any(Function),
          error: jasmine.any(Function),
          dataType: 'json'
        });
      });

      it('calls done with success', function(){
        draft.createItemAndDraft({url: 'url', method: 'POST'}, {}, done);
        expect(done).toHaveBeenCalledWith(null, createResult);
      });

      it('calls onItemCreated', function(){
        expect(onItemCreated).toHaveBeenCalledWith(createResult.itemId);
      });
      
      it('calls onDraftCreated', function(){
        expect(onDraftCreated).toHaveBeenCalledWith(createResult.itemId, createResult.draftName);
      });
    });

    describe('when it fails', function(){

      beforeEach(function(){
        $.ajax.and.callFake(function(opts){
          opts.error({responseJSON: {error: 'error'}});
        });
      });
      
      it('calls done with error', function(){
        draft.createItemAndDraft({url: 'url', method: 'POST'}, {}, done);
        expect(done).toHaveBeenCalledWith(errorCodes.CREATE_ITEM_AND_DRAFT_FAILED('error'));
      });
    });
  });


  describe('xhrCommitDraft', function(){

    beforeEach(function(){
      done = jasmine.createSpy('done');
    });

    describe('when successful', function(){

      beforeEach(function(){
        $.ajax.and.callFake(function(opts){
          opts.success();
        });
        draft.xhrCommitDraft('POST', 'url', 'draftId', done);
      });

      it('call $.ajax', function(){
        expect($.ajax).toHaveBeenCalledWith({
          type: 'POST',
          url: 'url', 
          data: jasmine.any(Object),
          success: jasmine.any(Function),
          error: jasmine.any(Function),
          dataType: 'json'
        });
      });

      it('calls the callback', function(){
        expect(done).toHaveBeenCalledWith(null);
      });
    });

    describe('when it fails', function(){
      beforeEach(function(){
        $.ajax.and.callFake(function(opts){
          opts.error({
            responseJSON: {
              error: 'error'
            }
          });
        });
        draft.xhrCommitDraft('POST', 'url', 'draftId', done);
      });

      it('calls the callback', function(){
        expect(done).toHaveBeenCalledWith(errorCodes.COMMIT_DRAFT_FAILED('error'));
      });
    });
  });

});
