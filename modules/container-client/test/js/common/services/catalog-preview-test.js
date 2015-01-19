describe('CatalogPreview', function() {

  var catalogPreview, modal;

  beforeEach(angular.mock.module('corespring-common.services'));
  beforeEach(angular.mock.module('ui.bootstrap.modal'));

  beforeEach(inject(function(CatalogPreview, $modal) {
    catalogPreview = CatalogPreview;
    modal = $modal;
  }));


  describe('launch', function() {
    var id = 1234;

    beforeEach(function() {
      spyOn(modal, 'open');
      catalogPreview.launch(id);
    })

    it('should call $modal.open', function() {
      expect(modal.open).toHaveBeenCalledWith({
        windowClass: 'catalog-preview-modal',
        template: jasmine.any(String),
        controller: ['$scope', '$modalInstance', 'url', jasmine.any(Function)],
        size: 'lg',
        resolve: {
          url: jasmine.any(Function)
        }
      });
    });

  });

});