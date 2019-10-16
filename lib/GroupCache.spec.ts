import test from 'ava';

import { Client, Guild, GuildMember } from 'discord.js';
import * as moment from 'moment';

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
  t.assert(parsed.jsondata instanceof Array);
  t.is(parsed.jsondata.length, 1);
  t.assert(parsed.jsondata[0] instanceof Array); // is a tuple
  t.assert(typeof parsed.jsondata[0][0] === 'string'); // has a key
  t.assert(typeof parsed.jsondata[0][1] === 'object'); // has a value
});
