# Slack LaTeX
#### Bot to convert LaTeX code in messages into:

![screen]

Requires creating a [classic app](https://api.slack.com/rtm#classic)

### Setup:
1. Clone/download this repository.
2. Install required modules in the project folder with `npm install`
3. Create a `secret.txt` file in the bot directory and put your slack app token in it.
4. Start bot by running `node bot.js` or `nodejs bot.js`

#### With docker
1. Make sure docker is installed.
2. Create a `secret.txt` file in the bot directory and put your slack app token in it.
3. run `docker build -t slacklatex .` to build the docker image
4. run `docker run -n slackLaTeX --restart always slacklatex` to start the server

### Usage:

Add the bot to the channel you want to enable SlackLaTeX in. Any message with the following format will be turned into an image when bot is enabled.
 * `$\LaTeX code$`
 * `` `$\LaTeX code$` ``
 * `` ```$\LaTeX code$``` ``

You can also edit or delete a message and the bot will do the right thing.

In Slack, type `..stopLatex` to disable bot and `..startLatex` to re-enable bot. This only applies the user and channel that typed this. By default, it will work for all users in every channel the box exists.

[screen]:http://i.imgur.com/7xbkJ6P.png
