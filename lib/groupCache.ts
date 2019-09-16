import { Group } from './group';
import { Snowflake, TextChannel, GuildMember } from 'discord.js';
import * as moment from 'moment';
import { generate as generateShortId } from 'shortid'

export class GroupCache {
  private _cache: Map<string, Group>;

  constructor() {
    this._cache = new Map<string, Group>();
  }

  has(id: string): boolean {
    return this._cache.has(id);
  }

  get(id: string): Group {
    let group = this._cache.get(id);

    if (!group) {
      throw new RangeError('The specified group does not exist.');
    }

    return group;
  }

  print(id: string, doMention: boolean = false): string {
    let group = this._cache.get(id);
    
    if (!group) {
      return '';
    }

    return (
`${group.print(doMention)}
*Join this group by typing '.join ${id}'
Leave this group by typing '.leave ${id}'*
`
    );
  }

  printAll(): string {
    return [...this._cache.keys()].map(
        (id: string) => this.print(id)
    ).join('\n---------------------------------\n\n');
  }

  get15MinuteGroups(): Group[] {
    let groups = [...this._cache.values()].filter(
      (group: Group) => !group.hasHad15MinuteUpdate && moment().add(15, 'minutes').isAfter(group.startTime)
    );

    groups.forEach((group) => {group.hasHad15MinuteUpdate = true});

    return groups;
  }

  getStartingGroups(): Group[] {
    let groups = [...this._cache.values()].filter(
      (group: Group) => !group.hasHadStartingUpdate && moment().isAfter(group.startTime)
    );

    groups.forEach((group) => {group.hasHadStartingUpdate = true});

    return groups;
  }

  housekeep() {
    for (let group of this._cache.values()) {
      if (group.hasHadStartingUpdate) {
        this._cache.delete(group.id);
      }
    }
  }

  create(
    creator: GuildMember,
    gameName: string,
    maxPlayers: number,
    startTime: moment.Moment,
    channel: Snowflake
  ): string {
    let id = '';

    do {
      id = generateShortId().substring(0, 4);
    } while (this.has(id))

    this._cache.set(id, new Group(id, creator, gameName, maxPlayers, startTime, channel))

    return id;
  }

  remove(creator: Snowflake, id: string): Group {
    let group = this.get(id);

    if (group.creator.Id !== creator) {
      throw new Error('Groups can only be removed by their creator.');
    }

    this._cache.delete(id)

    return group;
  }

  joinGroup(player: GuildMember, id: string): Group {
    let group = this.get(id);

    group.addPlayer(player);
    return group;
  }

  leaveGroup(player: Snowflake, id: string): Group {
    let group = this.get(id);

    group.removePlayer(player);
    return group;
  }

  export(): string {
    return JSON.stringify(this._cache);
  }

  import(data: string): Map<string, Group> {
    this._cache = JSON.parse(data);
    return this._cache;
  }
}
