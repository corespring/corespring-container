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



function VirtualNode(tagName, properties, children, key, namespace) {

  function isVHook(hook) {
    return hook && typeof hook.hook === "function" && !hook.hasOwnProperty("hook");
  }

  function isVNode(x) {
    return x && x.type === "VirtualNode";
  }

  function isWidget(w) {
    return w && w.type === "Widget";
  }

  this.tagName = tagName;
  this.properties = properties || {};
  this.children = children || []; 
  this.key = key != null ? String(key) : undefined;
  this.namespace = (typeof namespace === "string") ? namespace : null;

  var count = (children && children.length) || 0;
  var descendants = 0;
  var hasWidgets = false;
  var descendantHooks = false;
  var hooks;

  for (var propName in properties) {
      if (properties.hasOwnProperty(propName)) {
          var property = properties[propName];
          if (isVHook(property)) {
              if (!hooks) {
                  hooks = {};
              }

              hooks[propName] = property;
          }
      }
  }

  for (var i = 0; i < count; i++) {
      var child = children[i];
      if (isVNode(child)) {
          descendants += child.count || 0;

          if (!hasWidgets && child.hasWidgets) {
              hasWidgets = true;
          }

          if (!descendantHooks && (child.hooks || child.descendantHooks)) {
              descendantHooks = true;
          }
      } else if (!hasWidgets && isWidget(child)) {
          if (typeof child.destroy === "function") {
              hasWidgets = true;
          }
      }
  }

  this.count = count + descendants;
  this.hasWidgets = hasWidgets;
  this.hooks = hooks;
  this.descendantHooks = descendantHooks;
}

VirtualNode.prototype.type = "VirtualNode";

function VirtualText(text) {
  this.text = String(text);
}
