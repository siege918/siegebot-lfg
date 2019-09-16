import { Snowflake, TextChannel, GuildMember } from "discord.js";
import { Moment } from "moment";
import { DATE_FORMAT } from './constants';
import moment = require("moment");

interface Player {
    Id: Snowflake;
    Tag: string;
    Mention: string;
}

export class Group {
    public id: string;
    public gameName: string;
    public players: Map<Snowflake, Player>;
    public maxPlayers: number;
    public startTime: Moment;
    public creator: Player;
    public channel: Snowflake;
    public hasHad15MinuteUpdate: boolean;
    public hasHadStartingUpdate: boolean;

    constructor(id?: string, creator?: GuildMember, gameName?: string, maxPlayers?: number, startTime?: Moment, channel?: Snowflake) {
        this.id = id || "";
        this.gameName = gameName || "";
        this.maxPlayers = maxPlayers || 0;
        this.startTime = startTime || moment().add(25, 'years');
        this.creator = creator ? { Id: creator.id, Tag: creator.user.tag, Mention: creator.toString() } : {Id: '', Tag: '', Mention: ''};
        this.channel = channel || "";

        this.players = new Map<Snowflake, Player>();
        this.players.set(this.creator.Id, this.creator);
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
`    *ID*: ${this.id} 
    *Game*: ${this.gameName}
    *Created by*: ${this.creator.Tag}
    *Players*: ${[...this.players.values()].map(player => doMention ? player.Mention : player.Tag).join(', ')}
    *Start Time*: ${this.startTime.format(DATE_FORMAT)} (${this.startTime.fromNow()})
    *Max Players*: ${this.maxPlayers || 'No Limit'}`
        );
    }
}