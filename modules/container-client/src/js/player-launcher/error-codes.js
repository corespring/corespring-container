exports.INVALID_MODE = {code: 101, message: 'setMode was called with an invalid mode'};
exports.NO_ITEM_ID = {code: 102, message: 'itemId is missing from options'};
exports.NO_SESSION_ID  = {code: 103, message: 'sessionId is missing from options'};
exports.NOT_ALLOWED = {code: 104, message: 'Not allowed to perform this action'};
exports.EXTERNAL_ERROR = function(msg){ return {code: 105, message: msg}; };
exports.CANT_FIND_IFRAME = function(id){ return {code: 106, message: 'Can\'t find Iframe: ' + id}; };
exports.CANT_FIND_CONTAINER_FOR_PLAYER = {code: 106, message: 'Can\'t find container for the player'};
exports.PLAYER_NOT_READY = {code: 107, message: 'Player not ready yet'};
exports.NO_ITEM_OR_SESSION_ID = {code: 108, message: 'itemId or sessionId is missing from options'};
exports.MESSAGE_ERROR = function(msg){ return {code: 109, message: msg}; };
exports.PLAYER_NOT_REMOVED = {code: 110, message: 'Unexpected re-initialisation of the player. Call player.remove() before creating a new player instance.'};
exports.EDITOR_NOT_REMOVED = {code: 111, message: 'Unexpected re-initialisation of the editor. Call editor.remove() before creating a new editor instance.'};
exports.INSTANCE_NOT_READY = { code: 112, message: 'Instance not ready yet'};
exports.CREATE_ITEM_AND_DRAFT_FAILED = function(msg){ return {code: 113, msg: msg};};
exports.COMMIT_DRAFT_FAILED = function(msg){ return {code: 114, msg: msg};};
exports.NO_URL_SPECIFIED = {code: 115, message: 'no url specified'};
exports.CREATE_ITEM_FAILED = function(msg){ return {code: 116, msg: msg};};
exports.CANT_FIND_URL = function(msg){ return {code: 117, msg: msg};};
exports.SAVE_ALL_FAILED = function(msg) { return {code: 118, msg: msg}; };
exports.INITIALISATION_FAILED = {code: 119, msg: 'initialisation failed.'};
exports.COMPONENT_EDITOR_MISSING_ASSET_ENDPOINTS = {
  code: 120, 
  msg: [
  'Missing asset urls, you must provide them in the options object:',
  '  { assets: { upload: {}, remove: {} }',
  'Where upload/remove have the following structure: ',
  '  { method: "POST|PUT|DELETE", url: "your-url" }'
  ].join('\n')
};


exports.COMPONENT_EDITOR_WRONG_METHOD = function(allowed, defined){
  return {
    code: 121,
    msg: 'Wrong method: ' + defined + ' allowed methods: ' + allowed
  };
};

exports.COMPONENT_EDITOR_MISSING_URL = function(key){
  return {
    code: 122,
    msg: 'No url defined for: ' + key
  };
};
exports.LOAD_ITEM_FAILED = function(msg){ return {code: 123, msg: msg};};
exports.LOAD_DRAFT_FAILED = function(msg){ return {code: 124, msg: msg};};