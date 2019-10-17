'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const moment = require('moment');
const shortid_1 = require('shortid');
const Group_1 = require('./Group');
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
    this.cache.set(id, new Group_1.default(groupData));
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
    return JSON.stringify(this.cache, this.exportReplacer);
  }
  import(data) {
    const importData = new Map(JSON.parse(data, this.importReviver));
    this.cache = importData;
    return this.cache;
  }
  exportReplacer(key, value) {
    const getType = input => {
      if (!input) {
        return 'undefined';
      } else if (input instanceof Group_1.default) {
        return 'Group';
      } else {
        return typeof input;
      }
    };
    switch (true) {
      case value instanceof Map:
        return {
          jsontype: 'JSMap',
          metadata: {
            key: 'string',
            value: getType(value.values().next().value)
          },
          jsondata: [...value.entries()]
        };
      default:
        return value;
    }
  }
  importReviver(key, value) {
    if (!value.jsontype) {
      return value;
    }
    switch (value.jsontype) {
      case 'JSMap':
        if (value.metadata.value === 'Group') {
          return new Map(
            value.jsondata.map(([mapKey, mapValue]) => [
              mapKey,
              new Group_1.default(mapValue)
            ])
          );
        } else {
          return new Map(value.jsondata);
        }
      default:
        return value;
    }
  }
}
exports.default = GroupCache;
