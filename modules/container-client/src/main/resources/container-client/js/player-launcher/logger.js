function MockLogger(){
  this.log = function(){}
  this.debug = function(){}
  this.warning = function(){}
  this.error = function(){}
  this.trace = function(){}
}

module.exports = window.console ? window.console : new MockLogger();
