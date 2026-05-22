import * as migration_20260521_182514 from './20260521_182514';
import * as migration_20260522_061348 from './20260522_061348';
import * as migration_20260522_071703 from './20260522_071703';
import * as migration_20260522_205528 from './20260522_205528';

export const migrations = [
  {
    up: migration_20260521_182514.up,
    down: migration_20260521_182514.down,
    name: '20260521_182514',
  },
  {
    up: migration_20260522_061348.up,
    down: migration_20260522_061348.down,
    name: '20260522_061348',
  },
  {
    up: migration_20260522_071703.up,
    down: migration_20260522_071703.down,
    name: '20260522_071703',
  },
  {
    up: migration_20260522_205528.up,
    down: migration_20260522_205528.down,
    name: '20260522_205528'
  },
];
