var expect = require('chai').expect;
var assert = require('chai').assert;

describe('corespring-container', function() {

  it('does have link to create an item', function(done) {
    browser
      .url(regressionTestRunnerGlobals.getUrl(""))
      .isVisible('a[href="/create-item"]', function(err, result) {
        assert.isUndefined(err, "Unexpected error " + JSON.stringify(err) + " at url <" + regressionTestRunnerGlobals.getUrl("") + ">");
        expect(result).not.to.be.null;
      })
      .call(done);
  });

});
