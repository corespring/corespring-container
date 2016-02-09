/**
 * Note - our external api has a universal callback that should 
 * handle an object in the following form: 
 * { error: , result: } - where error may or may not be there.
 * This function creates a callback that Msgr.js expects: function(err, data) 
 * and converts the result to {error: err, result: data}
 */
exports.instanceCallbackHandler = function(cb){
  if(!cb){
    if(console && console.warn){
      console.warn('no callback provided to instanceCallbackHandler'); 
    }
    return function(){};
  } else {
    return function(err, data){
      if(err){
        cb({error: err});
      } else {
        cb({result: data});
      }
    };
  }
};