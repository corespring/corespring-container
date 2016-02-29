describe('component default data', function() {

  var componentDefaultData;

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('corespring-editing.services'));

  beforeEach(module(function($provide){
  }));

  beforeEach(inject(function(ComponentDefaultData) {
    componentDefaultData = ComponentDefaultData;
  }));

  it('should init', function() {
    expect(componentDefaultData).not.toBe(null);
    expect(componentDefaultData).toBeDefined();
  });

  it('should allow to set/retrieve data', function() {
    componentDefaultData.setDefaultData('some-id', {content:'some data'});
    var defaultData = componentDefaultData.getDefaultData('some-id');
    expect(defaultData).toEqual({content:'some data'});
  });

  it('should allow to retrieve nested data', function() {
    componentDefaultData.setDefaultData('some-id', {level1:{level2:{data:'this is it'}}});
    var defaultData = componentDefaultData.getDefaultData('some-id', 'level1.level2.data');
    expect(defaultData).toEqual('this is it');
  });

  it('should throw exception if data does not exist', function() {
    componentDefaultData.setDefaultData('some-id', {level1:{level2:{data:'this is it'}}});
    var defaultData = componentDefaultData.getDefaultData('other-id', 'level1.level2.data');
    expect(defaultData).toEqual({});
  });


});