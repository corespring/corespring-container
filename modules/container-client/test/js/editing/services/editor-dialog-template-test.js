describe('editor dialog template', function() {

  var dialogTemplate;

  beforeEach(angular.mock.module('corespring-editing.services'));

  beforeEach(inject(function(EditorDialogTemplate) {
    dialogTemplate = EditorDialogTemplate;

    dialogTemplate.header = function(title){ return 'default-header: ' + title;};
    dialogTemplate.footer = function(){ return 'default-footer';};
  }));

  it('should generate a template using the header and footer params', function() {

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

  it('should generate a template with an empty header and footer', function() {

    var out = dialogTemplate.generate('title', 'content', '', '');

    var expected = [
      '',
      '<div class="modal-body">',
      'content',
      '</div>',
      ''
    ].join('\n');

    expect(out).toEqual(expected);
  });

  it('should generate a template using the default header and footer', function() {

    var out = dialogTemplate.generate('title', 'content');

    var expected = [
      'default-header: title',
      '<div class="modal-body">',
      'content',
      '</div>',
      'default-footer'
    ].join('\n');

    expect(out).toEqual(expected);
  });


});