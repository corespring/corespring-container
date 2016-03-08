module.exports = function(itemId, name) {
  this.toString = function() {
    return itemId + '~' + name;
  };
};
