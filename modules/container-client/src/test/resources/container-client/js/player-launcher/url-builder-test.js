describe('instance', function() {

  var urlBuilder;

  beforeEach(function() {
    var Def = new corespring.require("url-builder");
    urlBuilder = new Def();
  });

  it('should work', function() {
    expect(urlBuilder.build('blah', {
      a: 'a'
    })).toEqual('blah?a=a');
  });

  it('should work', function() {
    expect(urlBuilder.build('blah?c=z', {
      a: 'a',
      b: 'b',
      c: 'c'
    })).toEqual('blah?c=z&a=a&b=b&c=c');
  });
});