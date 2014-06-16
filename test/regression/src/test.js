/* global browser */

var expect = require('chai').expect;

describe('corespring-container', function() {

  beforeEach(function() {
    browser
      .url(browser.options.testParams.baseUrl)
      .waitFor('.logo', 2000);
  });


  it('does have link to create an item', function(done) {
    browser
      .isVisible('a[href="/create-item"]', function(err, result) {
        if(err) throw(err);
        expect(result).not.to.be.null;
      })
      .call(done);

  });

});
