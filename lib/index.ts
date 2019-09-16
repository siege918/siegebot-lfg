import { Message, TextChannel, Client } from 'discord.js';
import { Config } from './config';
import { GroupCache } from './groupCache';
import * as moment from 'moment';
import { DATE_FORMAT } from './constants';
import * as cron from 'node-cron';
import {backup, restore} from './backup';

let discordClient: Client;
let groupCache: GroupCache = new GroupCache();
restore(groupCache);

moment.relativeTimeThreshold('M', 12);
moment.relativeTimeThreshold('d', 30);
moment.relativeTimeThreshold('h', 24);
moment.relativeTimeThreshold('m', 120);
moment.relativeTimeThreshold('s', 360);
moment.relativeTimeThreshold('ss', 3);

//Automatically backup
cron.schedule('*/15 * * * *', () => {
  backup(groupCache);
});

//Alert people when a game is 15 minutes away, or starting now
cron.schedule('* * * * *', () => {
  groupCache.housekeep();

  let fifteenMinuteGroups = groupCache.get15MinuteGroups();

  for (let i = 0; i < fifteenMinuteGroups.length; i++) {
    let channel = discordClient.channels.get(fifteenMinuteGroups[i].channel);
    if (channel) {
      let textChannel = channel as TextChannel;
      textChannel.send(`A game is starting in 15 minutes!\n\n${fifteenMinuteGroups[i].print(true)}`);
    }
  }
  
  let startingGroups = groupCache.getStartingGroups();

  for (var i = 0; i < startingGroups.length; i++) {
    let channel = discordClient.channels.get(startingGroups[i].channel);
    if (channel) {
      let textChannel = channel as TextChannel;
      textChannel.send(`A game is starting now!\n\n${startingGroups[i].print(true)}`);
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
const createPromise = (
  message: Message,
  config: Config,
  resolve: (cache: GroupCache) => any
) => {
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
    const startTime: moment.Moment = moment(params[1], DATE_FORMAT, true);
    let maxPlayers = params[2] ? parseInt(params[2]) : 0;

    if (!startTime.isValid()) {
      console.log(`"${params[1]}"`);
      throw new Error(
        `Incorrect date format. Dates must be in "${DATE_FORMAT}" format.`
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

const removePromise = (
  message: Message,
  config: Config,
  resolve: (cache: GroupCache) => any
) => {
  try {
    //Remove command by removing all before first space
    const q = message.content.substring(message.content.indexOf(' ')).trim();
    const params = q.split(' ').map(arg => arg.trim());

    let groupId = params[0];

    var group = groupCache.remove(message.author.id, groupId);

    if (!group) {
      throw new Error("Group deletion unsuccessful.");
    }

    message.channel.send(
      `**Successfully removed the following group:**\n\n${group.print()}`
    );
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }

  resolve(groupCache);
};

const joinPromise = (
  message: Message,
  config: Config,
  resolve: (cache: GroupCache) => any
) => {
  try {
    //Remove command by removing all before first space
    const q = message.content.substring(message.content.indexOf(' ')).trim();
    const params = q.split(' ').map(arg => arg.trim());

    let groupId = params[0];

    groupCache.joinGroup(message.member, groupId);
    message.channel.send(
      `**Successfully joined the following group:**\n\n${groupCache.print(groupId)}`
    );
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }

  resolve(groupCache);
};

const leavePromise = (
  message: Message,
  config: Config,
  resolve: (cache: GroupCache) => any
) => {
  try {
    //Remove command by removing all before first space
    const q = message.content.substring(message.content.indexOf(' ')).trim();
    const params = q.split(' ').map(arg => arg.trim());

    let groupId = params[0];

    var group = groupCache.leaveGroup(message.author.id, groupId);
    message.channel.send(
      `**Successfully left the following group:**\n\n${groupCache.print(groupId)}`
    );
  } catch (e) {
    message.channel.send(`Error: ${e.message}`);
  }

  resolve(groupCache);
};

const listPromise = (
  message: Message,
  config: Config,
  resolve: (cache: string) => any
) => {
  let output = groupCache.printAll();
  if (output) {
    message.channel.send(output);
  }
  else {
    message.channel.send("There are currently no groups!");
  }
  resolve(output);
};

export function siegebotInit(client: Client) {
  discordClient = client;
}

export function create(message: Message, config: Config) {
  return new Promise((resolve: (cache: GroupCache) => any) => {
    createPromise(message, config, resolve);
  });
}

export function remove(message: Message, config: Config) {
  return new Promise((resolve: (cache: GroupCache) => any) => {
    removePromise(message, config, resolve);
  });
}

export function join(message: Message, config: Config) {
  return new Promise((resolve: (cache: GroupCache) => any) => {
    joinPromise(message, config, resolve);
  });
}

export function leave(message: Message, config: Config) {
  return new Promise((resolve: (cache: GroupCache) => any) => {
    leavePromise(message, config, resolve);
  });
}

export function list(message: Message, config: Config) {
  return new Promise((resolve: (cache: string) => any) => {
    listPromise(message, config, resolve);
  });
}
