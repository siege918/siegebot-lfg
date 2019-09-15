"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("./group");
const moment = require("moment");
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
    print(index, doMention = false) {
        return (`**Group Number ${index}**
${this._cache[index].print(doMention)}
*Join this group by typing '.join ${index}'
Leave this group by typing '.leave ${index}'*
`);
    }
    printAll() {
        return this._cache.map((group, index) => this.print(index)).join('\n---------------------------------\n\n');
    }
    get15MinuteGroups() {
        let groups = this._cache.filter((group) => !group.hasHad15MinuteUpdate && moment().add(15, 'minutes').isAfter(group.startTime));
        groups.forEach((group) => { group.hasHad15MinuteUpdate = true; });
        return groups;
    }
    getStartingGroups() {
        let groups = this._cache.filter((group) => !group.hasHadStartingUpdate && moment().isAfter(group.startTime));
        groups.forEach((group) => { group.hasHadStartingUpdate = true; });
        return groups;
    }
    housekeep() {
        this._cache = this._cache.filter((group) => !group.hasHadStartingUpdate);
    }
    create(creator, gameName, maxPlayers, startTime, channel) {
        return (this._cache.push(new group_1.Group(creator, gameName, maxPlayers, startTime, channel)) - 1);
    }
    remove(creator, index) {
        let group = this.get(index);
        if (group.creator.Id !== creator) {
            throw new Error('Groups can only be removed by their creator.');
        }
        return this._cache.splice(index, 1)[0];
    }
    joinGroup(player, index) {
        let group = this.get(index);
        group.addPlayer(player);
        return group;
    }
    leaveGroup(player, index) {
        let group = this.get(index);
        group.removePlayer(player);
        return group;
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
