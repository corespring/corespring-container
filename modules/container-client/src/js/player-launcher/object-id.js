function ObjectId(arg) {

  var objectId = (function(arg) {
    var string, error;

    function verify(string) {
      if (string.length !== 24) {
        throw new Error("ObjectId is not the right length");
      }
      if (!/^[a-zA-Z0-9]*$/.test(string)) {
        throw new Error("ObjectId contains invalid characters");
      }
      return string;
    }

    if (arg === undefined) {
      throw "ObjectId undefined";
    } else if (typeof arg === 'object') {
      if (arg && arg.$oid) {
        string = arg.$oid;
      } else {
        throw new Error("ObjectId object contained no defined $oid");
      }
    } else if (typeof arg === 'string') {
      string = arg;
    } else {
      throw new Error("Unrecognized ObjectId format");
    }

    return verify(string);

  })(arg);

  this.toString = function() {
    return objectId;
  };

}

module.exports = ObjectId;