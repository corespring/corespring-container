describe('model saver', function() {

  beforeEach(angular.mock.module('corespring-editor.directives'));

  var rootScope, compile;

  beforeEach(inject(function($compile, $rootScope) {
    rootScope = $rootScope.$new();
    compile = $compile;
  }));

  it('should init', function() {
    var elem = compile("<model-saver/>")(rootScope);
    expect(elem).toNotBe(null);
  });

  it('should init', function() {

    var configured = [
      '<model-saver saving="saving">',
      '  <div id="save-in-progress">Saving!</div>',
      '  <div id="saved">Saved!</div>',
      '  <div id="save-error">Save Error!</div>',
      '</model-saver>'
    ].join('\n');

    rootScope.saving = false;

    var div = $('<div>');

    div.html(configured);
    $('body').append(div);
    var childScope = rootScope.$new();
    var elem = compile(div)(childScope);
    childScope.saving = true;
    childScope.$apply();

    console.log(elem.html());
    expect($('#save-in-progress').attr('class')).toEqual('');
    expect($('#saved').attr('class')).toEqual('ng-hide');
    expect($('#save-error').attr('class')).toEqual('ng-hide');

    childScope.saving = false;
    childScope.$apply();

    function assertClass(id, val) {
      return $(id).attr('class') === val;
    }

    expect(assertClass('#save-in-progress', 'ng-hide')).toBe(true);
    expect(assertClass('#saved', '')).toBe(true);
    expect(assertClass('#save-error', 'ng-hide')).toBe(true);

    childScope.saveError = {};
    childScope.$apply();

    expect(assertClass('#save-error', '')).toBe(true);

    div.remove();
  });
});