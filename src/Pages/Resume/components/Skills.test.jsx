import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Skills from './Skills';
import {client} from '../../../Client';
jest.mock('../../../Client', () => ({client: {fetch: jest.fn()}, imageUrl: source => source?.asset?._ref ? 'https://cdn.sanity.io/icon.png' : undefined}));
const record = {_id: 'react', name: 'React', category: 'Frontend', icon: {asset: {_ref: 'image-react'}}, order: 1};
const response = skills => ({settings: {skillsManaged: true}, skills});
let root, container;
const render = async () => act(async () => root.render(<Skills />));
const names = () => [...container.querySelectorAll('.resume-skill-name')].map(e => e.textContent);
beforeEach(() => {global.IS_REACT_ACT_ENVIRONMENT = true; client.fetch.mockReset().mockResolvedValue(response([record])); container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);});
afterEach(async () => {await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT;});
test('CMS skill names, categories and uploaded icons replace rather than duplicate the legacy list', async () => {
  await render(); expect(names()).toEqual(['React']); expect(container.querySelector('.resume-skill-category').textContent).toBe('Frontend');
  const icon = container.querySelector('.resume-skill-icon img'); expect(icon.src).toBe('https://cdn.sanity.io/icon.png?w=64&h=64&fit=max&auto=format'); expect(icon.alt).toBe(''); expect(icon.parentElement.getAttribute('aria-hidden')).toBe('true'); expect(icon.width).toBe(30);
  expect(container.querySelector('button, [tabindex]')).toBeNull(); expect(client.fetch).toHaveBeenCalledTimes(1);
});
test('unactivated migration retains exactly eight approved skills even when older incomplete CMS records exist', async () => {
  client.fetch.mockResolvedValue({settings: null, skills: [{name: 'Older record'}]}); await render();
  expect(names()).toEqual(['HTML5','CSS3','JavaScript','React','Figma','Material UI','Git','Redux']);
  expect(container.textContent).not.toContain('Older record');
});
test('intentionally deleting all CMS skills after activation never restores the legacy list', async () => {
  client.fetch.mockResolvedValue(response([])); await render(); expect(names()).toEqual([]); expect(container.textContent).toContain('No skills published yet');
});
test('sorting is stable with explicit orders first and absent or malformed orders sorted by name then ID', async () => {
  client.fetch.mockResolvedValue(response([{...record, _id: 'z', name: 'Zed', order: null}, {...record, _id: 'b', name: 'Beta', order: 2}, {...record, _id: 'a', name: 'Alpha', order: 'bad'}, record]));
  await render(); expect(names()).toEqual(['React','Beta','Alpha','Zed']);
});
test('missing icon/category and malformed records have readable safe fallbacks', async () => {
  client.fetch.mockResolvedValue(response([null, [], 'invalid', {name: {}}, {name: ' '}, {...record, icon: null, category: {}}]));
  await render(); expect(names()).toEqual(['React']); expect(container.querySelector('img')).toBeNull(); expect(container.textContent).toContain('Category not listed'); expect(container.querySelector('.resume-skill-icon').textContent).toBe('◇');
});
test('failed icon loading falls back without hiding the name or category', async () => {
  await render(); await act(async () => container.querySelector('img').dispatchEvent(new Event('error')));
  expect(container.querySelector('img')).toBeNull(); expect(names()).toEqual(['React']); expect(container.textContent).toContain('Frontend');
});
test('loading and network failure are announced without resurrecting unverified legacy data', async () => {
  let reject; client.fetch.mockReturnValue(new Promise((resolve, r) => {reject = r;})); await render();
  expect(container.querySelector('[role="status"]').textContent).toContain('Loading skills');
  await act(async () => reject(new Error('offline'))); expect(container.textContent).toContain('Unable to load skills'); expect(names()).toEqual([]);
});
test('unmount aborts CMS reads and ignores late results', async () => {
  let resolve; client.fetch.mockReturnValue(new Promise(r => {resolve = r;})); await render(); const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.render(null)); expect(signal.aborted).toBe(true);
  await act(async () => resolve(response([record]))); expect(container.textContent).toBe('');
});
