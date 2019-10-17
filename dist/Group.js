'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const moment = require('moment');
const constants_1 = require('./constants');
class Group {
  constructor(data) {
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
    this.players.set(player.id, {
      Id: player.id,
      Tag: player.user.tag,
      Mention: player.toString()
    });
  }
  removePlayer(player) {
    if (!this.players.has(player)) {
      throw new Error("You can't leave a group that you're not in.");
    }
    this.players.delete(player);
  }
  print(doMention = false) {
    return `    **ID: ${this.id}**
    *Game*: ${this.gameName}
    *Created by*: ${this.creator.Tag}
    *Players*: ${[...this.players.values()]
      .map(player => (doMention ? player.Mention : player.Tag))
      .join(', ')}
    *Start Time*: ${this.startTimeMoment.format(
      constants_1.DATE_FORMAT
    )} (${this.startTimeMoment.fromNow()})
    *Max Players*: ${this.maxPlayers || 'No Limit'}`;
  }
}
exports.default = Group;
