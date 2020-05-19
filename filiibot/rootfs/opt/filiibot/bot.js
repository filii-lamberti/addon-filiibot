const supervisorToken = process.env.SUPERVISOR_TOKEN;

// Nodig voor externe files
const fs = require('fs');
// This contains our configuration
let options;

if (!supervisorToken) {
  // eslint-disable-next-line no-console
  console.log('You are not running this as an Home Assistant add-on!');
  // Here we import the options.json file
  options = JSON.parse(fs.readFileSync('./options.json', 'utf8'));
  options.enmapDataDir = './data';
  options.mqttBrokerUrl = 'mqtt://localhost';
} else {
  // from the add-on persistent data directory
  options = JSON.parse(fs.readFileSync('/data/options.json', 'utf8'));
  options.enmapDataDir = '/data';
  options.mqttBrokerUrl = 'mqtt://core-mosquitto';
}

// Lees de externe file
const welcomeDm = fs.readFileSync('./welcomeDm.txt', 'utf8');
const util = require('util');

// status of logging
const { logging } = options;
// filter console logs
const log = (message) => {
  if (logging) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
};
// prints if logging is true
if (logging) {
  log('Logging is enabled');
}

// status of debugging
const { debugging } = options;
// prints if debugging is true
if (debugging) {
  log('Debugging is enabled');
  process.env.DEBUG = '*';
}

// the message prefix and token of your bot
const { prefix, token } = options;

log(`
  Prefix: ${prefix}
  Token: ${token}
`);

// Gebruikt voor momenten
const moment = require('moment');
const humanizeDuration = require('humanize-duration');
// Set the locale to dutch
moment.locale('nl');

const filiikot = {
  humidity: 0,
  lastChanged: moment(0),
  lastUpdated: moment(0),
  people: 0,
  peopleNames: [],
  state: 'false',
  statusMessage: 'met de gevoelens van het filiikot',
  temperature: 0,
};

// HTTP REST API
const axios = require('axios');
// Supervisor REST API
const supervisorRequest = axios.create({
  baseURL: 'http://supervisor/',
  headers: {
    Authorization: `Bearer ${supervisorToken}`,
    'Content-Type': 'application/json',
  },
});

// eslint-disable-next-line no-console
process.on('unhandledRejection', (error) => console.error('Uncaught Promise Rejection', error));

// Load up the discord.js library
const Discord = require('discord.js');
// Create an instance of a Discord client
const discordClient = new Discord.Client();
discordClient.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  discordClient.commands.set(command.name, command);
}

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const ytsr = require('ytsr');

// Load Enmap
const Enmap = require('enmap');
// Normal enmap with default options but custom data location
discordClient.people = new Enmap({
  name: 'people',
  dataDir: options.enmapDataDir,
  ensureProps: true,
});

// Wait for data to load
discordClient.people.defer.then(() => {
  log(`${discordClient.people.size} keys loaded`);
  // Log our bot in
  discordClient.login(token);
});

const mqttOptions = {
  clientId: 'mqttjs_filiibot',
  username: 'ferre',
  password: 'ferre',
};

// MQTT
const MQTT = require('mqtt');
// Connect to the local MQTT broker
const mqttClient = MQTT.connect(options.mqttBrokerUrl, mqttOptions);

mqttClient.on('connect', () => { // When connected
  log('MQTT connected');
  // subscribe to a topic
  mqttClient.subscribe('filiikot/+');
  // Inform controllers that garage is connected
  mqttClient.publish('filiikot/filiibot_connected', 'true');
});

