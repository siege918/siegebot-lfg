import { Snowflake, GuildMember } from "discord.js";
import { Moment } from "moment";
export interface Player {
    Id: Snowflake;
    Tag: string;
    Mention: string;
}
export interface GroupParams {
    id: string;
    gameName: string;
    players: Map<Snowflake, Player>;
    maxPlayers: number;
    startTime: Date;
    creator: Player;
    channel: Snowflake;
    hasHad15MinuteUpdate?: boolean;
    hasHadStartingUpdate?: boolean;
}
export declare class Group implements GroupParams {
    id: string;
    gameName: string;
    players: Map<Snowflake, Player>;
    maxPlayers: number;
    startTime: Date;
    startTimeMoment: Moment;
    creator: Player;
    channel: Snowflake;
    hasHad15MinuteUpdate: boolean;
    hasHadStartingUpdate: boolean;
    constructor(data: GroupParams);
    isFull(): boolean;
    addPlayer(player: GuildMember): void;
    removePlayer(player: Snowflake): void;
    print(doMention?: boolean): string;
}
