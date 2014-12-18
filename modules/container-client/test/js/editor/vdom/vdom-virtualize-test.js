//vdom-virtualize-test.js
describe('vdom-virtualize', function(){

  it('retains src for img', function(){
    var image = document.createElement('img');
    image.setAttribute('src', 'some-img.png');

    var virtualDom = vdomVirtualize(image); //jshint ignore:line
    expect(virtualDom.properties.src).toBe("some-img.png");
  });
});