mqttClient.on('message', (topic, message) => {
  switch (topic) {
    case 'filiikot/humidity':
      filiikot.humidity = message.toString();
      log(`Vochtigheid: ${filiikot.humidity}`);
      break;

    case 'filiikot/last_changed':
      filiikot.lastChanged = moment(message.toString());
      log(`Last changed: ${filiikot.lastChanged}`);
      break;

    case 'filiikot/last_updated':
      filiikot.lastUpdated = moment(message.toString());
      log(`Last updated: ${filiikot.lastUpdated}`);
      break;

    case 'filiikot/people_names':
      filiikot.peopleNames = message.toString().split(',');
      log(`People names: ${filiikot.peopleNames}`);
      break;

    case 'filiikot/people':
      filiikot.people = message.toString();
      log(`People: ${filiikot.people}`);
      break;

    case 'filiikot/state':
      // message is Buffer
      filiikot.state = message.toString();
      log(`Status: ${filiikot.state}`);
      break;

    case 'filiikot/temperature':
      filiikot.temperature = message.toString();
      log(`Temperatuur: ${filiikot.temperature}`);
      break;

    default:
      return;
  }

  switch (filiikot.state) {
    case 'true':
      filiikot.statusMessage = `✅ Het filiikot is open sinds ${filiikot.lastChanged.format('HH:mm')}`;
      break;

    case 'false':
      filiikot.statusMessage = `🛑 Het filiikot is al ${filiikot.lastChanged.fromNow(true)} gesloten`;
      break;

    default:
      filiikot.statusMessage = 'met de gevoelens van het filiikot';
      break;
  }

  // Set the client user's activity
  if (discordClient.readyTimestamp) {
    // the client is ready
    discordClient.user
      .setActivity(filiikot.statusMessage, {
        url: 'https://ishetfiliikotopen.be/',
        type: 'PLAYING',
      })
      .then((presence) => log(`Activity set to ${presence.activities[0].name}`))
      // and catch the error
      .catch((error) => log(`Kon activity niet updaten omdat: ${error}`));
  }
});

const { version } = require('./package.json');

// Is the message author part of Praesidium?
const isMemberPraesidium = (message) => {
  if (message.member.roles.cache.find((role) => role.name === 'Praesidium')) return true;
  message.reply('sorry, you need to be Praesidium to use this!');
  return false;
};

// Is the message author a Server God?
const isMemberServerGod = (message) => {
  if (message.member.roles.cache.find((role) => role.name === 'Server God')) return true;
  message.reply('sorry, you need to be a Server God to use this!');
  return false;
};

const afkSet = (member, reason = ':zzz:') => {
  // Set the nickname for this member.
  member
    .setNickname(`[AFK] ${discordClient.people.get(member.id, 'name')}`)
    .then((mbr) => {
      log(`Changed the AFK nickname to ${mbr.nickname}`);
      discordClient.people.push('afkMembers', member.id);
      discordClient.people.set(member.id, true, 'afk');
      discordClient.people.set(member.id, reason, 'reason');
    })
    // catch delete error
    .catch((error) => log(`Kon nickname niet veranderen omdat: ${error}`));
};

const afkClear = (member) => {
  // Set the nickname for this member.
  member
    .setNickname(discordClient.people.get(member.id, 'name'))
    .then((mbr) => {
      log(`Changed the nickname back to ${mbr.nickname}`);
      discordClient.people.remove('afkMembers', member.id);
      discordClient.people.set(member.id, false, 'afk');
      discordClient.people.set(member.id, '', 'reason');
    })
    // catch delete error
    .catch((error) => log(`Kon nickname niet veranderen omdat: ${error}`));
};

// Was there a member mentioned?
const whichMember = (message) => {
  if (message.mentions.members.size === 0) {
    // Use the person who made the command
    return message.member;
  }
  // Use the person you mentioned
  return message.mentions.members.first();
};

