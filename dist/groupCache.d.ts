import { Group } from './group';
import { Snowflake, GuildMember } from 'discord.js';
import * as moment from 'moment';
export declare class GroupCache {
    private _cache;
    constructor();
    has(id: string): boolean;
    get(id: string): Group;
    print(id: string, doMention?: boolean): string;
    printAll(): string;
    get15MinuteGroups(): Group[];
    getStartingGroups(): Group[];
    housekeep(): void;
    create(creatorMember: GuildMember, gameName: string, maxPlayers: number, startTime: moment.Moment, channel: Snowflake): string;
    remove(creator: Snowflake, id: string): Group;
    joinGroup(player: GuildMember, id: string): Group;
    leaveGroup(player: Snowflake, id: string): Group;
    export(): string;
    import(data: string): Map<string, Group>;
}
