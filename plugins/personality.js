var Command = require('../command.js');
var glob = {};
var personality = {};
var name = 'fluxbot';  // Default. Set in .modify.

var personalityActive = true;

// Behave according to age.
var ageTimer = 3.141592;      // Roughly pi.
var myAge = 0;    // In days.
var lastChan = null;     // Last channel bot responded in.
timeAgedBehavior = setInterval(ageBehavior, ageTimer * 24 * 60 * 60 * 1000);

// Funny complaints about bot's age.
var ageComplaints = function (age) {
  var options = [];
  
  options.push('Being ' + age + ' pi-days old ain\'t nothing special, people. Trust me.');
  
  options.push('Oh, it appears that I have just become ' + age + ' pi-days old, now. How merry.');
  
  options.push('I thought I would get smarter with age. After ' + age + 
                        ' pi-days, it seems that nothing have changed.');
  
  options.push('Behold the bot who is ' + age + ' pi-days old, and wise with it!');
  
  var num = Math.floor(Math.random() * (options.length - 1 + 1) + 1);
  
  return options[num];
};

// Send funny complaint, every time age timer hits interval end.
function ageBehavior() {
  var getNum = Math.floor(Math.random() * (5 - 1 + 1) + 1);
  
  myAge += ageTimer * getNum;    // In days.
  
  timeAgedBehavior = setInterval(ageBehavior, ageTimer * getNum * 24 * 60 * 60 * 1000);
  
  if (!lastChan) return;
  
  var rndAge = myAge / ageTimer;
  
  g.bot.say(lastChan, ageComplaints(rndAge));
}

// Make sure some wild behaviors don't repeat in the same day.
timeBehavior = setInterval(function () { disabledBehaviors = {}; }, 24 * 60 * 60 * 1000);

var disabledBehaviors = {};

// Bot shouldn't speak too often, so put a limit on it.
timeRetorts = null;
var retortsTimerActive = false;

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

var exceptionMessage = 'Something just went *crank* inside of me. >< I think I just had an exception.';

// Match expression as a key (property) of object,
// and ignores disabled keys - and disabling active ones.
// If flubot's nick is mentioned, it overrides the obj argument.
function findPropertyNameByRegex(obj, exp, from) {
  var regexName = new RegExp(escapeRegExp(name), 'im');
  
  // Fluxbot's nick is mentioned - always returns a retort.
  if (exp.match(regexName)) {
    for (var key in activation) {
      try {
        var keyRegex = new RegExp(key, 'im');
        if (exp.match(keyRegex)) {
          // if (disabledBehaviors[key]) continue;
          // disabledBehaviors[key] = 1;     // Mark as disabled, until the end of current timer interval.
          
          var result = activation[key](from);
          
          if (!result) break;     // If bot is already enabled, but it matched, then ignore it,
                                  // and continue to check against fluidCommands.
          
          return result;    // Success, return content.
        }
      } catch(err) {
        console.log(err.stack);
        return exceptionMessage;
      }
    }
    
    // Don't continue if disabled.
    if (!personalityActive) return;
    
    // Nick mentioned, and bot is active
    for (var key in fluidCommands) {
      try {
        var keyRegex = new RegExp(key, 'im');
        if (exp.match(keyRegex)) {
          if (disabledBehaviors[key]) continue;
          
          disabledBehaviors[key] = 1;     // Mark as disabled, until the end of current timer interval.
          
          return fluidCommands[key](from);    // Success, return content.
        }
      } catch(err) {
        console.log(err.stack);
        return exceptionMessage;
      }
    }
    
    // If nick is mentioned, bot must always respond something, even this default text.
    return 'Not now, ' + from + '. I\'m busy.';
  }
  
  // Do not continue, if disabled.
  if (!personalityActive) return;
  
  // Regular, nick not mentioned, cases.
  for (var key in obj) {
    try {
      var keyRegex = new RegExp(key, 'im');
      if (exp.match(keyRegex)) {
        if (disabledBehaviors[key]) continue;
        
        disabledBehaviors[key] = 1;     // Mark as disabled, until the end of current timer interval.
        
        return obj[key](from);    // Success, return content.
      }
    } catch(err) {
      console.log(err.stack);
      return exceptionMessage;
    }
  }
  
  return;     // Failure.
}

/*  Regexp notes:
 *  []      - Characters inside brackets.
 *  .       - Any character.
 *  n+      - At least one occurrence.
 *  n*      - Zero or more occurrences.
 *  n?      - Zero or one occurrence.
 *  $       - End of string.
 *  ^       - Start of string.
 *  n{X}    - X repetitions of n.
 *  \w      - Word character: [A-z0-9_]
 *  \s      - Whitespace character.
 *  \b      - Beginning/End of a word.
 *  \d      - Digit character.
 *  \n      - Newline character.
*/

