import { Group } from './group';
import { Snowflake, Collection, GuildMember } from 'discord.js';
import * as moment from 'moment';
export declare class GroupCache {
    private _cache;
    constructor();
    get(index: number): Group;
    print(users: Collection<Snowflake, GuildMember>, index: number): string;
    printAll(users: Collection<Snowflake, GuildMember>): string;
    create(creator: Snowflake, gameName: string, maxPlayers: number, startTime: moment.Moment): number;
    remove(creator: Snowflake, index: number): Group;
    joinGroup(player: Snowflake, index: number): Group;
    leaveGroup(player: Snowflake, index: number): Group;
    export(): string;
    import(data: string): Group[];
}
