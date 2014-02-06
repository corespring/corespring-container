exports.INVALID_MODE = {code: 101, message: "setMode was called with an invalid mode"};
exports.NO_ITEM_ID = {code: 102, message: "itemId is missing from options"};
exports.NO_SESSION_ID  = {code: 103, message: "sessionId is missing from options"};
exports.NOT_ALLOWED = {code: 104, message: "Not allowed perform this action"};
exports.EXTERNAL_ERROR = function(msg){ return {code: 105, message: msg}; }
exports.CANT_FIND_IFRAME = {code: 106, message: "Can't find Iframe"};
