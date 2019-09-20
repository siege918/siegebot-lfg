'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const moment = require('moment');
const shortid_1 = require('shortid');
const group_1 = require('./group');
class GroupCache {
  constructor() {
    this.cache = new Map();
  }
  has(id) {
    return this.cache.has(id);
  }
  get(id) {
    const group = this.cache.get(id);
    if (!group) {
      throw new RangeError('The specified group does not exist.');
    }
    return group;
  }
  print(id, doMention = false) {
    const group = this.cache.get(id);
    if (!group) {
      return '';
    }
    return `${group.print(doMention)}
*Join this group by typing* \`\`\`.join ${id}\`\`\`
*Leave this group by typing* \`\`\`.leave ${id}\`\`\`
`;
  }
  printAll() {
    return [...this.cache.keys()]
      .map(id => this.print(id))
      .join('\n---------------------------------\n\n');
  }
  get15MinuteGroups() {
    const groups = [...this.cache.values()].filter(
      group =>
        !group.hasHad15MinuteUpdate &&
        moment()
          .add(15, 'minutes')
          .isAfter(group.startTime)
    );
    groups.forEach(group => {
      group.hasHad15MinuteUpdate = true;
    });
    return groups;
  }
  getStartingGroups() {
    const groups = [...this.cache.values()].filter(
      group => !group.hasHadStartingUpdate && moment().isAfter(group.startTime)
    );
    groups.forEach(group => {
      group.hasHadStartingUpdate = true;
    });
    return groups;
  }
  housekeep() {
    for (const group of this.cache.values()) {
      if (group.hasHadStartingUpdate) {
        this.cache.delete(group.id);
      }
    }
  }
  create(creatorMember, gameName, maxPlayers, startTime, channel) {
    let id = '';
    do {
      id = shortid_1.generate().substring(0, 4);
    } while (this.has(id));
    const creator = {
      Id: creatorMember.id,
      Tag: creatorMember.user.tag,
      Mention: creatorMember.toString()
    };
    const players = new Map();
    players.set(creatorMember.id, creator);
    const groupData = {
      id,
      gameName,
      players,
      maxPlayers,
      startTime: startTime.toDate(),
      creator,
      channel
    };
    this.cache.set(id, new group_1.Group(groupData));
    return id;
  }
  remove(creator, id) {
    const group = this.get(id);
    if (group.creator.Id !== creator) {
      throw new Error('Groups can only be removed by their creator.');
    }
    this.cache.delete(id);
    return group;
  }
  joinGroup(player, id) {
    const group = this.get(id);
    group.addPlayer(player);
    return group;
  }
  leaveGroup(player, id) {
    const group = this.get(id);
    group.removePlayer(player);
    return group;
  }
  export() {
    return JSON.stringify(this.cache);
  }
  import(data) {
    const importData = new Map(JSON.parse(data));
    const newCache = new Map();
    for (const key of importData.keys()) {
      const importDatum = importData.get(key);
      if (importDatum) {
        if (
          importDatum.players &&
          typeof importDatum.players[Symbol.iterator] === 'function'
        ) {
          importDatum.players = new Map(importDatum.players);
        } else {
          importDatum.players = new Map();
        }
        newCache.set(key, new group_1.Group(importDatum));
      }
    }
    this.cache = newCache;
    return this.cache;
  }
}
exports.GroupCache = GroupCache;
