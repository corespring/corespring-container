describe('editor config', function() {

  var editorConfig, designerService,componentDefaultData;

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editor.services'));
  beforeEach(angular.mock.module('corespring-player.services'));

  function MockDesignerService() {
    this.loadAvailableUiComponentsResult = {
      interactions: [],
      widgets: [
        {componentType:'corespring-video', defaultData:'corespring-video default data'},
        {componentType:'corespring-calculator', defaultData:'corespring-calculator default data'},
        {componentType:'corespring-protractor', defaultData:'corespring-protractor default data'},
        {componentType:'corespring-ruler', defaultData:'corespring-ruler default data'},
      ]
    };

    this.loadAvailableUiComponents = function(onSuccess, onError) {
      onSuccess(_.cloneDeep(this.loadAvailableUiComponentsResult));
    };
  }

  beforeEach(module(function($provide) {
    designerService = new MockDesignerService();
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
    expect(componentDefaultData.getDefaultData('corespring-calculator')).toEqual('corespring-calculator default data');
    expect(componentDefaultData.getDefaultData('corespring-protractor')).toEqual('corespring-protractor default data');
    expect(componentDefaultData.getDefaultData('corespring-ruler')).toEqual('corespring-ruler default data');
  });

});