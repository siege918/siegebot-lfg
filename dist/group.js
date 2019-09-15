"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("./constants");
class Group {
    constructor(creator, gameName, maxPlayers, startTime) {
        this.gameName = gameName;
        this.maxPlayers = maxPlayers;
        this.startTime = startTime;
        this.creator = creator;
        this.players = new Set([creator]);
    }
    isFull() {
        return this.maxPlayers > 0 && this.players.size >= this.maxPlayers;
    }
    addPlayer(player) {
        if (this.isFull()) {
            throw new Error("You can't join a full group.");
        }
        if (this.players.has(player)) {
            throw new Error("You can't join a group that you're already in.");
        }
        this.players.add(player);
    }
    removePlayer(player) {
        if (!this.players.has(player)) {
            throw new Error("You can't leave a group that you're not in.");
        }
        this.players.delete(player);
    }
    print(users) {
        const getTag = (snowflake) => {
            const creatorMember = users.get(snowflake);
            return creatorMember ? creatorMember.user.tag : "Not found";
        };
        return (`    *Game*: ${this.gameName}
    *Created by*: ${getTag(this.creator)}
    *Players*: ${[...this.players].map(player => getTag(player)).join(', ')}
    *Start Time*: ${this.startTime.format(constants_1.DATE_FORMAT)} (${this.startTime.fromNow()})
    *Max Players*: ${this.maxPlayers || 'No Limit'}`);
    }
}
exports.Group = Group;
