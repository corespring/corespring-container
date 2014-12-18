//vdom-virtualize-test.js
describe('vdom-virtualize', function(){

  it('retains src for img', function(){
    var image = document.createElement('img');
    image.setAttribute('src', 'some-img.png');

    var virtualDom = vdomVirtualize(image); //jshint ignore:line
    expect(virtualDom.properties.src).toBe("some-img.png");
  });

  it('propogates custom attributes', function(){
    var div = document.createElement('div');
    div.setAttribute('footnote', '');
    div.setAttribute('another-footnote', 'apple');
    var virtualDom = vdomVirtualize(div); //jshint ignore:line
    expect(virtualDom.properties.footnote).toBe('');
    expect(virtualDom.properties['another-footnote']).toBe('apple');

  });

  it('creates a clean properties object', function(){
    var div = document.createElement('div');
    div.setAttribute('name', 'test');
    var virtualDom = vdomVirtualize(div); //jshint ignore:line
    expect(virtualDom.properties).toEqual({name: 'test'});
  });
});
