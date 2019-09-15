import { Message } from 'discord.js';
import { Config } from './config';
import { GroupCache } from './groupCache';
import * as moment from 'moment';
import { DATE_FORMAT } from './constants';

let groupCache: GroupCache = new GroupCache();

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
      throw new Error(
        `Incorrect date format. Dates must be in "${DATE_FORMAT}" format.`
      );
    }

    if (Number.isNaN(maxPlayers)) {
      maxPlayers = 0;
    }

    let groupId = groupCache.create(
      message.author.id,
      gameName,
      maxPlayers,
      startTime
    );

    message.channel.send(`Group created!
        ${groupCache.print(message.guild.members, groupId)}
    `);
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
  resolve(groupCache);
};

const joinPromise = (
  message: Message,
  config: Config,
  resolve: (cache: GroupCache) => any
) => {
  resolve(groupCache);
};

const leavePromise = (
  message: Message,
  config: Config,
  resolve: (cache: GroupCache) => any
) => {
  resolve(groupCache);
};

const listPromise = (
  message: Message,
  config: Config,
  resolve: (cache: string) => any
) => {
  let output = groupCache.printAll(message.guild.members);
  message.channel.send(output);
  resolve(output);
};

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
