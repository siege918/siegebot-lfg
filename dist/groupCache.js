"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("./group");
class GroupCache {
    constructor() {
        this._cache = [];
    }
    get(index) {
        let group = this._cache[index];
        if (!group) {
            throw new RangeError('The specified group does not exist.');
        }
        return group;
    }
    print(users, index) {
        return `**Group Number ${index}**
    ${this._cache[index].print(users)}
    *Join this group by typing '.join ${index}'
    Leave this group by typing '.leave ${index}'*`;
    }
    printAll(users) {
        return this._cache.map((group, index) => this.print(users, index)).join('\n---------------------------------\n');
    }
    create(creator, gameName, maxPlayers, startTime) {
        return (this._cache.push(new group_1.Group(creator, gameName, maxPlayers, startTime)) - 1);
    }
    remove(creator, index) {
        let group = this.get(index);
        if (group.creator !== creator) {
            throw new Error('Groups can only be removed by their creator.');
        }
        this._cache.splice(index, 1);
    }
    joinGroup(player, index) {
        let group = this.get(index);
        group.addPlayer(player);
    }
    leaveGroup(player, index) {
        let group = this.get(index);
        group.removePlayer(player);
    }
    export() {
        return JSON.stringify(this._cache);
    }
    import(data) {
        this._cache = JSON.parse(data);
        return this._cache;
    }
}
exports.GroupCache = GroupCache;
