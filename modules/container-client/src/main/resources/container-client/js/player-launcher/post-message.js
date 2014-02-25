function postMessage(message, data, element) {
    var iframe = $(element).find('iframe')[0];
    if (!iframe) throw "iframe not found";

    var messageObject = {"message": message};
    iframe.contentWindow.postMessage(JSON.stringify($.extend(messageObject, data)), "*");
}

module.exports = postMessage;
