describe('math format utils', function() {

  var utils;

  beforeEach(angular.mock.module('corespring.wiggi-wiz-features'));

  beforeEach(inject(function(MathFormatUtils) {
    utils = MathFormatUtils;
  }));

  describe('formatting', function() {
    it('should init', function() {
      expect(utils).toNotBe(null);
    });

    //Note: can't test this in Phantom (works in Chrome) - disabled until the issue is resolved
    //See: https://github.com/ariya/phantomjs/issues/10428
    xit('should return unknown', function() {
      expect(utils.getMathInfo('<math></ath>')).toEqual({
        mathType: 'MathML',
        displayMode: 'block',
        errors: true
      });
    });

    it('should return info for MathML', function() {
      expect(utils.getMathInfo('<math></math>')).toEqual({
        mathType: 'MathML',
        errors: false,
        displayMode: 'block'
      });
    });

    it('should return info for MathML', function() {
      expect(utils.getMathInfo('<math display="block">\r\n<blah/></math>')).toEqual({
        mathType: 'MathML',
        errors: false,
        displayMode: 'block'
      });
    });

    it('should return info for block LaTex', function() {
      expect(utils.getMathInfo('\\[\\frac13\\]')).toEqual({
        mathType: 'LaTex',
        displayMode: 'block',
        errors: undefined
      });
    });

    it('should return info for inline LaTex', function() {
      expect(utils.getMathInfo('\\(\\frac13\\)')).toEqual({
        mathType: 'LaTex',
        displayMode: 'inline',
        errors: undefined
      });
    });
  });
});