/* global sax, mathjs */
/**
 The core library starts life with no modules defined.
 Add the base set of libraries here.
 */
if (!corespring) {
  throw "Can't find global corespring object";
}

if (!corespring.module) {
  throw "Can't find corespring.module function";
}

corespring.module("underscore", _);
corespring.module("lodash", _);
corespring.module("sax", sax);

if (this.mathjs) {
  corespring.module("mathjs", mathjs);
}
