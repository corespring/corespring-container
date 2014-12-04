angular.module('corespring-editor.services').service('Item',[
  'ItemService', 
  function(ItemService){

    /** 
     * A service that sits in front of the xhr service ItemService.
     */
    function Item(){

      var item = null;

      this.load = function(id, cb){

        if(item){
          cb(null, item);
        } else {
          cb(null, {});
        }
      };

      this.save = function(id, data, cb){
        cb(null, {}); 
      };
    }

    return new Item();
  }]);