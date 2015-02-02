describe('mathformat-utils', function(){

  var util;

  beforeEach(angular.mock.module('corespring.wiggi-wiz-features.mathjax'));
  
  beforeEach(inject(function(MathFormatUtils) {
    util = MathFormatUtils; 
  }));

  describe('getMathInfo', function(){

    it('detects math', function(){
      expect(util.getMathInfo('<math>')).toEqual({ mathType: 'MathML', errors: true, displayMode: 'block' });
    });
  });
});