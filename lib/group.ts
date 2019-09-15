import { Snowflake, Collection, GuildMember } from "discord.js";
import { Moment } from "moment";
import { DATE_FORMAT } from './constants';

export class Group {
    public gameName: string;
    public players: Set<Snowflake>;
    public maxPlayers: number;
    public startTime: Moment;
    public creator: Snowflake;

    constructor(creator: string, gameName: string, maxPlayers: number, startTime: Moment) {
        this.gameName = gameName;
        this.maxPlayers = maxPlayers;
        this.startTime = startTime;
        this.creator = creator;

        this.players = new Set([creator]);
    }

    isFull(): boolean {
        return this.maxPlayers > 0 && this.players.size <= this.maxPlayers;
    }

    addPlayer(player: Snowflake) {
        if (this.isFull()) {
            throw new Error("You can't join a full group.");
        }

        if (this.players.has(player)) {
            throw new Error("You can't join a group that you're already in.");
        }

        this.players.add(player);
    }

    removePlayer(player: Snowflake) {
        if (!this.players.has(player)) {
            throw new Error("You can't leave a group that you're not in.");
        }
        
        this.players.delete(player);
    }

    print(users: Collection<Snowflake, GuildMember>): string {
        const getTag = (snowflake: Snowflake) => {
            const creatorMember = users.get(snowflake);
            return creatorMember ? creatorMember.user.tag : "Not found";
        }

        return `*Created by*: ${getTag(this.creator)}
        *Players*: ${[...this.players].map(player => getTag(player)).join(', ')}
        *Start Time*: ${this.startTime.format(DATE_FORMAT)}
        *Max Players*: ${this.players || 'No Limit'}`
    }
}