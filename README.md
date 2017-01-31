# SlackLateX
Bot to convert LateX code in messages into 

![screen]

##How to use:
Install required modules with:
```
npm install fs
npm install request
npm install websocket
```

Set the `SLACK_TOKEN` env var or create a secret.txt file in the bot directory and put your slack token in it.

Start bot by running `node bot.js` or `nodejs bot.js`

In Slack, type `..startLatex` to enable bot and `..stopLatex` to disable bot. This only applies the user and channel that typed this. 

Any message that starts with '$' and ends with '$' will be turned into an image when bot is enabled


[screen]:http://i.imgur.com/7xbkJ6P.png
