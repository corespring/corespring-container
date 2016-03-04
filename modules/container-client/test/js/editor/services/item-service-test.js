describe('ItemService', function(){

  var service, http;
  beforeEach(angular.mock.module('corespring-editor.services'));

  beforeEach(module(function($provide) {
    var e = org.corespring.mocks.editor;
    http = e.http();
    $provide.value('$http', http);
    $provide.value('$timeout', e.$timeout());
    $provide.value('ItemUrls', {});
    $provide.value('LogFactory', e.LogFactory());
  }));

  beforeEach(inject(function(ItemService){
    service = ItemService;
  }));

  describe('saveXhtmlAndComponents', function(){

    beforeEach(function(){
      service.saveXhtmlAndComponents('<div/>', {}, onSuccess, onFailure);
    });

    it('call $http', function(){
      expect(http.put).toHaveBeenCalled();
    });
  });
});