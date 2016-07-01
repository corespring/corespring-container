/*
Use the following command to update the public site docs:
```
npm install -g jsdoc2md 
jsdoc2md --template modules/container-client/grunt/docs/error-codes.hbs --src modules/container-client/src/js/player-launcher/error-codes.js > ../public-site/client/docs/administer-items/client-side-error-codes.md 
```
*/
/**
 * A list of all possible errors that may be returned via the `errorCallback` handler in the constructor of the `Player`, `Editor` or `Catalog` launchers. 
 * 
 * eg: 
 * 
 * ```js 
 * //onError will receive the errors below. 
 * var player = new org.corespring.players.Player('.holder', {}, onError);
 * ``` 
 * @module error-codes 
 * 
 */

/**
 * 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 101  | player  | calling `setMode` with a value other than `gather`, `view` or `evaluate`. |   
 */
exports.INVALID_MODE = {code: 101, message: 'setMode was called with an invalid mode'};

/**
 * 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 102  | player  | launching the catalog without specifing an `itemId` in the options. |
 */
exports.NO_ITEM_ID = {code: 102, message: 'itemId is missing from options'};

/**
 * 
 * | Code | Context | Cause |
 * | --   | --      | --    |
 * | 103  | player |  launching the player without a `sessionId` and with `mode:view` or `evaluate`.  
 */
exports.NO_SESSION_ID  = {code: 103, message: 'sessionId is missing from options'};
/**
 * 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 104  | player  | calling a method that may not be allowed, ie if `secure:true` and calling `setMode('gather')`. |
 */
exports.NOT_ALLOWED = {code: 104, message: 'Not allowed to perform this action'};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 105  | all  | Triggered by either errors that occur when launching the corespring launch js or errors when the content has been loaded into the iframe. |
 * 
 * > Internal: `'launch-error'` can trigger it or errors in the launch.js.
 */
exports.EXTERNAL_ERROR = function(msg){ return {code: 105, message: msg}; };
/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 106  | player  | After launching and loading the content in an iframe, the iframe can't be found. This is unlikely to happen, but if there is js elsewhere on the page that removes iframes - this can happen. |
 */
exports.CANT_FIND_IFRAME = function(id){ return {code: 106, message: 'Can\'t find Iframe: ' + id}; };
/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 106  | player  | Cause: When launching the player you must specify a selector for the containing node. This error occurs if that selector doesn't find exactly a node. |
 */
exports.CANT_FIND_CONTAINER_FOR_PLAYER = {code: 106, message: 'Can\'t find container for the player'};
/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 108  | player  | When launching the player you must specify at least one `itemId` or `sessionId`. |
 */
exports.NO_ITEM_OR_SESSION_ID = {code: 108, message: 'itemId or sessionId is missing from options'};
/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 109  | player  | If there is a messaging error (using `postMessage`) between the root document and the iframe. | 
 */
exports.MESSAGE_ERROR = function(msg){ return {code: 109, message: msg}; };

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 110  | player  | If you have loaded multiple players at the same time. You must remove the preceding one before loading another. |
 */
exports.PLAYER_NOT_REMOVED = {code: 110, message: 'Unexpected re-initialisation of the player. Call player.remove() before creating a new player instance.'};

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 111  | editor  | If you have loaded multiple editors at the same time. You must remove the preceding one before loading another. |
 */
exports.EDITOR_NOT_REMOVED = {code: 111, message: 'Unexpected re-initialisation of the editor. Call editor.remove() before creating a new editor instance.'};

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 112  | all  | If you have tried to interact with the api, before the instance is ready. This shouldn't happen often.
 */
exports.INSTANCE_NOT_READY = { code: 112, message: 'Instance not ready yet'};

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 113  | draftEditor  | Creating the draft + item failed. The `msg` will have more detail.
 */
exports.CREATE_ITEM_AND_DRAFT_FAILED = function(msg){ return {code: 113, msg: 'Create item and draft failed: ' + msg};};

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 114  | draftEditor  | Commiting the draft failed. The `msg` will have more detail. |
 */
exports.COMMIT_DRAFT_FAILED = function(msg){ return {code: 114, msg: msg};};

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 115  | all  | If no url has been configured for the iframe. This is an internal error. |
 */
exports.NO_URL_SPECIFIED = {code: 115, message: 'no url specified'};

 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 115  | editor  | Failed to create an item - may happen if you launch the editor with no itemId (it'll try and create one for you). |
 */
exports.CREATE_ITEM_FAILED = function(msg){ return {code: 116, msg: msg};};


 /** 
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 117  | all  | An internal error if a url can't be found for a given action. |
 */
exports.CANT_FIND_URL = function(msg){ return {code: 117, msg: msg};};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 119  | all  | If there was a failure loading the underlying iframe.|
 * 
 */
exports.INITIALISATION_FAILED = {code: 119, msg: 'initialisation failed.'};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 120  | all  | If there was a failure loading the item.|
 */
exports.LOAD_ITEM_FAILED = function(msg){ return {code: 120, msg: msg};};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 121  | draftEditor  | If there was a failure loading the draft.|
 */
exports.LOAD_DRAFT_FAILED = function(msg){ return {code: 121, msg: msg};};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 122  | questionComponentEditor  |  If an `uploadUrl` was specified but is missing `:filename` from the url.
 */
exports.UPLOAD_URL_MISSING_FILENAME = {code: 122, msg: 'the upload url needs to have \':filename\'.'};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 123  | questionComponentEditor  |  If no `componentType` was specified in the launch options.
 */
exports.NO_COMPONENT_TYPE = {code: 123, msg: 'no \'componentType\' specified.'};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 124  | questionComponentEditor  |  If no `componentKey` was found.
 */
exports.INTERNAL_ERROR = function(msg){return {code: 124, msg: msg};};

/**
 * | Code | Context | Cause |
 * | --   | --      | --  |
 * | 125  | questionComponentEditor  |  If a call can't be found for an action. Internal.
 */
exports.CALL_IS_UNDEFINED = {code: 125, msg: 'code is undefined'};