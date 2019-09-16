import { Snowflake, TextChannel, GuildMember } from "discord.js";
import { Moment } from "moment";
import { DATE_FORMAT } from './constants';
import moment = require("moment");

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

export class Group implements GroupParams {
    public id: string;
    public gameName: string;
    public players: Map<Snowflake, Player>;
    public maxPlayers: number;
    public startTime: Date;
    public startTimeMoment: Moment;
    public creator: Player;
    public channel: Snowflake;
    public hasHad15MinuteUpdate: boolean;
    public hasHadStartingUpdate: boolean;

    constructor(data: GroupParams) {
        this.id = data.id;
        this.gameName = data.gameName;
        this.players = data.players;
        this.maxPlayers = data.maxPlayers;
        this.startTime = data.startTime;
        this.startTimeMoment = moment(this.startTime);
        this.creator = data.creator;
        this.channel = data.channel;
        this.hasHad15MinuteUpdate = !!data.hasHad15MinuteUpdate;
        this.hasHadStartingUpdate = !!data.hasHadStartingUpdate;
    }

    isFull(): boolean {
        return this.maxPlayers > 0 && this.players.size >= this.maxPlayers;
    }

    addPlayer(player: GuildMember) {
        if (this.isFull()) {
            throw new Error("You can't join a full group.");
        }

        if (this.players.has(player.id)) {
            throw new Error("You can't join a group that you're already in.");
        }

        this.players.set(player.id, { Id: player.id, Tag: player.user.tag, Mention: player.toString() });
    }

    removePlayer(player: Snowflake) {
        if (!this.players.has(player)) {
            throw new Error("You can't leave a group that you're not in.");
        }
        
        this.players.delete(player);
    }

    print(doMention: boolean = false): string {
        return (
`    **ID: ${this.id}** 
    *Game*: ${this.gameName}
    *Created by*: ${this.creator.Tag}
    *Players*: ${[...this.players.values()].map(player => doMention ? player.Mention : player.Tag).join(', ')}
    *Start Time*: ${this.startTimeMoment.format(DATE_FORMAT)} (${this.startTimeMoment.fromNow()})
    *Max Players*: ${this.maxPlayers || 'No Limit'}`
        );
    }
}