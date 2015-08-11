var request = require("request");

//var WebSocket = require('ws');
var WebSocketClient = require('websocket').client;
var ws;
var message="";
var i = 0;
var latex = {};
var fs = require('fs');
fs.readFile('secret.txt','utf8',function (err, data) {
    global.token=data;
    global.token = global.token.replace(/[\n\r]/g,"");
    getWebSocket();
});

//gets the websocket url 
function getWebSocket(){
    request('https://slack.com/api/rtm.start?token='+global.token+'&pretty=1', function (error, response, body) {
         //console.log(response.url);
         if (!error && response.statusCode == 200) {
            url = JSON.parse(body).url;
            console.log( "Creating url:"+url);
            createWS(url);
         }
    });
}


//initiates websocket connection
function createWS(url) {
    var client = new WebSocketClient();

    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');

        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });

        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });

        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var mObj = JSON.parse(message.utf8Data);

                console.log("Received: '" + message.utf8Data + "'");
                console.log(mObj.type+"\n");

                if(mObj.type==='message'){
                    
                        console.log("\t"+mObj.channel+"\n");
                        console.log("\t"+mObj.user+"\n");
                        console.log("\t"+mObj.text+"\n");
                        console.log("\t"+escape(mObj.text)+"\n");

                        if(mObj.text==='..ping'){
                            pong(mObj.channel,"pong");
                        }
                        if(latex[mObj.user+mObj.channel]==true && mObj.text[0]==='$' && mObj.text[mObj.text.length-1]==='$' && mObj.text.length>1) {
                            deleteMessage(mObj.ts,mObj.channel);
                            postLatex(mObj.channel,mObj.text.substring(1,mObj.text.length-1).replace('&amp;','&'));
                            console.log('Converting to latex: ' + mObj.text);
                        }
                        
                    
                        if(mObj.text==='..startLatex') {
                            latex[mObj.user+mObj.channel]=true;
                            console.log('Enable latex for ' + mObj.user+mObj.channel);
                        }
                        if(mObj.text==='..stopLatex') {
                            latex[mObj.user+mObj.channel]=false;
                            console.log('disable latex for ' + mObj.user+mObj.channel);

                        }

                    }
            }

        });

        function pong(channel,text){
            if (connection.connected) {
                var message2send={};
                message2send.text=text;
                message2send.channel=channel;
                message2send.id=i;
                message2send.type="message";
                connection.sendUTF( JSON.stringify(message2send));
                i+=1;
                return i;
            }
        }

    });
    client.connect(url);
    console.log("hey?");

}

function deleteMessage(timestamp,channel) {
    var dURL = "https://slack.com/api/chat.delete?token="+global.token+"&ts=" +timestamp+"&channel="+channel+"&pretty=1";

    request(dURL, function (error, response, body) {
         //console.log(response.url);
         if (!error && response.statusCode == 200) {
            console.log(body);
         }
        });
}

function postLatex(channel,text) {
    var urlBase= 'http://latex.codecogs.com/png.latex?%5Cdpi%7B300%7D%20'+encodeURIComponent(text);

    var dURL = "https://slack.com/api/chat.postMessage?token="+global.token+"&channel="+channel+"&text=%20&attachments=%5B%7B%22fallback%22%3A%22.%22%2C%22color%22%3A%20%22%2336a64f%22%2C%22image_url%22%3A%22" + encodeURIComponent(urlBase)+"%22%7D%5D&pretty=1";
    
    request(dURL, function (error, response, body) {
         //console.log(response.url);
         if (!error && response.statusCode == 200) {
            console.log(body);
         }
        });
}

