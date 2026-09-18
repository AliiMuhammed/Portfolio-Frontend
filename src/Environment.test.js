import { spawnSync } from 'child_process';
import path from 'path';

const guard = path.resolve(__dirname, '../scripts/check-client-env.cjs');

test.each(['production', 'development'])('rejects a browser token in %s without logging its value', (mode) => {
  const sentinel = 'synthetic-test-credential';
  const result = spawnSync(process.execPath, [guard, mode], {
    env: { ...process.env, REACT_APP_SANITY_TOKEN: sentinel },
    encoding: 'utf8',
  });
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('Remove the legacy Sanity token variable');
  expect(result.stdout + result.stderr).not.toContain(sentinel);
});

test('accepts a token-free frontend environment', () => {
  const result = spawnSync(process.execPath, [guard, 'production'], {
    env: { ...process.env, REACT_APP_SANITY_TOKEN: '' },
    encoding: 'utf8',
  });
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(0);
});
