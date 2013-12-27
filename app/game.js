var _ = require('underscore'),
    client,
    config,
    commands = [],
    msgs = [];

/**
 * Expose `initGame()`
 */
exports = module.exports = initGame;

/**
 * Initialize the game
 * @param cl IRC client object
 * @param co Object that contains config data for the game
 */
function initGame(cl, co) {
    console.log('init game');
    config = co;
    client = cl;
    console.log(config.cards.blacks.length + ' blacks and ' + config.cards.whites.length + ' whites loaded');

    client.addListener('message', function (from, to, text, message) {
        console.log('message from ' + from + ' to ' + to + ': ' + text);
        // parse command
        var cmdArr = text.match(/^[\.|!](\w+)\s?(.*)$/);
        if (!cmdArr || cmdArr.length <= 1) {
            // command not found
            return false;
        }
        var cmd = cmdArr[1];
        // parse arguments
        var cmdArgs = [];
        if (cmdArr.length > 2) {
            cmdArgs = _.map(cmdArr[2].match(/(\w+)\s?/gi), function (str) {
                return str.trim();
            });
        }
        // build callback options
        var uid = message.user + '@' + message.host;
        var opts = {
            uid:  uid,
            args: cmdArgs,
            config: config,
            to: to
        };

        if (config.clientOptions.channels.indexOf(to) >= 0) {
            // public commands
            _.each(commands, function (c) {
                console.log(cmd, '==', c.cmd);
                if (cmd === c.cmd) {
                    console.log('command: ' + c.cmd);
                    // check user mode
                    if (checkUserMode(message, c.mode)) {
                        c.callback(client, opts);
                    }
                }
            }, this);
        } else if (config.nick === to) {
            // private message commands
            _.each(msgs, function (c) {
                if (cmd === c.cmd) {
                    console.log('command: ' + c.cmd);
                    // check user mode
                    if (checkUserMode(message, c.mode)) {
                        c.callback(client, opts);
                    }
                }
            }, this);
        }
    });
}

function checkUserMode(message, mode) {
//    console.log('check mode: ', mode);
//    console.log(message);
    return true;
}

/**
 * Add a public command to the bot
 * @param cmd Command keyword
 * @param mode User mode that is allowed
 * @param cb Callback function
 */
exports.cmd = function (cmd, mode, cb) {
    console.log('add command', cmd, mode);
    commands.push({
        cmd:      cmd,
        mode:     mode,
        callback: cb
    });
};

/**
 * Add a msg command to the bot
 * @param cmd Command keyword
 * @param mode User mode that is allowed
 * @param cb Callback function
 */
exports.msg = function (cmd, mode, cb) {
    console.log('add msg command', cmd, mode);
    msgs.push({
        cmd:      cmd,
        mode:     mode,
        callback: cb
    });
};
