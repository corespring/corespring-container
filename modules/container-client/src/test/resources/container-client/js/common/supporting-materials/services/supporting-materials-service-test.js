describe('supporting materials service', function() {

  var supportingMaterialsService = null;

  beforeEach(angular.mock.module('corespring-common.supporting-materials.services'));

  beforeEach(inject(function(SupportingMaterialsService) {
    supportingMaterialsService = SupportingMaterialsService;
  }));


  var supportingMaterials = [{
    "name": "Custom Rubric",
    "materialType": "Rubric",
    "files": [{
      "_t": "org.corespring.platform.core.models.item.resource.VirtualFile",
      "name": "index.html",
      "contentType": "text/html",
      "content": "<h1>Sample Rubric</h1><br/><p>This is a rubric for scoring this item.</p>",
      "default": true
    }]
  }, {
    "name": "Student Work Example",
    "materialType": "Student Work",
    "files": [{
      "_t": "org.corespring.platform.core.models.item.resource.VirtualFile",
      "name": "student-work.pdf",
      "contentType": "application/pdf",
      "default": true
    }]
  }];


  it('should init', function() {
    expect(supportingMaterialsService).toNotBe(null);
  });

  describe('getSupportingMaterial', function() {
    it('should return main file at index', function() {
      expect(supportingMaterialsService.getSupportingMaterialFile(supportingMaterials, 0)).toEqual(
        _.find(supportingMaterials[0].files, function(file) {
          return file.default === true;
        }));
    });
  });

  describe('getSupportingUrl', function() {
    it('should return trusted URL for supporting material', function() {
      var supportingMaterial =
        _.find(supportingMaterials[0].files, function(file) {
          return file.default === true;
        });
      expect(supportingMaterialsService.getSupportingUrl(supportingMaterials, 0).$$unwrapTrustedValue()).toEqual(
        supportingMaterials[0].id + "/" + supportingMaterial.name);
    });
  });

  describe('getContentType', function() {
    it('should return the contentType for the supporting material', function() {
      var supportingMaterial =
        _.find(supportingMaterials[0].files, function(file) {
          return file.default === true;
        });
      expect(supportingMaterialsService.getContentType(supportingMaterials, 0)).toEqual(supportingMaterial.contentType);
    });
  });

  describe('previewable', function() {
    it('should return true for text/html', function() {
      expect(supportingMaterialsService.previewable(supportingMaterials, 0)).toBe(true);
    });
    it('should return true for application/pdf', function() {
      expect(supportingMaterialsService.previewable(supportingMaterials, 1)).toBe(true);
    });
  });

});