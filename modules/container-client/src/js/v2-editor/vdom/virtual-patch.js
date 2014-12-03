/** Can't find this on wzrd.in - so using in here 
 *  from: https://raw.githubusercontent.com/Matt-Esch/vtree/master/vpatch.js
 */
function VirtualPatch(type, vNode, patch) {
  this.type = Number(type);
  this.vNode = vNode;
  this.patch = patch;
}

VirtualPatch.NONE = 0;
VirtualPatch.VTEXT = 1;
VirtualPatch.VNODE = 2;
VirtualPatch.WIDGET = 3;
VirtualPatch.PROPS = 4;
VirtualPatch.ORDER = 5;
VirtualPatch.INSERT = 6;
VirtualPatch.REMOVE = 7;
VirtualPatch.THUNK = 8;

VirtualPatch.prototype.type = "VirtualPatch";