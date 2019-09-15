import { Group } from './group';
import { Snowflake, Collection, Channel, GuildMember } from 'discord.js';
import * as moment from 'moment';

export class GroupCache {
  private _cache: Group[];

  constructor() {
    this._cache = [];
  }

  get(index: number) {
    let group = this._cache[index];

    if (!group) {
      throw new RangeError('The specified group does not exist.');
    }

    return group;
  }

  print(users: Collection<Snowflake, GuildMember>, index: number) {
    return `**Group Number ${index}**
    ${this._cache[index].print(users)}
    *Join this group by typing '.join ${index}'
    Leave this group by typing '.leave ${index}'*`;
  }

  printAll(users: Collection<Snowflake, GuildMember>) {
    return this._cache.map(
        (group: Group, index) => this.print(users, index)
    ).join('\n---------------------------------\n');
  }

  create(
    creator: Snowflake,
    gameName: string,
    maxPlayers: number,
    startTime: moment.Moment
  ): number {
    return (
      this._cache.push(new Group(creator, gameName, maxPlayers, startTime)) - 1
    );
  }

  remove(creator: Snowflake, index: number) {
    let group = this.get(index);

    if (group.creator !== creator) {
      throw new Error('Groups can only be removed by their creator.');
    }

    this._cache.splice(index, 1);
  }

  joinGroup(player: Snowflake, index: number) {
    let group = this.get(index);

    group.addPlayer(player);
  }

  leaveGroup(player: Snowflake, index: number) {
    let group = this.get(index);

    group.removePlayer(player);
  }

  export(): string {
    return JSON.stringify(this._cache);
  }

  import(data: string): Group[] {
    this._cache = JSON.parse(data);
    return this._cache;
  }
}
