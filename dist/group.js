"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
class Player {
    constructor(guildMember) {
        this.Id = guildMember.id;
        this.Tag = guildMember.user.tag;
        this.Mention = guildMember.toString();
    }
}
class Group {
    constructor(creator, gameName, maxPlayers, startTime, channel) {
        this.gameName = gameName;
        this.maxPlayers = maxPlayers;
        this.startTime = startTime;
        this.creator = new Player(creator);
        this.channel = channel;
        this.players = new Map();
        this.players.set(this.creator.Id, this.creator);
    }
    isFull() {
        return this.maxPlayers > 0 && this.players.size >= this.maxPlayers;
    }
    addPlayer(player) {
        if (this.isFull()) {
            throw new Error("You can't join a full group.");
        }
        if (this.players.has(player.id)) {
            throw new Error("You can't join a group that you're already in.");
        }
        this.players.set(player.id, new Player(player));
    }
    removePlayer(player) {
        if (!this.players.has(player)) {
            throw new Error("You can't leave a group that you're not in.");
        }
        this.players.delete(player);
    }
    print(doMention = false) {
        return (`    *Game*: ${this.gameName}
    *Created by*: ${this.creator.Tag}
    *Players*: ${[...this.players.values()].map(player => doMention ? player.Mention : player.Tag).join(', ')}
    *Start Time*: ${this.startTime.format(constants_1.DATE_FORMAT)} (${this.startTime.fromNow()})
    *Max Players*: ${this.maxPlayers || 'No Limit'}`);
    }
}
exports.Group = Group;
