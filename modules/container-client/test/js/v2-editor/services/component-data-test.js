describe('component data', function() {

  var componentData;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(function() {
    module(function($provide) {
    });
  });

  beforeEach(inject(function(ComponentData) {
    componentData = ComponentData;
  }));

  it('should init', function() {
    expect(componentData).toNotBe(null);
  });
});