describe('component config', function() {

  var config;

  beforeEach(angular.mock.module('corespring-editor.services'));

  function mockDesignerService() {

    this.loadAvailableUiComponents = function(onSuccess) {
      onSuccess({
        interactions: [{
          componentType: "one",
          configuration: {
            "corespring-editor": {
              "placeholder-show-tooltip": true
            }
          }
        }, {
          componentType: "two",
        }]
      });
    };
  }

  beforeEach(function() {
    module(function($provide) {
      $provide.value('DesignerService', new mockDesignerService());
    });
  });

  beforeEach(inject(function(ComponentConfig) {
    config = ComponentConfig;
  }));

  it('should init', function() {
    expect(config).not.toBe(null);
  });

  it('should return showTooltip', function() {
    expect(config.showTooltip("one")).toBeTruthy();
    expect(config.showTooltip("two")).not.toBeTruthy();
  });
});
