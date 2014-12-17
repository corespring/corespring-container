exports.INVALID_MODE = {code: 101, message: "setMode was called with an invalid mode"};
exports.NO_ITEM_ID = {code: 102, message: "itemId is missing from options"};
exports.NO_SESSION_ID  = {code: 103, message: "sessionId is missing from options"};
exports.NOT_ALLOWED = {code: 104, message: "Not allowed to perform this action"};
exports.EXTERNAL_ERROR = function(msg){ return {code: 105, message: msg}; };
exports.CANT_FIND_IFRAME = function(id){ return {code: 106, message: "Can't find Iframe: " + id}; };
exports.CANT_FIND_CONTAINER_FOR_PLAYER = {code: 106, message: "Can't find container for the player"};
exports.PLAYER_NOT_READY = {code: 107, message: "Player not ready yet"};
exports.NO_ITEM_OR_SESSION_ID = {code: 108, message: "itemId or sessionId is missing from options"};
exports.MESSAGE_ERROR = function(msg){ return {code: 109, message: msg}; };
exports.PLAYER_NOT_REMOVED = {code: 110, message: "Unexpected re-initialisation of the player. Call player.remove() before creating a new player instance."};
