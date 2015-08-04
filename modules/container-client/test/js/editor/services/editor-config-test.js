describe('editor config', function() {

  var editorConfig, designerService,componentDefaultData;

  var MathJaxService = {};
  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editor.services'));
  beforeEach(angular.mock.module('corespring-player.services'));

  function MockDesignerService() {
    this.loadAvailableUiComponentsResult = {
      interactions: [],
      widgets: [{componentType:'corespring-video', defaultData:'corespring-video default data'}]
    };

    this.loadAvailableUiComponents = function(onSuccess, onError) {
      onSuccess(_.cloneDeep(this.loadAvailableUiComponentsResult));
    };
  }

  beforeEach(module(function($provide) {
    designerService = new MockDesignerService();
    $provide.value('MathJaxService', MathJaxService);
    $provide.value('DesignerService', designerService);
    $provide.value('ImageFeature', {});
    $provide.value('ItemUrls', {});
    $provide.value('WiggiFootnotesFeatureDef', function(){});
    $provide.value('WiggiLinkFeatureDef', function(){});
    $provide.value('WiggiMathJaxFeatureDef', function(){});
  }));

  beforeEach(inject(function(EditorConfig, ComponentDefaultData) {
    editorConfig = EditorConfig;
    componentDefaultData = ComponentDefaultData;
  }));

  it('should load', function(){
    expect(editorConfig).toBeDefined();
    expect(editorConfig).not.toBe(null);
  });

  it('should store the default data', function(){
    expect(componentDefaultData.getDefaultData('corespring-video')).toEqual('corespring-video default data');
  });

});