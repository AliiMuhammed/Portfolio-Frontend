import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Work from "./Work";
import { client, imageUrl } from "../../Client";
import { webLink } from "./components/WorkProjectCard";
import fs from "fs";
import path from "path";

jest.mock("../../Client", () => ({ client: { fetch: jest.fn() }, imageUrl: jest.fn() }));
jest.mock("react-player", () => function Player({ url, onReady }) {
  const React = require("react");
  React.useEffect(() => { onReady(); }, [onReady]);
  return <div data-testid="player" data-url={url}>Video player</div>;
});
const records = [
  { _id: "a", title: "BrandStore", description: "A fashion storefront", techStack: ["HTML5", "CSS3", "JavaScript"], imageurl: { asset: { _ref: "image-a" } }, link: "https://brand.example/", github: "https://github.com/AliiMuhammed/brand", video: "https://www.youtube.com/watch?v=real" },
  { _id: "b", title: "Portfolio", description: "Personal profile and selected projects", techStack: ["React", "Sanity", "JavaScript"], imageurl: { asset: { _ref: "image-b" } }, github: "https://github.com/AliiMuhammed/Portfolio-Frontend" },
  { _id: "c", title: "Recipe finder", description: "Browse meals", techStack: [" react ", "CSS3"], imageurl: null },
];
let container, root;
const render = async () => act(async () => root.render(<Work />));
const click = async element => act(async () => element.dispatchEvent(new MouseEvent("click", { bubbles: true })));
const change = async (element, value) => act(async () => {
  Object.getOwnPropertyDescriptor(element.tagName === "SELECT" ? HTMLSelectElement.prototype : HTMLInputElement.prototype, "value").set.call(element, value);
  element.dispatchEvent(new Event(element.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
});
const search = () => container.querySelector('#work-search');
const filter = () => container.querySelector('#work-technology');
const cards = () => [...container.querySelectorAll('article')];
const titles = () => cards().map(card => card.querySelector('h3').textContent);
const count = () => container.querySelector('.work-results [role="status"]').textContent;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  client.fetch.mockReset().mockResolvedValue(records);
  imageUrl.mockReset().mockImplementation(source => source?.asset?._ref ? `https://cdn.sanity.io/${source.asset._ref}.png` : undefined);
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test('one page H1, factual introduction and real hero actions remain available', async () => {
  await render(); expect(container.querySelectorAll('h1')).toHaveLength(1);
  expect(container.querySelector('h1').textContent).toBe('Built with curiosity.Made to work.');
  expect(container.querySelector('a[href="#work-projects"]')).not.toBeNull();
  expect(container.querySelector('a[href="https://github.com/AliiMuhammed"]')).not.toBeNull();
});
test('fetches all actual-shaped projects once in CMS order with cancellation signal', async () => {
  await render(); expect(titles()).toEqual(records.map(record => record.title));
  expect(client.fetch).toHaveBeenCalledTimes(1);
  expect(client.fetch.mock.calls[0][0]).toBe('*[_type=="work"]');
  expect(client.fetch.mock.calls[0][2].signal.aborted).toBe(false);
  expect(count()).toContain('Showing 3 of 3 projects');
});
test.each([['BrandStore', ['BrandStore']], ['fashion', ['BrandStore']], ['SANITY', ['Portfolio']], ['  personal   profile  ', ['Portfolio']]])('search matches title, description or technology with tolerant input: %s', async (query, expected) => {
  await render(); await change(search(), query); expect(titles()).toEqual(expected); expect(client.fetch).toHaveBeenCalledTimes(1);
});
test('derives deduplicated technologies from real tags only', async () => {
  await render(); expect([...filter().options].map(option => option.value)).toEqual(['', 'css3', 'html5', 'javascript', 'react', 'sanity']);
  expect(filter().options[0].textContent).toBe('All Projects');
  expect(container.textContent).not.toMatch(/enterprise|full-stack|commercial|AI expertise|%/);
});
test('technology selection is case-insensitive and visibly selected', async () => {
  await render(); await change(filter(), 'react'); expect(titles()).toEqual(['Portfolio', 'Recipe finder']);
  expect(filter().getAttribute('data-active')).toBe('true'); expect(count()).toContain('Showing 2 of 3 projects');
});
test('search and technology intersect; clearing search preserves selection and restores focus', async () => {
  await render(); await change(filter(), 'react'); await change(search(), 'profile'); expect(titles()).toEqual(['Portfolio']);
  await click(container.querySelector('button[aria-label="Clear search"]'));
  expect(filter().value).toBe('react'); expect(search().value).toBe(''); expect(titles()).toEqual(['Portfolio', 'Recipe finder']);
  expect(document.activeElement).toBe(search()); expect(client.fetch).toHaveBeenCalledTimes(1);
});
test('reset restores all projects and clears both controls', async () => {
  await render(); await change(filter(), 'react'); await change(search(), 'profile');
  await click(container.querySelector('.work-results button')); expect(search().value).toBe(''); expect(filter().value).toBe(''); expect(cards()).toHaveLength(3);
});
test('no matches has distinct feedback and a working all-projects reset', async () => {
  await render(); await change(search(), 'does not exist'); expect(cards()).toHaveLength(0); expect(count()).toContain('Showing 0 of 3');
  expect(container.textContent).toContain('No matching projects.'); await click(container.querySelector('.work-empty button')); expect(cards()).toHaveLength(3);
});
test('image alt text and missing/failed media have safe fallbacks', async () => {
  await render(); const image = cards()[0].querySelector('img'); expect(image.alt).toBe('BrandStore interface screenshot');
  expect(cards()[2].textContent).toContain('Project image unavailable');
  await act(async () => image.dispatchEvent(new Event('error'))); expect(cards()[0].querySelector('img')).toBeNull(); expect(cards()[0].textContent).toContain('Project image unavailable');
});
test('malformed records and optional fields never interrupt the grid', async () => {
  client.fetch.mockResolvedValue([null, [], 3, 'bad', { _id: 'missing', title: {}, description: [], techStack: ['React', ' React ', 4, null, {}], link: 'javascript:alert(1)', github: 'not a URL', video: '//example.com' }]);
  await render(); expect(cards()).toHaveLength(1); expect(titles()).toEqual(['Untitled project']);
  expect(cards()[0].textContent).toContain('Project description not provided'); expect(cards()[0].querySelectorAll('li')).toHaveLength(1);
  expect(cards()[0].querySelector('a, button')).toBeNull(); expect(cards()[0].textContent).toContain('Project links unavailable');
});
test('malformed technology lists do not introduce fake tags or options', async () => {
  client.fetch.mockResolvedValue([{ ...records[0], techStack: { React: true } }]); await render(); expect(filter().options).toHaveLength(1); expect(cards()[0].querySelector('ul')).toBeNull();
});
test('loading preserves hero and shows meaningful status', async () => {
  client.fetch.mockReturnValue(new Promise(() => {})); await render(); expect(container.querySelector('h1')).not.toBeNull(); expect(container.querySelector('[role="status"]').textContent).toContain('Loading projects');
});
test('request failure is distinct from no matches and empty content', async () => {
  client.fetch.mockRejectedValue(new Error('Offline')); await render(); expect(container.textContent).toContain('Unable to load projects'); expect(search()).toBeNull(); expect(container.textContent).not.toContain('No matching projects');
});
test.each([[[]], [{ unexpected: true }]])('empty or non-array response produces empty-CMS feedback', async response => {
  client.fetch.mockResolvedValue(response); await render(); expect(container.textContent).toContain('No projects published yet'); expect(cards()).toHaveLength(0);
});
test('request aborts on unmount and late data is ignored', async () => {
  let resolve; client.fetch.mockReturnValue(new Promise(r => { resolve = r; })); await render(); const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.unmount()); expect(signal.aborted).toBe(true); await act(async () => resolve(records)); expect(container.textContent).toBe(''); root = createRoot(container);
});
test('only valid web destinations are rendered with meaningful names and new-tab security', async () => {
  await render(); const link = cards()[0].querySelector('a'); expect(link.href).toBe(records[0].link); expect(link.getAttribute('aria-label')).toBe('Live demo of BrandStore'); expect(link.target).toBe('_blank'); expect(link.rel).toBe('noopener noreferrer');
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', 'https://', 'https://user:secret@example.com', '//example.com']) expect(webLink(url)).toBeUndefined();
  expect(webLink(' https://example.com/path ')).toBe('https://example.com/path');
});
test('valid project video opens the existing player and close unmounts playback with focus restoration', async () => {
  await render(); const button = cards()[0].querySelector('button'); button.focus(); await click(button);
  expect(document.querySelector('[role="dialog"]')).not.toBeNull(); expect(document.querySelector('[data-testid="player"]').dataset.url).toBe(records[0].video);
  await click(document.querySelector('button[aria-label="close"]'));
  expect(document.querySelector('[data-testid="player"]')).toBeNull(); expect(document.activeElement).toBe(button);
});
test('Escape dismisses the preserved video dialog', async () => {
  await render(); await click(cards()[0].querySelector('button'));
  await act(async () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(document.querySelector('[data-testid="player"]')).toBeNull();
});
test('search/filter semantics and responsive reduced-motion styles are present', async () => {
  await render(); expect(container.querySelector('label[for="work-search"]').textContent).toBe('Search projects'); expect(container.querySelector('label[for="work-technology"]')).not.toBeNull();
  expect(container.querySelector('.work-results [aria-live="polite"]')).not.toBeNull(); expect(cards()[0].hasAttribute('tabindex')).toBe(false);
  const css = fs.readFileSync(path.join(__dirname, 'style/work.css'), 'utf8');
  expect(css).toContain('repeat(2, minmax(0, 1fr))'); expect(css).toContain('grid-template-columns: 1fr'); expect(css).toContain('prefers-reduced-motion: reduce'); expect(css).toContain('min-height: 44px'); expect(css).toContain('object-fit: contain');
});