const clean = (text) => {
  if (typeof text === 'string') {
    return text
      .replace(/`/g, `\`${String.fromCharCode(8203)}`)
      .replace(/@/g, `@${String.fromCharCode(8203)}`);
  }
  return text;
};

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
discordClient.on('ready', () => {
  // This event will run if the bot starts, and logs in, successfully.
  log(`Bot is klaar, ik ben ingelogd als ${discordClient.user.tag}!`);
  // Should only have 1 guild
  log(
    `Serving ${discordClient.users.cache.size} users
    in ${discordClient.channels.cache.size} channels
    of ${discordClient.guilds.cache.size} server.`,
  );

  // Change the bot's playing game to something useless
  discordClient.user.setActivity('met de gevoelens van het filiikot');

  // Get the Filii Guild by ID from all Guilds
  const filiiGuild = discordClient.guilds.cache.get('238704983468539905');
  // Check for all members from the Filii Guild
  for (const [key, value] of filiiGuild.members.cache) {
    discordClient.people.ensure(key, {
      id: key,
      name: value.displayName,
      afk: false,
      reason: '',
      type: '',
      keyword: '',
      selection: 0,
      searchResult: [],
    });
  }
  discordClient.people.ensure('afkMembers', []);
});

discordClient.on('error', (error) => {
  log(error);
  discordClient.people.close();
  mqttClient.end();
  process.exit(1);
});

// This event triggers when the bot joins a guild.
discordClient.on('guildCreate', (guild) => {
  log(
    `New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`,
  );
});

// this event triggers when the bot is removed from a guild.
discordClient.on('guildDelete', (guild) => {
  log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});

// Create an event listener for new guild members
discordClient.on('guildMemberAdd', (member) => {
  log(`New User "${member.displayName}" has joined "${member.guild.name}"`);
  // If the joined member is a bot, do nothing.
  if (member.user.bot) return;
  const roleLid = member.guild.roles.cache.find((role) => role.name === 'Leden');
  if (!roleLid) return;
  member.roles.add(roleLid);
  // Send the message to a designated channel on a server:
  const welcomeChannel = member.guild.channels.cache.find((channel) => channel.name === 'aankondigingen');
  // Do nothing if the channel wasn't found on this server
  if (!welcomeChannel) return;
  // Send the message, mentioning the member
  welcomeChannel.send(`Welkom op de Discordserver van Filii Lamberti, ${member}!`);
  member.send(welcomeDm);
});

discordClient.on('guildMemberRemove', (member) => {
  log(`User "${member.displayName}" has left "${member.guild.name}"`);
  // If the joined member is a bot, do nothing.
  if (member.user.bot) return;
  // Send the message to a designated channel on a server:
  const welcomeChannel = member.guild.channels.cache.find((channel) => channel.name === 'aankondigingen');
  // Do nothing if the channel wasn't found on this server
  if (!welcomeChannel) return;
  // Send the message, mentioning the member
  welcomeChannel.send(`Vaarwel, ${member}, u joinde ${moment(member.joinedAt).fromNow()}.`);
});

discordClient.on('guildMemberUpdate', (oldMember, newMember) => {
  // If the nickname is the same, was [AFK] or is [AFK], do nothing.
  if (
    oldMember.nickname === newMember.nickname
    || !newMember.nickname
    || newMember.nickname.substring(0, 6) === '[AFK] '
    || !oldMember.nickname
    || oldMember.nickname.substring(0, 6) === '[AFK] '
  ) return;
  log(`Name of "${oldMember.displayName}" changed to "${newMember.displayName}"`);
  discordClient.people.set(newMember.id, newMember.displayName, 'name');
});

