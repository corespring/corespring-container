(function(){
  function ItemIdService() {
    // TODO: This is a temporary means of extracting the session id
    this.itemId = function() {
      return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
    };
  }

  angular.module('corespring-common.services')
    .service('ItemIdService',
      [
        ItemIdService
      ]
    );

})();
