var Command = require('../command.js');
var brainfuck = require('brainfuck');
var rest = require('request');
var validator = require('validator');
var glob = {};
var bf = {};
bf.modify = function (g) {
    glob = g;
};
bf.commands = {};
bf.desc = 'Brainf**k interpreter for Fluxbot.'
bf.commands.bf = new Command({
    args: 1,
    desc: 'Interpret BF code and print the result'
}, function (g, m, u, t) {
    try {
        brainfuck.exec(m[0], function (err, output) {
            if (output != '') {
                g.bot.say(t, u + ': ' + output.replace(/\n/g, ''));
            } else {
                g.bot.say(t, u + ': No output. Cell status: ' + JSON.stringify(brainfuck.data));
            }
        });
    } catch (error) {
        g.bot.say(t, u + ': ' + error);
    }
});
bf.commands.bfdl = new Command({
    args: 1,
    perm: 'bf',
    desc: 'Interpret http://ix.io/[argument] as BF and print the result'
}, function (g, m, u, t) {
    if (!validator.isAlphanumeric(m[0])) {
        return g.bot.notice(u, 'Please provide an alphanumeric ix.io ID.')
    }
    rest.get('http://ix.io/' + m[0], function (err, res) {
        try {
            brainfuck.exec(res.body, function (err, output) {
                if (output != '') {
                    g.bot.say(t, u + ': ' + output);
                } else {
                    g.bot.say(t, u + ': No output. Cell status: ' + JSON.stringify(brainfuck.data));
                }
            });
        } catch (error) {
            g.bot.say(t, u + ': ' + error);
        }
    });
})
bf.commands.bfdebug = new Command({
    args: 1,
    desc: 'Interpret BF code, debugging it, and print the result'
}, function (g, m, u, t) {
    try {
        brainfuck.exec(m[0], function (err, output) {
            if (output != '') {
                g.bot.say(t, u + ': ' + output);
            } else {
                g.bot.say(t, u + ': No output. Cell status: ' + JSON.stringify(brainfuck.data));
            }
            var debug = brainfuck._debugger.join('\n');
            rest.post('http://ix.io?f:1=' + encodeURIComponent(debug), function (err, res) {
                if (res.statusCode == 200) {
                    g.bot.say(t, u + ': Debugger output: ' + res.body)
                } else {
                    g.bot.say(t, u + ': Debugger error ' + res.statusCode + ' (too large?)')
                }
            });
        });
    } catch (error) {
        g.bot.say(t, u + ': ' + error);
    }
});
bf.commands.bfraw = new Command({
    args: 1,
    perm: 'bf',
    desc: 'Interpret BF code and print the result without a name prefix'
}, function (g, m, u, t) {
    try {
        brainfuck.exec(m[0], function (err, output) {
            if (output != '') {
                g.bot.say(t, u + ': ' + output);
            } else {
                g.bot.say(t, u + ': No output. Cell status: ' + JSON.stringify(brainfuck.data));
            }
        });
    } catch (error) {
        g.bot.say(t, u + ': ' + error);
    }
});
bf.commands.bfhelp = new Command({desc: 'Get help with BF'}, function (g, m, u, t) {
    g.bot.say(u, 'Brainf**k is a programming language designed to screw with your mind!');
    g.bot.say(u, 'For more info, see http://en.wikipedia.org/wiki/Brainfuck');
    g.bot.say(u, 'Want to learn it? http://skilldrick.co.uk/2011/02/why-you-should-learn-brainfuck-or-learn-you-a-brainfuck-for-great-good/')
    g.bot.say(u, 'To run some BF code, use "> bf [code]"')
});
module.exports = bf;