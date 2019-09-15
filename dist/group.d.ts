import { Snowflake, Collection, GuildMember } from "discord.js";
import { Moment } from "moment";
export declare class Group {
    gameName: string;
    players: Set<Snowflake>;
    maxPlayers: number;
    startTime: Moment;
    creator: Snowflake;
    constructor(creator: string, gameName: string, maxPlayers: number, startTime: Moment);
    isFull(): boolean;
    addPlayer(player: Snowflake): void;
    removePlayer(player: Snowflake): void;
    print(users: Collection<Snowflake, GuildMember>): string;
}
