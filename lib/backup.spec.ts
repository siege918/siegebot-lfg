import test from 'ava';

import { backup, restore } from './backup';

test('backup is a function', t => {
  t.assert(typeof backup === 'function');
});

test('restore is a function', t => {
  t.assert(typeof restore === 'function');
});
