# Slack LaTeX
#### Bot to convert LaTeX code in messages into:

![screen]

### Setup:
1. Clone/download this repository.
2. Install required modules in the project folder with:
    ```
    npm install fs
    npm install request
    npm install websocket
    ```
3. Create a `secret.txt` file in the bot directory and put your slack token in it.
4. Start bot by running `node bot.js` or `nodejs bot.js`

### Usage:

Add the bot to the channel you want to enable SlackLaTeX in. Any message with the following format will be turned into an image when bot is enabled.
 * `$\LaTeX code$`
 * `` `$\LaTeX code$` ``
 * `` ```$\LaTeX code$``` ``

You can also edit or delete a message and the bot will do the right thing.

In Slack, type `..stopLatex` to disable bot and `..startLatex` to re-enable bot. This only applies the user and channel that typed this. By default, it will work for all users in every channel the box exists.

[screen]:http://i.imgur.com/7xbkJ6P.png
