//vdom-virtualize-test.js
describe('vdom-virtualize', function(){


  function stringToElement(s){
    var parser = new DOMParser();
    var doc = parser.parseFromString(s, 'text/html');
    var errors = doc.querySelectorAll('parsererror');

    if(errors.length === 0){
      return doc.body.childNodes[0]; 
    }
  }

  it('retains src for img', function(){
    var element = stringToElement('<img class="tmp-image" src="some-img.png"></img>');
    var virtualDom = vdomVirtualize(element); //jshint ignore:line
    expect(virtualDom.properties.src).toBe("some-img.png");
  });
});