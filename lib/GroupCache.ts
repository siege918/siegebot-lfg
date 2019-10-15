import { GuildMember, Snowflake, TextChannel } from 'discord.js';
import * as moment from 'moment';
import { generate as generateShortId } from 'shortid';

import { Group, IGroupParams, IPlayer } from './Group';

export default class GroupCache {
  private cache: Map<string, Group>;

  constructor() {
    this.cache = new Map<string, Group>();
  }

  public has(id: string): boolean {
    return this.cache.has(id);
  }

  public get(id: string): Group {
    const group = this.cache.get(id);

    if (!group) {
      throw new RangeError('The specified group does not exist.');
    }

    return group;
  }

  public print(id: string, doMention: boolean = false): string {
    const group = this.cache.get(id);

    if (!group) {
      return '';
    }

    return `${group.print(doMention)}
*Join this group by typing* \`\`\`.join ${id}\`\`\`
*Leave this group by typing* \`\`\`.leave ${id}\`\`\`
`;
  }

  public printAll(): string {
    return [...this.cache.keys()]
      .map((id: string) => this.print(id))
      .join('\n---------------------------------\n\n');
  }

  public get15MinuteGroups(): Group[] {
    const groups = [...this.cache.values()].filter(
      (group: Group) =>
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

  public getStartingGroups(): Group[] {
    const groups = [...this.cache.values()].filter(
      (group: Group) =>
        !group.hasHadStartingUpdate && moment().isAfter(group.startTime)
    );

    groups.forEach(group => {
      group.hasHadStartingUpdate = true;
    });

    return groups;
  }

  public housekeep() {
    for (const group of this.cache.values()) {
      if (group.hasHadStartingUpdate) {
        this.cache.delete(group.id);
      }
    }
  }

  public create(
    creatorMember: GuildMember,
    gameName: string,
    maxPlayers: number,
    startTime: moment.Moment,
    channel: Snowflake
  ): string {
    let id = '';

    do {
      id = generateShortId().substring(0, 4);
    } while (this.has(id));

    const creator = {
      Id: creatorMember.id,
      Tag: creatorMember.user.tag,
      Mention: creatorMember.toString()
    };

    const players = new Map();
    players.set(creatorMember.id, creator);

    const groupData: IGroupParams = {
      id,
      gameName,
      players,
      maxPlayers,
      startTime: startTime.toDate(),
      creator,
      channel
    };

    this.cache.set(id, new Group(groupData));

    return id;
  }

  public remove(creator: Snowflake, id: string): Group {
    const group = this.get(id);

    if (group.creator.Id !== creator) {
      throw new Error('Groups can only be removed by their creator.');
    }

    this.cache.delete(id);

    return group;
  }

  public joinGroup(player: GuildMember, id: string): Group {
    const group = this.get(id);

    group.addPlayer(player);
    return group;
  }

  public leaveGroup(player: Snowflake, id: string): Group {
    const group = this.get(id);

    group.removePlayer(player);
    return group;
  }

  public export(): string {
    return JSON.stringify(this.cache, this.exportReplacer);
  }

  public import(data: string): Map<string, Group> {
    const importData = new Map<Snowflake, IGroupParams>(
      JSON.parse(data, this.importReviver)
    );
    const newCache = new Map<Snowflake, Group>();

    for (const key of importData.keys()) {
      const importDatum = importData.get(key);

      if (importDatum) {
        if (
          importDatum.players &&
          typeof importDatum.players[Symbol.iterator] === 'function'
        ) {
          importDatum.players = new Map<Snowflake, IPlayer>(
            importDatum.players
          );
        } else {
          importDatum.players = new Map<Snowflake, IPlayer>();
        }

        newCache.set(key, new Group(importDatum));
      }
    }

    this.cache = newCache;
    return this.cache;
  }

  private exportReplacer(key: string, value: any): any {
    switch (true) {
      case value instanceof Map:
        return {
          jsontype: 'JSMap',
          jsondata: [...(value as Map<any, any>).entries()]
        };
      default:
        return value;
    }
  }

  private importReviver(key: string, value: any): any {
    if (!value.jsontype) {
      return value;
    }

    switch (value.jsontype) {
      case 'JSMap':
        return new Map<any, any>(value.jsondata);
      default:
        return value;
    }
  }
}
