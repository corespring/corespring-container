describe('component-editor', function () {
    
  var launcher, instance, Def, errorCodes, modules; 

  beforeEach(function () {
    corespring.mock.modules['launch-config'] = {};

    sendResults = {
      getComponentKey: 'singleComponent'
    };

    instance = new org.corespring.mocks.launcher.MockInstance();

    instance.send.and.callFake(function(){
      var args = Array.prototype.slice.call(arguments);
      var done = args[args.length -1];
      var key = args[0];
      done = _.isFunction(done) ? done : null;
      if(done){
        done(null, sendResults[key] || {});
      }
    });

    var launcherFn = org.corespring.mocks.launcher.MockLauncher(instance);
    launcher = new launcherFn();
    corespring.mock.modules['client-launcher'] = function(){
      return launcher;
    }; 
    modules = corespring.require('component-editor');
    errorCodes = corespring.require('error-codes');
    errorCallback = jasmine.createSpy('errorCallback');
  });

  afterEach(function () {
    corespring.mock.reset();
  });

  describe('QuestionComponentEditor', function(){

    beforeEach(function(){
      spyOn(modules, 'Draft');
      spyOn(modules, 'Item');
      spyOn(modules, 'Standalone');
    });

    it('defaults to item', function(){
      new modules.QuestionComponentEditor('el', {}, jasmine.createSpy());
      expect(modules.Item).toHaveBeenCalled();
    }); 
    
    it('creates to Item editor if contentStorage: item', function(){
      new modules.QuestionComponentEditor('el', {contentStorage: 'item'}, jasmine.createSpy());
      expect(modules.Item).toHaveBeenCalled();
    }); 
    
    it('creates to Standalone editor if contentStorage: none', function(){
      new modules.QuestionComponentEditor('el', {contentStorage: 'none'}, jasmine.createSpy());
      expect(modules.Standalone).toHaveBeenCalled();
    }); 
    
    it('creates to Draft editor if contentStorage: draft', function(){
      new modules.QuestionComponentEditor('el', {contentStorage: 'draft'}, jasmine.createSpy());
      expect(modules.Draft).toHaveBeenCalled();
    }); 
  });

  describe('standalone', function(){

    var standalone;
    
    beforeEach(function(){

      launcher.loadCall.and.returnValue({
        method: 'GET', url: 'standalone'
      }); 

      Def = modules.Standalone;
    });

    describe('constructor', function(){

      it('should create a new instance', function(){
        standalone = new Def('element', {}, errorCallback);
        expect(standalone).not.toBe(undefined);
      });
      
      it('should call the errorCallback - if it can\'t find a url in the launch config', function(){
        launcher.loadCall.and.returnValue({});
        standalone = new Def('element', {componentType: 't'}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.CANT_FIND_URL('standaloneEditor'));
      });

      it('should call the errorCallback - if it can\'t find a componentType in the options', function(){
        standalone = new Def('element', {}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.NO_COMPONENT_TYPE);
      });
      
      it('should call errorCallback if the uploadUrl is missing :filename', function(){
        standalone = new Def('element', {componentType: 't', uploadUrl: 'url'}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.UPLOAD_URL_MISSING_FILENAME);
      });

      it('should define core methods on successful construction', function(){
        standalone = new Def('element', {componentType: 't'}, errorCallback);
        expect(_.isFunction(standalone.showNavigation)).toBe(true);
        expect(_.isFunction(standalone.showPane)).toBe(true);
        expect(_.isFunction(standalone.remove)).toBe(true);
      });
    });

    describe('getData and setData', function(){
      
      var data; 
      
      beforeEach(function(){
        data = {};
        standalone = new Def('element', {componentType: 'componentType'}, jasmine.createSpy('errorCallback'));
        standalone.getData(jasmine.createSpy('onGetData'));
      });

      it('should call instance.send(getData)', function(){
        standalone.getData(jasmine.createSpy('onGetData'));
        expect(instance.send).toHaveBeenCalledWith('getData', jasmine.any(Function));
      });

      it('should call instance.send(setData, data)', function(){
        standalone.setData(data, jasmine.createSpy('onSetData'));
        expect(instance.send).toHaveBeenCalledWith('setData', data, jasmine.any(Function));
      });
    });
  });
    
  function ajaxFail(e, opts){
    opts.error({responseJSON: {error: e}});
  } 


  function assertSave(moduleName){
    
    var name = moduleName.toLowerCase();

    describe('save', function(){
      var editor;

      var onSaved;
      
      var loadKey = name + 'Editor.singleComponent.loadData';
      var saveKey = name + 'Editor.singleComponent.saveComponents'; 
      beforeEach(function(){

        launcher.loadCall.and.callFake(function(key){
          return {method: 'GET', url: key};
        });
        
        data = {};
        data[loadKey + '.success'] = { 
            components: {
            singleComponent: {}
          }
        };
        
        data[saveKey + '.success'] = { 
            components: {
            singleComponent: {}
          }
        };

        $.ajax.and.callFake(function(opts){
          if(data[opts.url + '.error']){
            opts.error(data[opts.url + '.error'] || {});
          } else if(data[opts.url + '.success']){
            opts.success(data[opts.url + '.success'] || {});
          } else {
            opts.success({});
          }
        });
        
        sendResults.getData = {
          componentType: 'type'
        };

        onSaved = jasmine.createSpy('onSaved');
      });

      function initAndSave(){
        editor = new modules[moduleName]('element', {itemId: 'itemId'}, errorCallback);
        editor.save(onSaved);
      }

      it('calls getData', function(){
        initAndSave();
        expect(instance.send).toHaveBeenCalledWith('getData', jasmine.any(Function));
      });
      
      it('calls $.ajax', function(){
        initAndSave();
        var expected = {type: 'GET', 
        url: saveKey, 
        contentType: 'application/json', 
        data: '{"singleComponent":{"componentType":"type"}}', 
        success: jasmine.any(Function), 
        error: jasmine.any(Function), 
        dataType: 'json' };
        expect($.ajax).toHaveBeenCalledWith(expected);
      });
      
      it('calls callback with result', function(){
        initAndSave();
        expect(onSaved).toHaveBeenCalledWith({
          error: null, 
          result: data[saveKey + '.success']
        });
      });
      
      describe('when save fails', function(){

        beforeEach(function(){
          data[saveKey + '.error'] = {
            responseJSON: {
              error: 'error'}
            };
        });

        it('calls callback with error', function(){
          initAndSave();
          expect(onSaved).toHaveBeenCalledWith({error: 'error', result: undefined});
        });
      }); 
    });
  } 

  describe('item', function(){

    var item;

    beforeEach(function(){

      launcher.loadCall.and.returnValue({
        method: 'GET', url: 'item'
      }); 

      Def = modules.Item;
      
      $.ajax = jasmine.createSpy('ajax').and.callFake(function(opts){
        opts.success({components: {singleComponent: {}}});
      });
    });

    describe('init', function(){

      it('calls errorCallback if createItem fails', function(){
        $.ajax.and.callFake(ajaxFail.bind(this, 'create failed'));
        item = new Def('element', {}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.CREATE_ITEM_FAILED('create failed'));
      });

      it('calls errorCallback if load item fails', function(){
        $.ajax.and.callFake(ajaxFail.bind(this, 'load failed'));
        item = new Def('element', {itemId: 'itemId'}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.LOAD_ITEM_FAILED('load failed'));
      });
    });
    
    it('calls errorCallback if item has no compoents', function(){
      $.ajax.and.callFake(function(opts){
        opts.success({components: {}});
      });
      item = new Def('element', {itemId: 'itemId'}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.ONLY_ONE_COMPONENT_ALLOWED);
    });

    it('calls errorCallback if item has more than one component', function(){
      $.ajax.and.callFake(function(opts){
        opts.success({components: { 1: {}, 2: {}}});
      });
      item = new Def('element', {itemId: 'itemId'}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.ONLY_ONE_COMPONENT_ALLOWED);
    });

    it('calls launcher.loadInstance', function(){
      item = new Def('element', {itemId: 'itemId'}, errorCallback);

      expect(launcher.loadInstance).toHaveBeenCalledWith(
        {method: 'GET', url: 'item'},
        jasmine.any(Object),
        {
          previewMode: 'tabs',
          previewWidth: undefined,
          activePane: 'config', 
          showNavigation: false, 
          uploadUrl: 'item',
          uploadMethod: 'GET', 
          xhtml: undefined, 
          componentModel: {}
        }, 
        jasmine.any(Function));
    });
    
    assertSave('Item');

  });

  describe('draft', function(){
    var draft;

    beforeEach(function(){

      launcher.loadCall.and.returnValue({
        method: 'GET', url: 'draft'
      }); 

      Def = modules.Draft;
      
      $.ajax = jasmine.createSpy('$.ajax').and.callFake(function(opts){
        opts.success({components: { 1: {}}});
      });
    });

    describe('init', function(){
      it('calls errorCallback if createItemAndDraft fails', function(){
        $.ajax.and.callFake(ajaxFail.bind(this, 'create failed'));
        draft = new Def('element', {}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.CREATE_ITEM_AND_DRAFT_FAILED('create failed'));
      });
      
      it('calls errorCallback if loadDraft fails', function(){
        $.ajax.and.callFake(ajaxFail.bind(this, 'load draft failed'));
        draft = new Def('element', {itemId: 'itemId'}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.LOAD_DRAFT_FAILED('load draft failed'));
      });

      it('calls launcher.loadInstance', function(){

        draft = new Def('element', {itemId: 'itemId'}, errorCallback);

        expect(launcher.loadInstance).toHaveBeenCalledWith(
          {method: 'GET', url: 'draft'},
          jasmine.any(Object),
          {previewMode: 'tabs',
          previewWidth: undefined,
          activePane: 'config', 
          showNavigation: false, 
          uploadUrl: 'draft', 
          uploadMethod: 'GET',
          xhtml: undefined, 
          componentModel: {}}, 
          jasmine.any(Function));
      });

    });

    assertSave('Draft');

    describe('commitDraft', function(){

      var draftHelper;
      
      beforeEach(function(){

        draftHelper = {
          xhrCommitDraft: jasmine.createSpy('xhrCommitDraft')
        };

        corespring.mock.modules.draft = draftHelper;

        $.ajax.and.callFake(function(opts){
          opts.success({components: {singleComponent: {}}});
        });
        
        draft = new Def('element', {itemId: 'itemId'}, errorCallback);
        
        spyOn(draft, 'save').and.callFake(function(done){
          done({});
        });
      });

      it('calls save', function(){
        draft.commitDraft(false, jasmine.createSpy('onDone'));
        expect(draft.save).toHaveBeenCalled();
      });
      
      it('calls draft.xhrCommitDraft', function(){
        draft.commitDraft(false, jasmine.createSpy('onDone'));
        expect(draftHelper.xhrCommitDraft).toHaveBeenCalledWith('GET', 'draft?params={"force":false}', jasmine.any(Object), jasmine.any(Function));
      });
      
      it('calls done', function(){
        draftHelper.xhrCommitDraft.and.callFake(function(method, url, draftId, done){
          done(null, {success: true});
        });
        var done = jasmine.createSpy('onDone');
        draft.commitDraft(false, done);
        expect(done).toHaveBeenCalledWith(null, {success: true});
      });

      it('calls done with error', function(){
        draftHelper.xhrCommitDraft.and.callFake(function(method, url, draftId, done){
          done('error');
        });
        var done = jasmine.createSpy('onDone');
        draft.commitDraft(false, done);
        expect(done).toHaveBeenCalledWith('error');
      });
    });
  });
});
