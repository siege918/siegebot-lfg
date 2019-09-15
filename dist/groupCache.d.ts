import { Group } from './group';
import { Snowflake, TextChannel, GuildMember } from 'discord.js';
import * as moment from 'moment';
export declare class GroupCache {
    private _cache;
    constructor();
    get(index: number): Group;
    print(index: number, doMention?: boolean): string;
    printAll(): string;
    get15MinuteGroups(): Group[];
    getStartingGroups(): Group[];
    housekeep(): void;
    create(creator: GuildMember, gameName: string, maxPlayers: number, startTime: moment.Moment, channel: TextChannel): number;
    remove(creator: Snowflake, index: number): Group;
    joinGroup(player: GuildMember, index: number): Group;
    leaveGroup(player: Snowflake, index: number): Group;
    export(): string;
    import(data: string): Group[];
}
