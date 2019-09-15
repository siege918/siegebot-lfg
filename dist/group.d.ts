import { Snowflake, TextChannel, GuildMember } from "discord.js";
import { Moment } from "moment";
declare class Player {
    Id: Snowflake;
    Tag: string;
    Mention: string;
    constructor(guildMember: GuildMember);
}
export declare class Group {
    id: string;
    gameName: string;
    players: Map<Snowflake, Player>;
    maxPlayers: number;
    startTime: Moment;
    creator: Player;
    channel: TextChannel;
    hasHad15MinuteUpdate: boolean;
    hasHadStartingUpdate: boolean;
    constructor(id: string, creator: GuildMember, gameName: string, maxPlayers: number, startTime: Moment, channel: TextChannel);
    isFull(): boolean;
    addPlayer(player: GuildMember): void;
    removePlayer(player: Snowflake): void;
    print(doMention?: boolean): string;
}
export {};