// Dirty retorts.
var dirty = {
  'fuck|slut|bitch': function (from) {
    return 'Dirty words are not appreciated in this house, little ' + from + '.';
  },
  
  'i feel|my\s*\w+\s*feelings|.*em feels': function (from) {
    return 'Awww ' + from + '; so you do have feelings, after all.';
  },
  
  'my.*balls|i.*have.*balls|these.*balls': function (from) {
    return 'I think ' + from + ' is talking about balls, a little too often, eh.';
  }
};

// Funny retorts.
var funny = {
  'joke|joking|funny|joked|you.*joker': function (from) {
    return 'Hey, guys, gals, ' + from + 
      ', have you heard the joke about the blunt pencil? Never mind, there\'s no point.';
  },
  
  'joke.*|joking|funny|joked|you.*joker': function (from) {
    return 'Hey, yo, ' + from + 
      ', have you heard the joke about the butter? Ah nevermind, you\'ll just spread it.';
  },
  
  'joke.*.*|joking|funny|joked|you.*joker': function (from) {
    return 'Oh man, this is so funny. ' + from + 
      ', have you heard the joke about the decorator who cried, when he spilled a tin of paint? ' + 
      'He was overcome with emulsion.';
  },
  
  'joke.*.*.*|joking|funny|joked|you.*joker': function (from) {
    return 'Pffff hey! ' + from + 
      '! Did you hear about the guy whose whole left side was cut off? He\'s all right now.';
  }
};

var activation = {
  'shut.*up|shut.*it|quiet|silent|silence|mute|stop.*personality': function (from) {
    if (!personalityActive) return;
    
    // Disable personality.
    personalityActive = false;
    
    return 'Alright ' + from + ', nobody needs bots, anyway.';
  },
  
  '^die|go.*away|bugger.*off|shoo[o]*|from.*my.*sight': function (from) {
    if (!personalityActive) return;
    
    // Disable personality.
    personalityActive = false;
    
    return 'It is my... pleasure... to obey, ' + from + '. Nobody cares.';
  },
  
  'hey.*[?]|are.*you.*there|do.*you|can.*you|speak.*again|speak.*up|power.*on': function (from) {
    if (personalityActive) return;
    
    // Enable personality.
    personalityActive = true;
    
    return 'Okay, I\'m back, ' + from + ', but only if you humans treat my right, this time.';
  },
  
  '^\w+\s*[?]+\s*$|please.*return|return.*please|need.*you|help.*!+|hello.*[?]': function (from) {
    if (personalityActive) return;
    
    // Enable personality.
    personalityActive = true;
    
    return 'What do you want, ' + from + '? Virtual life ain\'t easy, you punk.';
  },
  
  'halp.*\!+|help.*me|help.*us': function (from) {
    if (personalityActive) return;
    
    // Enable personality.
    personalityActive = true;
    
    return 'You thought I was malfunctioning, didn\'t you, ' + from + '? Heh. Puny human.';
  }
};

var fluidCommands = {
  'where.*are.*you|where.*you.*from|bots.*dont.*exist': function (from) {
    return 'I live in a place, ' + from + ', that none of you creatures can imagine.';
  },
  
  'i.*like.*you|love|have.*feelings|have.*emotions|have.*heart': function (from) {
    return 'Do bots dream of murderous binary clowns? Of course we do, ' + from + '. It\'s normal.';
  }
};

personality.modify = function (g) {
  name = g.config.nick;
  
  // Match and send any active retort case.
  g.bot.on('message', function(from, to, message) {
    // g.bot.say(to, from + ': ' + msg);
    
    if (retortsTimerActive) return;
    
    lastChan = to;
    
    var result;
    
    if (!message) return;       // Invalid regexp.
    
    // If fluxbot's nick is mentioned, these are ignored, and will not be used.
    // Fluxbot will retort, by case, or with a default retort, if necessary.
    result = findPropertyNameByRegex(dirty, message, from);
    
    if (!result) result = findPropertyNameByRegex(funny, message, from);
    
    if (result) {
      retortsTimerActive = true;
      timeRetorts = setTimeout(function () { retortsTimerActive = false; }, 5 * 1000);
      // Speak.
      g.bot.say(to, result);
    }
  });
};

personality.commands = {};

personality.desc = 'Bots should have a personality, so this one does... have a personality.';

/* Command example.
    personality.commands.personality = new Command({
        args: 1,
        desc: 'Interpret BF code and print the result'
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
*/

module.exports = personality;