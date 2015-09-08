describe('draft-editor', function() {

  var mockLauncher, mockInstance;
  var errorCodes = corespring.require('error-codes');
  var onError, editor, DraftEditor;

  beforeEach(function() {

    $.ajax = jasmine.createSpy('$.ajax');

    console.log('new launcher and instance..');
    mockInstance = new org.corespring.mocks.launcher.MockInstance();
    var MockLauncher = org.corespring.mocks.launcher.MockLauncher(mockInstance);
    mockLauncher = new MockLauncher();

    corespring.mock.modules['client-launcher'] = function() {
      return mockLauncher;
    };
    onError = jasmine.createSpy('onError');
    DraftEditor = new corespring.require('draft-editor');

  });

  afterEach(function() {
    corespring.mock.reset();
    $.ajax.calls.reset();
  });


  describe('constructor', function() {

    it('calls launcher.init', function() {
      var editor = new DraftEditor('element', {iframe: { contentWindow: {}}}, onError);
      expect(mockLauncher.init).toHaveBeenCalled();
    });


    describe('loadDraftItem', function() {
      it('calls loadCall(editor)', function() {
        var editor = new DraftEditor('element', {
          itemId: 'itemId',
          iframe: { contentWindow: {} }
        }, onError);
        
        expect(mockLauncher.loadCall).toHaveBeenCalledWith('draftEditor.editor', jasmine.any(Function));
      });

      it('calls loadCall(devEditor)', function() {
        var editor = new DraftEditor('element', {
          itemId: 'itemId',
          devEditor: true,
          iframe: { contentWindow: {} }
        }, onError);
        expect(mockLauncher.loadCall).toHaveBeenCalledWith('draftEditor.devEditor', jasmine.any(Function));
      });

      it('triggers an error if there is no call found', function() {
        mockLauncher.loadCall.and.returnValue(null);
        var editor = new DraftEditor('element', {
          itemId: 'itemId',
          iframe: { contentWindow: {} }
        }, onError);
        expect(onError).toHaveBeenCalled();
      });

      describe('loadInstance', function() {

        function assertLoadInstance(opts, cb) {
          opts.iframe = { contentWindow: {} };
          return function() {
            var call = {
              method: 'GET',
              url: '/url'
            };
            mockLauncher.loadCall.and.returnValue(call);
            mockLauncher.loadInstance.and.callFake(function(call, params,
              initData, onReady) {
              onReady(mockInstance);
            });
            _.assign(opts, {
              itemId: 'itemId'
            });
            var editor = new DraftEditor('element', opts, onError);
            cb(call, opts);
          };
        }

        it('calls loadInstance with hash /supporting-materials/0',
          assertLoadInstance({
              selectedTab: 'supporting-materials'
            },
            function(call) {
              expect(mockLauncher.loadInstance).toHaveBeenCalledWith({
                  method: 'GET',
                  url: '/url',
                  hash: '/supporting-materials'
                },
                undefined, {},
                jasmine.any(Function));
            }));

        it('calls loadInstance with hash /profile', assertLoadInstance({
            selectedTab: 'profile'
          },
          function(call) {
            expect(mockLauncher.loadInstance).toHaveBeenCalledWith({
                method: 'GET',
                url: '/url',
                hash: '/profile'
              },
              undefined,
              jasmine.any(Object),
              jasmine.any(Function));
          }));

        it('calls loadInstance with profileConfig', assertLoadInstance({
            profileConfig: {
              profile: 'profile'
            }
          },
          function(call) {
            expect(mockLauncher.loadInstance).toHaveBeenCalledWith(
              jasmine.any(Object),
              undefined, {
                profileConfig: {
                  profile: 'profile'
                }
              },
              jasmine.any(Function));
          }));

        it('calls loadInstance with showSaveMessage', assertLoadInstance({
            showSaveMessage: true
          },
          function(call) {
            expect(mockLauncher.loadInstance).toHaveBeenCalledWith(
              jasmine.any(Object),
              undefined,
              { showSaveMessage: true },
              jasmine.any(Function));
          }));

        it('calls loadInstance with queryParams', assertLoadInstance({
            queryParams: {
              a: 'a'
            }
          },
          function(call) {
            expect(mockLauncher.loadInstance).toHaveBeenCalledWith(
              jasmine.any(Object), {
                a: 'a'
              },
              jasmine.any(Object),
              jasmine.any(Function));
          }));

        it(
          'loadInstance.onReady handler calls instance.css when loading devEditor',
          assertLoadInstance({
              devEditor: true
            },
            function(call) {
              expect(mockInstance.css).toHaveBeenCalledWith('height', '100%');
            }));

        it(
          'loadInstance.onReady handler does not call instance.css when loading devEditor',
          assertLoadInstance({
              devEditor: false
            },
            function(call) {
              expect(mockInstance.css).not.toHaveBeenCalled();
            }));

        it('loadInstance.onReady handler calls onDraftLoaded',
          assertLoadInstance({
              onDraftLoaded: jasmine.createSpy('onDraftLoaded'),
              itemId: 'itemId'
            },
            function(call, opts) {
              expect(opts.onDraftLoaded).toHaveBeenCalledWith('itemId',
                jasmine.any(String));
            }));
      });
    });

    describe('createItemAndDraft', function() {

      it('calls launcher.loadCall(createItemAndDraft)', function() {
        var editor = new DraftEditor('element', {}, function() {});
        
        expect(mockLauncher.loadCall).toHaveBeenCalledWith(
          'draftEditor.createItemAndDraft');
      });

      it('calls $.ajax', function() {
        mockLauncher.loadCall.and.returnValue({
          method: 'GET',
          url: 'createItemAndSession'
        });
        var editor = new DraftEditor('element', {}, function() {});
        
        expect($.ajax).toHaveBeenCalledWith({
          type: 'GET',
          url: 'createItemAndSession',
          data: {
            draftName: jasmine.any(String)
          },
          success: jasmine.any(Function),
          error: jasmine.any(Function),
          dataType: 'json'
        });
      });

      it('calls errorCallback when an $.ajax error occurs', function() {
        mockLauncher.loadCall.and.returnValue({
          method: 'GET',
          url: 'createItemAndSession'
        });
        $.ajax.and.callFake(function(opts) {
          opts.error({
            responseJSON: {
              error: 'e'
            }
          });
        });

        var editor = new DraftEditor('element', {}, onError);
        
        expect(onError).toHaveBeenCalledWith({
          code: 113,
          msg: 'e'
        });
      });

      describe('when there is a createItemAndSesson ajax call', function() {

        var opts;

        beforeEach(function() {
          mockLauncher.loadCall.and.returnValue({
            method: 'GET',
            url: 'createItemAndSession'
          });
          $.ajax.and.callFake(function(opts) {
            opts.success({
              itemId: 'itemId',
              draftName: 'draftName'
            });
          });

          opts = {
            onItemCreated: jasmine.createSpy('onItemCreated'),
            onDraftCreated: jasmine.createSpy('onDraftCreated'),
            iframe: {contentWindow: {}}
          };
          var editor = new DraftEditor('element', opts, onError);
          
        });

        it('calls options.onItemCreated when $.ajax is successful',
          function() {
            expect(opts.onItemCreated).toHaveBeenCalledWith('itemId');
          });

        it('calls options.onDraftCreated when $.ajax is successful',
          function() {
            expect(opts.onDraftCreated).toHaveBeenCalledWith('itemId',
              'draftName');
          });

        it('calls launcher.loadCall', function() {
          expect(mockLauncher.loadCall).toHaveBeenCalledWith('draftEditor.editor',
            jasmine.any(Function));
        });

        it('calls launcher.loadInstance', function() {
          expect(mockLauncher.loadInstance).toHaveBeenCalled();
        });

      });

    });


  });

  describe('commitDraft', function() {

    it('calls commitDraft endpoint', function() {

      $.ajax.and.callFake(function(opts) {
          opts.success({});
        });

      var editor = new DraftEditor('element', {}, onError);
      
      var cb = jasmine.createSpy('cb');
      editor.commitDraft(false, cb);
      expect($.ajax).toHaveBeenCalledWith({
        type: 'GET',
        url: 'draftEditor.createItemAndDraft',
        data: {
          draftName: jasmine.any(String)
        },
        success: jasmine.any(Function),
        error: jasmine.any(Function),
        dataType: 'json'
      });
    });

    it('calls callback with err if the commitDraft endpoint returns an error', function() {
      
      mockInstance.send.and.callFake(function(e, cb){
        cb(null);
      });
      var editor = new DraftEditor('element', {itemId: 'itemId'}, onError);

      $.ajax.and.callFake(function(opts) {
        opts.error({
          responseJSON: {
            error: 'failed'
          }
        });
      });
      var cb = jasmine.createSpy('cb');
      editor.commitDraft(false, cb);
      expect(cb).toHaveBeenCalledWith(errorCodes.COMMIT_DRAFT_FAILED('failed'));
    });

    it('calls callback with no err if the commitDraft endpoint returns success', function() {
      
      mockInstance.send.and.callFake(function(e, cb){
        cb(null);
      });

      var editor = new DraftEditor('element', {itemId: 'itemId'}, onError);
      
      $.ajax.and.callFake(function(opts) {
        opts.success();
      });
      var cb = jasmine.createSpy('cb');
      editor.commitDraft(false, cb);
      expect(cb).toHaveBeenCalledWith(null);
    });
  });
});
