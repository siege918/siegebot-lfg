'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv').config();
const moment = require('moment');
const cron = require('node-cron');
const groupCache_1 = require('./groupCache');
const constants_1 = require('./constants');
let discordClient;
let groupCache = new groupCache_1.GroupCache();
moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 30);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 120);
moment.relativeTimeThreshold('s', 360);
moment.relativeTimeThreshold('ss', 3);
//Alert people when a game is 15 minutes away, or starting now
cron.schedule('* * * * *', () => {
  groupCache.housekeep();
  let fifteenMinuteGroups = groupCache.get15MinuteGroups();
  for (let i = 0; i < fifteenMinuteGroups.length; i++) {
    let channel = discordClient.channels.get(fifteenMinuteGroups[i].channel);
    if (channel) {
      let textChannel = channel;
      textChannel.send(
        `A game is starting in 15 minutes!\n\n${fifteenMinuteGroups[i].print(
          true
        )}`
      );
    }
  }
  let startingGroups = groupCache.getStartingGroups();
  for (var i = 0; i < startingGroups.length; i++) {
    let channel = discordClient.channels.get(startingGroups[i].channel);
    if (channel) {
      let textChannel = channel;
      textChannel.send(
        `A game is starting now!\n\n${startingGroups[i].print(true)}`
      );
    }
  }
});
/**
 * Creates a group in the group cache.
 *
 * Message format: ".create gameName | YYYY-mm-dd HH:mm (| maxPlayers)"
 * For example: ".create Final Fantasy XIV | 2020-01-05 13:00"
 *           or ".create Overwatch | 2020-10-21 15:00 | 6"
 * @param message
 * @param config
 * @param resolve
 */
const createPromise = (message, config, resolve) => {
  //Remove command by removing all before first space
  const q = message.content.substring(message.content.indexOf(' ')).trim();
  const params = q.split('|').map(arg => arg.trim());
  try {
    if (params.length < 2) {
      throw new Error(
        'Incorrect command format. Type ".help" for example commands.'
      );
    }
    const gameName = params[0];
    const startTime = moment(params[1], constants_1.DATE_FORMAT, true);
    let maxPlayers = params[2] ? parseInt(params[2]) : 0;
    if (!startTime.isValid()) {
      console.log(`"${params[1]}"`);
      throw new Error(
        `Incorrect date format. Dates must be in "${constants_1.DATE_FORMAT}" format.`
      );
    }
    if (Number.isNaN(maxPlayers)) {
      maxPlayers = 0;
    }
    let groupId = groupCache.create(
      message.member,
      gameName,
      maxPlayers,
      startTime,
      message.channel.id
    );
    message.channel.send(`Group created!\n\n${groupCache.print(groupId)}`);
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }
  resolve(groupCache);
};
const removePromise = (message, config, resolve) => {
  try {
    //Remove command by removing all before first space
    const q = message.content.substring(message.content.indexOf(' ')).trim();
    const params = q.split(' ').map(arg => arg.trim());
    let groupId = params[0];
    var group = groupCache.remove(message.author.id, groupId);
    if (!group) {
      throw new Error('Group deletion unsuccessful.');
    }
    message.channel.send(
      `**Successfully removed the following group:**\n\n${group.print()}`
    );
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }
  resolve(groupCache);
};
const joinPromise = (message, config, resolve) => {
  try {
    //Remove command by removing all before first space
    const q = message.content.substring(message.content.indexOf(' ')).trim();
    const params = q.split(' ').map(arg => arg.trim());
    let groupId = params[0];
    groupCache.joinGroup(message.member, groupId);
    message.channel.send(
      `**Successfully joined the following group:**\n\n${groupCache.print(
        groupId
      )}`
    );
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }
  resolve(groupCache);
};
const leavePromise = (message, config, resolve) => {
  try {
    //Remove command by removing all before first space
    const q = message.content.substring(message.content.indexOf(' ')).trim();
    const params = q.split(' ').map(arg => arg.trim());
    let groupId = params[0];
    var group = groupCache.leaveGroup(message.author.id, groupId);
    message.channel.send(
      `**Successfully left the following group:**\n\n${groupCache.print(
        groupId
      )}`
    );
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }
  resolve(groupCache);
};
const listPromise = (message, config, resolve) => {
  let output = groupCache.printAll();
  if (output) {
    message.channel.send(`Here are the upcoming games:

${output}`);
  } else {
    message.channel.send('There are currently no groups!');
  }
  resolve(output);
};
function siegebotInit(client) {
  discordClient = client;
}
exports.siegebotInit = siegebotInit;
function create(message, config) {
  return new Promise(resolve => {
    createPromise(message, config, resolve);
  });
}
exports.create = create;
function remove(message, config) {
  return new Promise(resolve => {
    removePromise(message, config, resolve);
  });
}
exports.remove = remove;
function join(message, config) {
  return new Promise(resolve => {
    joinPromise(message, config, resolve);
  });
}
exports.join = join;
function leave(message, config) {
  return new Promise(resolve => {
    leavePromise(message, config, resolve);
  });
}
exports.leave = leave;
function list(message, config) {
  return new Promise(resolve => {
    listPromise(message, config, resolve);
  });
}
exports.list = list;