// This event will run on every single message received, from any channel or DM.
discordClient.on('message', async (message) => {
  // Negeren als het bericht van een bot komt
  if (message.author.bot) return;

  // Negeren als het een DM is
  if (message.channel.type !== 'text') {
    message.reply(
      'Het spijt me zeer, maar ik ben momenteel niet geïnteresseerd in persoonlijke relaties. Ik heb mijn handen al vol met Filii te dienen!',
    );
    return;
  }

  const afkMembers = discordClient.people.get('afkMembers');
  if (afkMembers.includes(message.author.id)) {
    afkClear(message.member);
  }

  // Store the original message
  const berichtOrigineel = message.content.trim();
  // ik ben of kben of... at the beginning
  const regexBen = /^i?k\s*ben\s+/im;
  // test het bericht op regexBen
  if (regexBen.test(berichtOrigineel)) {
    // reply but replace the beginning
    message.channel.send(`Dag ${berichtOrigineel.replace(regexBen, '')}, ik ben de Filiibot!`);
    return;
  }

  const mentionedMembers = message.mentions.members;
  const mentionedAfkMembers = afkMembers.filter((element) => mentionedMembers.has(element));
  mentionedAfkMembers.forEach((element) => {
    message.reply(`${discordClient.people.get(element, 'name')} is momenteel AFK met als reden: "${discordClient.people.get(element, 'reason')}".`);
  });

  // Otherwise check if the prefix is there
  if (berichtOrigineel.substring(0, 1) === prefix) {
    // Remove the prefix from the message
    const berichtZonderPrefix = berichtOrigineel.substring(1);
    // To get the "message" itself we join the array back into a string with spaces
    const berichtArrayZonderPrefix = berichtZonderPrefix.split(/\s+/g);
    const berichtArrayZonderPrefixKlein = berichtZonderPrefix.toLowerCase().split(/\s+/g);
    const command = berichtArrayZonderPrefixKlein[0];
    const berichtZonderCommando = berichtArrayZonderPrefix.slice(1).join(' ');
    const subcommand = berichtArrayZonderPrefixKlein[1];
    const berichtZonderSubcommando = berichtArrayZonderPrefix.slice(2).join(' ');

    // const subsubcommand = berichtArrayZonderPrefixKlein[2];
    // The user you want to add a role to
    const member = whichMember(message);

    switch (command) {
      // If the command is 'afk'
      case 'afk':
        // message.reply('sorry, maar dit kan ik nog niet.');
        afkSet(message.member, berichtZonderCommando);
        return;

      // If the command is 'api'
      case 'api':
        message.reply('the api command is removed.');
        return;

      // If the command is 'codex'
      case 'codex': {
        const searchResult = discordClient.people.get(message.member.id, 'searchResult');

        if (searchResult.length === 0) {
          // subcommand = page
          log(`Ready to search for ${berichtZonderSubcommando} in ${subcommand}`);
          const searchUrl = `http://ec433c9f-filiicodex:3000/search/${subcommand}/${berichtZonderSubcommando}`;

          // Codex REST API
          axios.get(searchUrl)
            .then((response) => {
              log(response);
              log(response.data);
              // handle success
              discordClient.people.set(message.member.id, response.data, 'searchResult');

              let bericht;
              bericht = 'Maak alstublieft een selectie:\n';

              let selection;
              for (selection = 0; selection < response.data.length; selection += 1) {
                bericht += `\n${selection}. ${response.data[selection].item.title}`;
              }

              message.reply(bericht);
            })
            .catch((error) => {
              // handle error
              log(`Error: ${error}`);
            });
        } else {
          log(`Selecting song ${subcommand} of searchResult`);
          message.reply(searchResult[subcommand].item.html.text);
          discordClient.people.set(message.member.id, [], 'searchResult');
          log('Clearing searchResult');
        }
        /*
        message.reply(
        `je kan ${songPage[0].Title} vinden op https://studentencodex.org/lied/${
            songPage[0].FriendlyUrl
        }`,
        );
        */
        return;
      }

      // Used to test things, examples below
      // discordClient.emit('guildMemberAdd', member);
      // discordClient.emit('guildMemberRemove', member);
      // discordClient.emit('guildCreate', message.guild);
      // discordClient.emit('guildDelete', message.guild);
      case 'eval':
        if (!isMemberServerGod(message)) return;

        try {
          // eslint-disable-next-line no-eval
          let evaled = eval(berichtZonderCommando);

          if (typeof evaled !== 'string') {
            evaled = util.inspect(evaled);
          }

          message.channel.send(clean(evaled), { code: 'xl' });
        } catch (error) {
          message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
        }
        return;

      // If the command is 'fk'
      case 'fk':
        message.reply(filiikot.statusMessage);
        return;

      // If the command is 'foo'
      case 'foo':
        message.channel.send('bar!');
        return;

      // If the command is 'god'
      case 'god': {
        if (!isMemberPraesidium(message)) return;

        log('Ever wanted to be a god?');
        const roleGod = message.guild.roles.cache.find((role) => role.name === 'Server God');
        if (!roleGod) return;
        // subcommand = status
        log(`Turning God Mode ${subcommand} for ${member.displayName}`);

        switch (subcommand) {
          case 'on':
            // Add the god role!
            member.roles.add(roleGod);
            return;
          case 'off':
            // Remove a role!
            member.roles.remove(roleGod);
            return;
          default:
            return;
        }
      }

      case 'ls': {
        let bericht;
        if (filiikot.people === '0') {
          bericht = 'er is momenteel niemand aanwezig.';
        } else {
          bericht = 'aanwezig:';
          filiikot.peopleNames.forEach((name) => {
            bericht += `\n- ${name}`;
          });
        }
        message.reply(bericht)
          .then((msg) => {
            // We delete the original message,
            message.delete({ timeout: 10000 });
            // the one we sent
            msg.delete({ timeout: 10000 });
          })
          // and catch the error
          .catch((err) => message.reply(`kon bericht niet verwijderen omdat: ${err}`));
        return;
      }

      // If the command is 'ping'
      // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
      // The second ping is an average latency between the bot and the websocket server
      // (one-way, not round-trip)
      case 'ping':
        client.commands.get('ping').execute(message, args);

      case 'play': {
        if (message.channel.type !== 'text') return;

        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
          message.reply('Please join a voice channel first!');
          return;
        }

        voiceChannel.join().then((connection) => {
          if (ytdl.validateURL(berichtZonderCommando)
              || ytdl.validateID(berichtZonderCommando)) {
            log(`Filiibot plays ${berichtZonderCommando} now.`);
            const stream = ytdl(berichtZonderCommando, { filter: 'audioonly' });
            const dispatcher = connection.play(stream);

            dispatcher.on('finish', () => voiceChannel.leave());
          } else if (ytpl.validateURL(berichtZonderCommando)) {
            log('dit is een playlist');

            ytpl(berichtZonderCommando, (err, playlist) => {
              if (err) throw err;
              log(playlist.items);

              const stream = ytdl(playlist.items[0].id, { filter: 'audioonly' });
              const dispatcher = connection.play(stream);

              dispatcher.on('finish', () => voiceChannel.leave());
            });
          } else {
            const searchOptions = {
              limit: 5,
            };

            ytsr(berichtZonderCommando, searchOptions, (err, searchResults) => {
              if (err) throw err;
              log(searchResults);
            });
          }
        });
        return;
      }

      // If the command is 'prune'
      // removes all messages from all users in the channel, up to 100.
      case 'prune': {
        if (!isMemberPraesidium(message)) return;

        // get the delete count, as an actual number.
        const amount = parseInt(subcommand, 10) + 1;
        if (!amount || amount < 1 || amount > 99) {
          message.reply('geef een getal tussen 1 en 99 voor het aantal te verwijderen berichten.');
          return;
        }

        // delete the messages
        message.channel.bulkDelete(amount, true)
          .then((messages) => log(`Bulk deleted ${messages.size} messages`))
          // catch delete error
          .catch((error) => message.reply(`kon berichten niet verwijderen omdat: ${error}`));

        return;
      }

      // If the command is 'purge'
      case 'purge':
        message.reply('purge is obsolete, use the prune command instead.');
        return;

      // If the command is 'restart'
      case 'restart':
        if (!isMemberServerGod(message)) return;
        log('Restarting add-on');
        message.reply('rebooting bot...');

        supervisorRequest.post('addons/self/restart')
          .then((response) => {
            // handle success
            log(response.data);
            message.reply(response.data);
          })
          .catch((error) => {
            // handle error
            log(`Error: ${error}`);
          });
        return;

      // If the command is 'role'
      case 'role': {
        if (!isMemberPraesidium(message)) return;

        log('Doing some roleplay?');
        // Can't use the next thing because otherwise they would get notified
        // let role = message.mentions.roles.cache.first();
        const roleCommilito = message.guild.roles.cache.find((role) => role.name === 'Commilitones');
        const roleOZ = message.guild.roles.cache.find((role) => role.name === 'Ouw Zakken');
        const roleSchacht = message.guild.roles.cache.find((role) => role.name === 'Schachten (dom dom)');
        const roleLid = message.guild.roles.cache.find((role) => role.name === 'Leden');
        const rolePS = message.guild.roles.cache.find((role) => role.name === 'Praesidium');

        // subcommand = what
        log(`Let's use ${subcommand}`);
        switch (subcommand) {
          case 'ontgroen':
            mentionedMembers.forEach((mentionedMember) => {
              mentionedMember.roles.remove(roleSchacht);
              mentionedMember.roles.add(roleCommilito)
                .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
                // and catch the error
                .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
            });
            break;

          case 'pensioen':
            mentionedMembers.forEach((mentionedMember) => {
              mentionedMember.roles.remove(rolePS);
              mentionedMember.roles.add(roleOZ)
                .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
                // and catch the error
                .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
            });
            break;

          case 'dom':
            mentionedMembers.forEach((mentionedMember) => {
              mentionedMember.roles.add(roleSchacht)
                .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
                // and catch the error
                .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
            });
            break;

          case 'lid':
            mentionedMembers.forEach((mentionedMember) => {
              mentionedMember.roles.add(roleLid)
                .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
                // and catch the error
                .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
            });
            break;

          case 'ps':
            mentionedMembers.forEach((mentionedMember) => {
              mentionedMember.roles.add(rolePS)
                .then((mbr) => log(`Gave the role to ${mbr.displayName}`))
                // and catch the error
                .catch((error) => message.reply(`kon rol niet toewijzen omdat: ${error}`));
            });
            break;

          default:
            return;
        }

        return;
      }

      // If the command is 'say'
      // makes the bot say something and delete the message.
      case 'say':
        if (!isMemberPraesidium(message)) return;

        // We delete the original message
        message
          .delete()
          .then((msg) => log(`Deleted message from ${msg.member.displayName}`))
          // and catch the error
          .catch((error) => message.reply(`kon bericht niet verwijderen omdat: ${error}`));

        // And we get the bot to say the thing:
        message.channel.send(berichtZonderCommando);
        return;

      case 'search':
        return;

      case 'stop':
        if (!isMemberServerGod(message)) return;
        log('Stopping add-on');
        message.reply('shutting down...');

        supervisorRequest.post('addons/self/stop')
          .then((response) => {
            // handle success
            log(response.data);
            message.reply(response.data);
          })
          .catch((error) => {
            // handle error
            log(`Error: ${error}`);
          });
        return;

      case 'up':
        message.channel.send(
          `Uptime is ${humanizeDuration(discordClient.uptime, {
            language: 'nl',
            conjunction: ' en ',
            serialComma: false,
            round: true,
          })}.`,
        );
        return;

      case 'version':
        message.channel.send(`Currently running v${version}.`);
        return;

      // If the command is 'welcome'
      case 'welcome':
        message.reply('de welkomsttekst is opnieuw naar je gestuurd.');
        message.member.send(welcomeDm);
        return;

      default:
        return;
    }
  }

  // 12 of twaalf of dozijn als woord
  const regexTwaalf = /\b(1 ?2|t ?w ?a ?a ?l ?f|d ?o ?z ?i ?j ?n)\b/i;
  // test het bericht op regexTwaalf
  if (regexTwaalf.test(berichtOrigineel)) {
    message.reply('twaalf is zekerheid!');
  }
});
