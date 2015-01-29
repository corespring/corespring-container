describe('editor dialog template', function() {

  var dialogTemplate;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(inject(function(EditorDialogTemplate) {
    dialogTemplate = EditorDialogTemplate;

    dialogTemplate.header = function(title){ return 'header: ' + title;};
    dialogTemplate.footer = function(){ return 'footer';};
  }));

  it('should generate a template', function() {

    var out = dialogTemplate.generate('title', 'content', 'header', 'footer');

    var expected = [
      'header',
      '<div class="modal-body">',
      'content',
      '</div>',
      'footer'
    ].join('\n');

    expect(out).toEqual(expected);
  });


});