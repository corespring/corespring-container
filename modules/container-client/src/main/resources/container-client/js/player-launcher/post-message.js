function postMessage(message, data) {
  try {
    var iframe = $(element).find('iframe')[0];
    if (!iframe) throw "iframe not found";

    var messageObject = {"message": message};
    iframe.contentWindow.postMessage(JSON.stringify($.extend(messageObject, data)), "*");
    return true;
  } catch (e) {
    log.error( "[player-instance]", message, data, e);
    return false;
  }
};

module.exports = postMessage;
