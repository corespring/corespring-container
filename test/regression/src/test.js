/* global browser, baseUrl */

var expect = require('chai').expect;

describe('corespring-container', function() {

  beforeEach(function() {
    browser
      .url('')
      .waitFor('.logo', 2000);
  });


  it('does have link to create an item', function(done) {
    browser
      .isVisible('a[href="/createItem"]', function(err, result) {
        expect(result).to.be.null;
      })
      .call(done);

  });

});
