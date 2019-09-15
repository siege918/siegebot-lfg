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
    remove(creator: Snowflake, index: number): void;
    joinGroup(player: Snowflake, index: number): void;
    leaveGroup(player: Snowflake, index: number): void;
    export(): string;
    import(data: string): Group[];
}
