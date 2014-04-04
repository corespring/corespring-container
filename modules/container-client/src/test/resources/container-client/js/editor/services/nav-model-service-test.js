describe('nav model service', function(){

  var sut = null;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(inject(function (NavModelService) {
    sut = NavModelService;
  }));

  it('should init', function(){
    expect(sut).toNotBe(null);
  });

});

