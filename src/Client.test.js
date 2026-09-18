let client, imageUrl, urlFor;
const originalProject = process.env.REACT_APP_SANITY_PROJECT_ID;
const originalDataset = process.env.REACT_APP_SANITY_DATASET;

beforeAll(() => {
  process.env.REACT_APP_SANITY_PROJECT_ID = 'testproject';
  process.env.REACT_APP_SANITY_DATASET = 'production';
  ({ client, imageUrl, urlFor } = require('./Client'));
});

afterAll(() => {
  for (const [key, value] of [
    ['REACT_APP_SANITY_PROJECT_ID', originalProject],
    ['REACT_APP_SANITY_DATASET', originalDataset],
  ]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('uses public read configuration without a token', () => {
  expect(client.config()).toMatchObject({
    apiVersion: '2024-01-01',
    useCdn: true,
  });
  expect(client.config().token).toBeUndefined();
});

test('preserves the chainable image builder API', () => {
  const source = { asset: { _ref: 'image-abc123-100x80-png' } };
  expect(urlFor(source).width(40).url()).toContain('abc123-100x80.png?w=40');
  expect(imageUrl(source)).toContain('abc123-100x80.png');
});

test.each([undefined, null, {}, { asset: {} }, { asset: { _ref: 'invalid' } }])(
  'handles missing or malformed images: %p',
  (source) => expect(imageUrl(source)).toBeUndefined()
);
