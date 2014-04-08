describe('supporting materials service', function(){

  var supportingMaterialsService = null;

  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(inject(function(SupportingMaterialsService) {
    supportingMaterialsService = SupportingMaterialsService;
  }));


  var item = {
    supportingMaterials: [
      {
        "name": "Custom Rubric",
        "materialType" : "Rubric",
        "files" : [
          {
            "_t" : "org.corespring.platform.core.models.item.resource.VirtualFile",
            "name" : "index.html",
            "contentType" : "text/html",
            "content" : "<h1>Sample Rubric</h1><br/><p>This is a rubric for scoring this item.</p>",
            "isMain" : true
          }
        ]
      },
      {
        "name" : "Student Work Example",
        "materialType" : "Student Work",
        "files" : [
          {
            "_t" : "org.corespring.platform.core.models.item.resource.VirtualFile",
            "name" : "student-work.pdf",
            "contentType" : "application/pdf",
            "isMain" : true
          }
        ]
      }
    ]
  };

  it('should init', function(){
    expect(supportingMaterialsService).toNotBe(null);
  });

  describe('getSupportingMaterial', function() {
    it('should return main file at index', function() {
      expect(supportingMaterialsService.getSupportingMaterial(item, 0)).toEqual(
        _.find(item.supportingMaterials[0].files, function(file) { return file.isMain === true; }));
    });
  });

  describe('getSupportingUrl', function() {
    it('should return trusted URL for supporting material', function() {
      var supportingMaterial =
        _.find(item.supportingMaterials[0].files, function(file) { return file.isMain === true; });
      expect(supportingMaterialsService.getSupportingUrl(item, 0).$$unwrapTrustedValue()).toEqual(
        item.supportingMaterials[0].name + "/" + supportingMaterial.name);
    });
  });

  describe('getContentType', function() {
    it('should return the contentType for the supporting material', function() {
      var supportingMaterial =
        _.find(item.supportingMaterials[0].files, function(file) { return file.isMain === true; });
      expect(supportingMaterialsService.getContentType(item, 0)).toEqual(supportingMaterial.contentType);
    });
  });

  describe('previewable', function() {
    it('should return false for text/html', function() {
      expect(supportingMaterialsService.previewable(item, 0)).toBe(false);
    });
    it('should return true for application/pdf', function() {
      expect(supportingMaterialsService.previewable(item, 1)).toBe(true);
    });
  });

});

