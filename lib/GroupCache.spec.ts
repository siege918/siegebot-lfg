import test from 'ava';

import { Client, Guild, GuildMember } from 'discord.js';
import * as moment from 'moment';

import Group from './Group';
import GroupCache from './GroupCache';

test('exports the cache properly', t => {
  const cache = new GroupCache();
  const creator = new GuildMember(
    new Guild({} as Client, { id: 'test_guild_id', emojis: [] }),
    { user: { id: 'test_user_id' } }
  );

  cache.create(creator, 'test game', 6, moment(Date.now()), 'test channel');

  const parsed = JSON.parse(cache.export());

  t.is(parsed.jsontype, 'JSMap');
  t.deepEqual(parsed.metadata, { key: 'string', value: 'Group' });
  t.assert(parsed.jsondata instanceof Array);
  t.is(parsed.jsondata.length, 1);
  t.assert(parsed.jsondata[0] instanceof Array); // is a tuple
  t.assert(typeof parsed.jsondata[0][0] === 'string'); // has a key
  t.assert(typeof parsed.jsondata[0][1] === 'object'); // has a value
});

test('imports the cache properly', t => {
  const jsonifiedCache = {
    jsontype: 'JSMap',
    metadata: { key: 'string', value: 'Group' },
    jsondata: [
      [
        'EWhj',
        {
          id: 'EWhj',
          gameName: 'test game',
          players: {
            jsontype: 'JSMap',
            metadata: { key: 'string', value: 'object' },
            jsondata: [
              [
                'test_user_id',
                { Id: 'test_user_id', Mention: '<@test_user_id>' }
              ]
            ]
          },
          maxPlayers: 6,
          startTime: '2019-10-16T17:57:10.022Z',
          startTimeMoment: '2019-10-16T17:57:10.022Z',
          creator: { Id: 'test_user_id', Mention: '<@test_user_id>' },
          channel: 'test channel',
          hasHad15MinuteUpdate: false,
          hasHadStartingUpdate: false
        }
      ]
    ]
  };

  const cache = new GroupCache();
  cache.import(JSON.stringify(jsonifiedCache));

  t.assert(cache.get('EWhj') instanceof Group);
});
