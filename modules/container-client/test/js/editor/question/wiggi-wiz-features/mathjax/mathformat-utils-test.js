describe('mathformat-utils', function(){

  var util;

  beforeEach(angular.mock.module('corespring-editing.wiggi-wiz-features.mathjax'));
  
  beforeEach(inject(function(MathFormatUtils) {
    util = MathFormatUtils; 
  }));

  describe('getMathInfo', function(){

    it('detects MathML', function(){
      expect(util.getMathInfo('<math></math>')).toEqual({ mathType: 'MathML', errors: false, displayMode: 'block' });
    });
    
    it('detects LaTex inline', function(){
      expect(util.getMathInfo('\\(1 == 3\\)')).toEqual({ mathType: 'LaTex', errors: undefined, displayMode: 'inline' });
    });

    it('detects LaTex block', function(){
      expect(util.getMathInfo('\\[1 == 3\\]')).toEqual({ mathType: 'LaTex', errors: undefined, displayMode: 'block' });
    });
  });

  describe('unwrapLatex', function(){
    it('unwraps block', function(){
      expect(util.unwrapLatex('\\[1 == 3\\]')).toEqual('1 == 3');
    });
    
    it('unwraps inline', function(){
      expect(util.unwrapLatex('\\(1 == 3\\)')).toEqual('1 == 3');
    });
  });
  
  describe('wrapLatex', function(){

    it('wraps inline by default', function(){
      expect(util.wrapLatex('1 == 3')).toEqual('\\(1 == 3\\)');
    });

    it('wraps inline', function(){
      expect(util.wrapLatex('1 == 3', 'inline')).toEqual('\\(1 == 3\\)');
    });
    
    it('wraps block', function(){
      expect(util.wrapLatex('1 == 3', 'block')).toEqual('\\[1 == 3\\]');
    });

  });
});