import { Group } from './group';
import { Snowflake, TextChannel, GuildMember } from 'discord.js';
import * as moment from 'moment';

export class GroupCache {
  private _cache: Group[];

  constructor() {
    this._cache = [];
  }

  get(index: number): Group {
    let group = this._cache[index];

    if (!group) {
      throw new RangeError('The specified group does not exist.');
    }

    return group;
  }

  print(index: number, doMention: boolean = false): string {
    return (
`**Group Number ${index}**
${this._cache[index].print(doMention)}
*Join this group by typing '.join ${index}'
Leave this group by typing '.leave ${index}'*
`
    );
  }

  printAll(): string {
    return this._cache.map(
        (group: Group, index) => this.print(index)
    ).join('\n---------------------------------\n\n');
  }

  get15MinuteGroups(): Group[] {
    let groups = this._cache.filter(
      (group: Group) => !group.hasHad15MinuteUpdate && moment().add(15, 'minutes').isAfter(group.startTime)
    );

    groups.forEach((group) => {group.hasHad15MinuteUpdate = true});

    return groups;
  }

  getStartingGroups(): Group[] {
    let groups = this._cache.filter(
      (group: Group) => !group.hasHadStartingUpdate && moment().isAfter(group.startTime)
    );

    groups.forEach((group) => {group.hasHadStartingUpdate = true});

    return groups;
  }

  housekeep() {
    this._cache = this._cache.filter(
      (group: Group) => !group.hasHadStartingUpdate
    );
  }

  create(
    creator: GuildMember,
    gameName: string,
    maxPlayers: number,
    startTime: moment.Moment,
    channel: TextChannel
  ): number {
    return (
      this._cache.push(new Group(creator, gameName, maxPlayers, startTime, channel)) - 1
    );
  }

  remove(creator: Snowflake, index: number): Group {
    let group = this.get(index);

    if (group.creator.Id !== creator) {
      throw new Error('Groups can only be removed by their creator.');
    }

    return this._cache.splice(index, 1)[0];
  }

  joinGroup(player: GuildMember, index: number): Group {
    let group = this.get(index);

    group.addPlayer(player);
    return group;
  }

  leaveGroup(player: Snowflake, index: number): Group {
    let group = this.get(index);

    group.removePlayer(player);
    return group;
  }

  export(): string {
    return JSON.stringify(this._cache);
  }

  import(data: string): Group[] {
    this._cache = JSON.parse(data);
    return this._cache;
  }
}
