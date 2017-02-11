let request = require("request");

//let WebSocket = require('ws');
let WebSocketClient = require('websocket').client;
let ws;
let message = "";
let i = 0;
let latex = {};
let fs = require('fs');
fs.readFile('secret.txt', 'utf8', function(err, data) {
    global.token = data;
    global.token = global.token.replace(/[\n\r]/g, "");
    getWebSocket();
});

let connection = null;

let replies = {}

//gets the websocket url
function getWebSocket() {
    request('https://slack.com/api/rtm.start?token=' + global.token + '&pretty=1', function(error, response, body) {
        log(response.url);
        if (!error && response.statusCode === 200) {
            url = JSON.parse(body).url;
            log( "Creating url:"+url);
            createWS(url);
        }
    });
}


//initiates websocket connection
function createWS(url) {
    let client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(conn) {
        connection = conn;
        log('WebSocket Client Connected');

        connection.on('error', function(error) {
            log("Connection Error: " + error.toString());
        });

        connection.on('close', function() {
            log('echo-protocol Connection Closed');
        });

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                handleMessage(JSON.parse(message.utf8Data), message);
            }

        });
    });
    client.connect(url);
    log("hey?");

}

function deleteMessage(timestamp, channel) {
    let dURL = "https://slack.com/api/chat.delete?token=" + global.token + "&ts=" + timestamp + "&channel=" + channel + "&pretty=1";
    log("Message to be deleted: "+timestamp + "\n");
    request(dURL, function(error, response, body) {
        log(response.url);
        if (!error && response.statusCode === 200) {
            log(body);
        }
    });
}

function postLatex(user, channel, text) {
    let urlBase = 'http://latex.codecogs.com/png.latex?%5Cdpi%7B300%7D%20' + encodeURIComponent(text);

    let dURL = "https://slack.com/api/chat.postMessage?as_user=true&token=" + global.token + "&channel=" + channel + "&text=%20&attachments=%5B%7B%22fallback%22%3A%22.%22%2C%22color%22%3A%20%22%2336a64f%22%2C%22image_url%22%3A%22" + encodeURIComponent(urlBase) + "%22%7D%5D&pretty=1";

    request(dURL, function(error, response, body) {
        log(response.url);
        if (!error && response.statusCode === 200) {
            log(JSON.parse(body).ts);
            replies[user + channel].reply_ts = JSON.parse(body).ts;
            log(body);
        }
    });
}

function updateLatex(channel, text, ts) {
    let urlBase = 'http://latex.codecogs.com/png.latex?%5Cdpi%7B300%7D%20' + encodeURIComponent(text);

    let dURL = "https://slack.com/api/chat.update?as_user=true&ts=" + ts + "&token=" + global.token + "&channel=" + channel + "&text=%20&attachments=%5B%7B%22fallback%22%3A%22.%22%2C%22color%22%3A%20%22%2336a64f%22%2C%22image_url%22%3A%22" + encodeURIComponent(urlBase) + "%22%7D%5D&pretty=1";

    request(dURL, function(error, response, body) {
        log(response.url);
        if (!error && response.statusCode === 200) {
            log(body);
        }
    });
}


function handleMessage(mObj, message) {

    log("Received: '" + message.utf8Data + "'");
    log(mObj.type+"\n");

    let channel = mObj.channel;

    if (mObj.type === 'message' && mObj.subtype === undefined) {

        log("\t"+mObj.channel+"\n");
        log("\t"+mObj.user+"\n");
        log("\t"+mObj.text+"\n");
        log("\t"+escape(mObj.text)+"\n");

        let laText = getLatex(mObj.text);

        if (mObj.text === '..ping') {
            pong(mObj.channel, "pong");
        }
        if (latex[mObj.user + mObj.channel] != false && laText != null) {
            replies[mObj.user + mObj.channel] = {
                orignal_ts: mObj.ts
            };
            postLatex(mObj.user, mObj.channel, replaceAll(laText, '&amp;', '&'));

            log('Converting to latex: ' + mObj.text);
        }

        if (mObj.text === '..startLatex') {
            latex[mObj.user + mObj.channel] = true;
            log('Enable latex for ' + mObj.user+mObj.channel);
        }

        if (mObj.text === '..stopLatex') {
            latex[mObj.user + mObj.channel] = false;
            log('disable latex for ' + mObj.user+mObj.channel);
        }

    } else if (mObj.subtype === "message_changed") {
        let laText = getLatex(mObj.message.text);
        if (replies[mObj.message.user + mObj.channel] !== undefined && replies[mObj.message.user + mObj.channel].orignal_ts === mObj.message.ts) {

            if (laText != null) { // is latex
                updateLatex(mObj.channel, replaceAll(laText, '&amp;', '&'),
                    replies[mObj.message.user + mObj.channel].reply_ts);
            } else { // not latex
                deleteMessage(replies[mObj.message.user + mObj.channel].reply_ts, mObj.channel);
                delete replies[mObj.message.user + mObj.channel];
            }
        } else {
            if (latex[mObj.message.user + mObj.channel] != false && laText != null) {
                // deleteMessage(mObj.ts,mObj.channel);

                replies[mObj.message.user + mObj.channel] = {
                    orignal_ts: mObj.message.ts
                };
                postLatex(mObj.message.user, mObj.channel, replaceAll(laText, '&amp;', '&'));

                log('Converting to latex: ' + mObj.message.text);
            }
        }
    } else if (mObj.subtype === "message_deleted") {
        if (replies[mObj.previous_message.user + mObj.channel] !== undefined && replies[mObj.previous_message.user + mObj.channel].orignal_ts === mObj.previous_message.ts) {
            deleteMessage(replies[mObj.previous_message.user + mObj.channel].reply_ts, mObj.channel);
            delete replies[mObj.previous_message.user + mObj.channel];
        }
    }

}

const latexWrapRegex = /^\$([\s\S]*)\$$|^`\s*\$([\s\S]*)\$\s*`$|^```\s*\$([\s\S]*)\$\s*```$/g;

function getLatex(text) {
    let m;

    let laText = null;

    while ((m = latexWrapRegex.exec(text)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === latexWrapRegex.lastIndex) {
            latexWrapRegex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            if (groupIndex !== 0 && match !== undefined) {
                laText = match.replace(/\n/g, " ");
                return;
            }
        });
    }
    return laText;
}

function pong(channel, text) {
    if (connection.connected) {
        let message2send = {};
        message2send.text = text;
        message2send.channel = channel;
        message2send.id = i;
        message2send.type = "message";
        connection.sendUTF(JSON.stringify(message2send));
        i += 1;
        return i;
    }
}

const escapeRegEx = /([.*+?^=!:${}()|[]\/\])/g;

function escapeRegExp(str) {
    return str.replace(escapeRegEx, "\$1");
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function log (obj) {
    // console.log(obj);
}