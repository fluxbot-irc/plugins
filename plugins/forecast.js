var FC = require('forecast');
var Command = require('../command.js');
var forecast = {};
var geo = require('geo');
var fc = new FC({
    service: 'forecast.io',
    key: 'pls to insert here',
    units: 'celcius', // Only the first letter is parsed
    cache: true, // Cache API requests?
    ttl: { // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
        minutes: 27,
        seconds: 45
    }
});
forecast.desc = 'Predict the weather! Brought to you by forecast.io.'
forecast.modify = false;
forecast.commands = {};
forecast.commands.geo = new Command({args: 1, usage: '<place>', desc: 'Get coordinates for an address'}, function(g, m, u, t) {
    geo.geocoder(geo.google, m.join(' '), false, function(address, lat, long) {
        g.bot.say(t, u + ': ' + address + ': ' + lat + ' ' + long);
    });
});
forecast.commands.weather = new Command({
    args: 2,
    usage: '<lat> <long>',
    desc: 'Get the weather for the specified area'
}, function (g, m, u, t) {
    m[0] = Number(m[0]);
    m[1] = Number(m[1]);
    if (m[0] == NaN || m[1] == NaN) {
        return g.bot.notice(u, 'Please provide valid coords.');
    }
    try {
        fc.get([m[0], m[1]], function (err, res) {
            if (err) {
                g.bot.say(t, u + ': Error getting weather. ' + err);
            } else {
                g.bot.say(t, u + ': It is currently ' + res.currently.temperature + ' C | ' + res.currently.summary + ' | ' + res.currently.precipProbability * 100 + '% chance of ' + res.currently.precipType)
            }
        })
    } catch (e) {
        g.bot.say(t, u + ': Error getting weather. ' + err);
    }
});
forecast.commands.daily = new Command({
    args: 2,
    usage: '<lat> <long>',
    desc: 'Get the weather summary for the specified area over days'
}, function (g, m, u, t) {
    m[0] = Number(m[0]);
    m[1] = Number(m[1]);
    if (m[0] == NaN || m[1] == NaN) {
        return g.bot.notice(u, 'Please provide valid coords.');
    }
    try {
        fc.get([m[0], m[1]], function (err, res) {
            if (err) {
                g.bot.say(t, u + ': Error getting weather. ' + err);
            } else {
                g.bot.say(t, u + ': ' + res.daily.summary);
            }
        })
    } catch (e) {
        g.bot.say(t, u + ': Error getting weather. ' + err);
    }
});
forecast.commands.hourly = new Command({
    args: 2,
    usage: '<lat> <long>',
    desc: 'Get the weather summary for the specified area over hours'
}, function (g, m, u, t) {
    m[0] = Number(m[0]);
    m[1] = Number(m[1]);
    if (m[0] == NaN || m[1] == NaN) {
        return g.bot.notice(u, 'Please provide valid coords.');
    }
    try {
        fc.get([m[0], m[1]], function (err, res) {
            if (err) {
                g.bot.say(t, u + ': Error getting weather. ' + err);
            } else {
                g.bot.say(t, u + ': ' + res.hourly.summary);
            }
        })
    } catch (e) {
        g.bot.say(t, u + ': Error getting weather. ' + err);
    }
});
module.exports = forecast;
