describe('sm-utils', function() {


  var utils;

  beforeEach(angular.mock.module('corespring-common.supporting-materials.services'));

  beforeEach(inject(function(SmUtils) {
    utils = SmUtils;
  }));


  var supportingMaterials = [{
    name: 'Custom Rubric',
    materialType: 'Rubric',
    files: [{
      _t: 'org.corespring.platform.core.models.item.resource.VirtualFile',
      name: 'index.html',
      contentType: 'text/html',
      content: '<h1>Sample Rubric</h1><br/><p>This is a rubric for scoring this item.</p>',
      isMain: true
    }]
  }, {
    name: 'Student Work Example',
    materialType: 'Student Work',
    files: [{
      _t: 'org.corespring.platform.core.models.item.resource.VirtualFile',
      name: 'student-work.pdf',
      contentType: 'application/pdf',
      isMain: true
    }]
  }];

  describe('group', function(){

    it('groups by key', function(){
      var out = utils.group(supportingMaterials, 'materialType');
      console.log(out);
      expect(out.length).toEqual(2);
    });
  });

});