/** Corespring lodash mixins */

_.mixin({
  "makeArray" : function(obj, keyName){

    if(_.isArray(obj)){
      return obj;
    }

    keyName = keyName || "key";

    var keys = _.keys(obj);
    var values = _.values(obj);
    var labelled = _.map(keys, function(k){
      var o = {};
      o[keyName] = k;
      return o;
    });

    return _.merge(labelled, values);
  }
});