var expect = require('chai').expect;

describe('corespring-container', function() {

  it('does have link to create an item', function(done) {
    browser
      .url(corespringRegressionTest.getUrl("/"))
      .isVisible('a[href="/create-item"]', function(err, result) {
        expect(err).to.be.null;
        expect(result).not.to.be.null;
      })
      .call(done);
  });

});
