describe('csimage feature', function(){

  var imageFeature, addQueryParams;

  beforeEach(angular.mock.module('corespring-editing.wiggi-wiz-features.cs-image'));

  beforeEach(module(function($provide){
    $provide.value('$document', {});
    $provide.value('Image', jasmine.createSpy('Image'));
    $provide.value('TemplateUtils', {});

    addQueryParams = jasmine.createSpy('addQueryParams')
        .and.callFake(function(src){
          return src;
    });

    $provide.value('QueryParamUtils', {
      addQueryParams: addQueryParams
    });
  }));

  beforeEach(inject(function(ImageFeature) {
    imageFeature = ImageFeature;
  }));

  describe('getMarkup', function(){

    var $node, $scope;

    beforeEach(function(){
      $node = $('<div style="color:red;"><img style="color:blue;" blah="blah" src="img.jpg?a=b"></img></div>');
      $scope = {};
    });

    it('exports markup for rendering', function(){
      var out = imageFeature.getMarkUp($node, $scope);
      console.log('out: ', out);
      expect(out).toEqual('<div style="color:red;"><img style="color:blue;" src="img.jpg"></img></div>');
    });
  });

  describe('initialise', function(){

    var out, $node, replaceWith;
    
    beforeEach(function(){
      $node = $('<div style="color:red;"><img style="color:blue;" src="img.jpg"></img></div>');
      replaceWith = jasmine.createSpy('replaceWith').and.callFake(function($node){
        return $node;
      });
      out = imageFeature.initialise($node, replaceWith);
    });
    
    it('calls replaceWith', function(){
      expect(replaceWith).toHaveBeenCalled();
    });
    
    it('calls QueryParamUtils.addQueryParams',  function(){
      expect(addQueryParams).toHaveBeenCalledWith('img.jpg');
    });

    it('converts the incoming node to an image format for the editor', function(){
      var $expected = $('<div style="color:red; image-holder image-src="img.jpg" image-style="color:blue;"></div>');
      expect(out.html()).toEqual($expected.html());
    });
  });

});