"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("./group");
const moment = require("moment");
const shortid_1 = require("shortid");
class GroupCache {
    constructor() {
        this._cache = new Map();
    }
    has(id) {
        return this._cache.has(id);
    }
    get(id) {
        let group = this._cache.get(id);
        if (!group) {
            throw new RangeError('The specified group does not exist.');
        }
        return group;
    }
    print(id, doMention = false) {
        let group = this._cache.get(id);
        if (!group) {
            return '';
        }
        return (`${group.print(doMention)}
*Join this group by typing '.join ${id}'
Leave this group by typing '.leave ${id}'*
`);
    }
    printAll() {
        return [...this._cache.keys()].map((id) => this.print(id)).join('\n---------------------------------\n\n');
    }
    get15MinuteGroups() {
        let groups = [...this._cache.values()].filter((group) => !group.hasHad15MinuteUpdate && moment().add(15, 'minutes').isAfter(group.startTime));
        groups.forEach((group) => { group.hasHad15MinuteUpdate = true; });
        return groups;
    }
    getStartingGroups() {
        let groups = [...this._cache.values()].filter((group) => !group.hasHadStartingUpdate && moment().isAfter(group.startTime));
        groups.forEach((group) => { group.hasHadStartingUpdate = true; });
        return groups;
    }
    housekeep() {
        for (let group of this._cache.values()) {
            if (group.hasHadStartingUpdate) {
                this._cache.delete(group.id);
            }
        }
    }
    create(creator, gameName, maxPlayers, startTime, channel) {
        let id = '';
        do {
            id = shortid_1.generate().substring(0, 4);
        } while (this.has(id));
        this._cache.set(id, new group_1.Group(id, creator, gameName, maxPlayers, startTime, channel));
        return id;
    }
    remove(creator, id) {
        let group = this.get(id);
        if (group.creator.Id !== creator) {
            throw new Error('Groups can only be removed by their creator.');
        }
        this._cache.delete(id);
        return group;
    }
    joinGroup(player, id) {
        let group = this.get(id);
        group.addPlayer(player);
        return group;
    }
    leaveGroup(player, id) {
        let group = this.get(id);
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
