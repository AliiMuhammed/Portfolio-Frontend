import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Skills from './Skills';
import {client} from '../../../Client';
import {getIcon, loadIcons} from '@iconify/react';
import {renderToStaticMarkup} from 'react-dom/server';
import {FaHtml5, FaCss3, FaReact, FaFigma, FaGitAlt} from 'react-icons/fa';
import {IoLogoJavascript} from 'react-icons/io5';
import {SiMui, SiRedux} from 'react-icons/si';
jest.mock('@iconify/react', () => ({...jest.requireActual('@iconify/react'), getIcon: jest.fn(), loadIcons: jest.fn()}));
jest.mock('../../../Client', () => ({client: {fetch: jest.fn()}}));
const record = {_id: 'react', name: 'React', category: 'Frontend', iconId: 'local:react', order: 1};
const response = skills => ({settings: {skillsManaged: true}, skills});
let root, container;
const render = async () => act(async () => root.render(<Skills />));
const names = () => [...container.querySelectorAll('.resume-skill-name')].map(e => e.textContent);
const remoteData = {body: '<path d="M0 0h24v24H0z"/>', width: 24, height: 24};
beforeEach(() => {getIcon.mockReset().mockReturnValue(remoteData); loadIcons.mockReset().mockImplementation((ids, callback) => {Promise.resolve().then(() => callback(ids, [], [])); return jest.fn();}); global.IS_REACT_ACT_ENVIRONMENT = true; client.fetch.mockReset().mockResolvedValue(response([record])); container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);});
afterEach(async () => {await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT;});
test('CMS skill names, categories and local SVG icons replace rather than duplicate the legacy list', async () => {
  await render(); expect(names()).toEqual(['React']); expect(container.querySelector('.resume-skill-category').textContent).toBe('Frontend');
  const icon = container.querySelector('.resume-skill-icon svg');
  expect(icon.parentElement.getAttribute('aria-hidden')).toBe('true'); expect(icon.getAttribute('focusable')).toBe('false');
  expect(container.querySelector('img')).toBeNull(); expect(loadIcons).not.toHaveBeenCalled();
  expect(client.fetch.mock.calls[0][0]).toContain('iconId, iconPackage, iconPath');
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
  client.fetch.mockResolvedValue(response([null, [], 'invalid', {name: {}}, {name: ' '}, {...record, iconId: null, category: {}}]));
  await render(); expect(names()).toEqual(['React']); expect(container.querySelector('img')).toBeNull(); expect(container.textContent).toContain('Category not listed'); expect(container.querySelector('.resume-skill-icon').textContent).toBe('◇');
});
const approvedIcons = [
  ['local:html5','react-icons/fa/FaHtml5','fa',FaHtml5], ['local:css3','react-icons/fa/FaCss3','fa',FaCss3],
  ['local:javascript','react-icons/io5/IoLogoJavascript','io5',IoLogoJavascript], ['local:react','react-icons/fa/FaReact','fa',FaReact],
  ['local:figma','react-icons/fa/FaFigma','fa',FaFigma], ['local:mui','react-icons/si/SiMui','si',SiMui],
  ['local:git','react-icons/fa/FaGitAlt','fa',FaGitAlt], ['local:redux','react-icons/si/SiRedux','si',SiRedux],
];
const expectIcon = Icon => {
  const expected = document.createElement('div'); expected.innerHTML = renderToStaticMarkup(<Icon />);
  expect(container.querySelector('.resume-skill-icon svg').innerHTML).toBe(expected.querySelector('svg').innerHTML);
};
test.each(approvedIcons)('%s renders the exact original component without remote requests', async (iconId, path, pkg, Icon) => {
  client.fetch.mockResolvedValue(response([{...record, iconId}])); await render(); expectIcon(Icon); expect(loadIcons).not.toHaveBeenCalled();
});
test.each(approvedIcons)('%s preserves its published legacy path', async (id, iconPath, iconPackage, Icon) => {
  client.fetch.mockResolvedValue(response([{...record, iconId: null, iconPath, iconPackage}])); await render(); expectIcon(Icon);
});
test('a future TypeScript skill renders trusted Iconify data without a new local mapping', async () => {
  client.fetch.mockResolvedValue(response([{_id:'future',name:'TypeScript',category:'Frontend',iconId:'simple-icons:typescript'}]));
  await render(); expect(names()).toEqual(['TypeScript']); expect(loadIcons.mock.calls[0][0]).toEqual(['simple-icons:typescript']);
  expect(container.querySelector('.resume-skill-icon svg')).not.toBeNull(); expect(container.querySelector('[data-icon-state]').getAttribute('data-icon-state')).toBe('ready');
  expect(container.querySelector('img, script, iframe')).toBeNull(); expect(container.textContent).toContain('Frontend');
});
test('modern local selection wins over legacy paths and uploaded image fields are ignored', async () => {
  client.fetch.mockResolvedValue(response([{...record, iconPath:'react-icons/fa/FaCss3',iconPackage:'fa',icon:{asset:{_ref:'image-old'}}}])); await render(); expectIcon(FaReact); expect(container.querySelector('img')).toBeNull();
});
test('remote failure retains the chosen modern ID and never substitutes a legacy icon', async () => {
  getIcon.mockReturnValue(undefined);
  client.fetch.mockResolvedValue(response([{...record,iconId:'simple-icons:python',iconPath:'react-icons/fa/FaReact',iconPackage:'fa'}]));
  await render(); expect(container.querySelector('.resume-skill-icon').textContent).toBe('◇'); expect(names()).toEqual(['React']);
  expect(container.querySelector('[data-icon-state]').getAttribute('data-icon-state')).toBe('unavailable'); expect(container.querySelector('svg')).toBeNull();
});
test('loading keeps a stable fallback and unmount cancels the icon subscription', async () => {
  let callback; const cancel = jest.fn(); loadIcons.mockImplementation((ids, cb) => {callback=cb;return cancel;});
  client.fetch.mockResolvedValue(response([{...record,iconId:'simple-icons:docker'}])); await render();
  expect(container.querySelector('[data-icon-state]').getAttribute('data-icon-state')).toBe('loading'); expect(container.querySelector('.resume-skill-icon').textContent).toBe('◇');
  await act(async () => root.render(null)); expect(cancel).toHaveBeenCalledTimes(1); await act(async () => callback([],[],[])); expect(container.textContent).toBe('');
});
test('malformed IDs may use only approved legacy references; unsupported strings cannot execute', async () => {
  client.fetch.mockResolvedValue(response([{...record,iconId:'invalid',iconPath:'react-icons/fa/FaHtml5'}])); await render(); expectIcon(FaHtml5);
});
test.each(['local:unknown','constructor','__proto__','<svg onload="alert(1)"/>','@evil:icon','https://evil/icon',{},['local:react']])('unsafe identifier %j renders a neutral fallback', async iconId => {
  client.fetch.mockResolvedValue(response([{...record,iconId,iconPath:'react-icons/fa/Unknown'}])); await render();
  expect(container.querySelector('.resume-skill-icon').textContent).toBe('◇'); expect(container.querySelector('svg, img, script')).toBeNull(); expect(loadIcons).not.toHaveBeenCalled();
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
