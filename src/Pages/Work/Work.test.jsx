import React, { act } from "react";
import { createRoot } from "react-dom/client";
import Work from "./Work";
import { client, imageUrl } from "../../Client";
import { webLink } from "./components/WorkProjectCard";
import fs from "fs";
import path from "path";

jest.mock("../../Client", () => ({ client: { fetch: jest.fn() }, imageUrl: jest.fn() }));
let mockPlayerReady = true;
jest.mock("react-player", () => function Player({ url, onReady, onError }) {
  const React = require("react");
  React.useEffect(() => { if (mockPlayerReady) onReady(); }, [onReady]);
  return <div data-testid="player" data-url={url}>Video player<button data-testid="player-error" onClick={onError}>Simulate provider error</button></div>;
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
  mockPlayerReady = true;
  client.fetch.mockReset().mockResolvedValue(records);
  imageUrl.mockReset().mockImplementation(source => source?.asset?._ref ? `https://cdn.sanity.io/${source.asset._ref}.png` : undefined);
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });

test('one page H1, factual introduction and real hero actions remain available', async () => {
  await render(); expect(container.querySelectorAll('h1')).toHaveLength(1);
  expect(container.querySelector('h1').textContent).toBe('Built with curiosity. Made to work.');
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
  expect(cards()[0].querySelector('a')).toBeNull(); expect(cards()[0].querySelector('button').getAttribute('aria-label')).toBe('View details of Untitled project'); expect(cards()[0].textContent).toContain('Project links unavailable');
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

const spotlight = () => container.querySelector('.work-showcase');
const featuredTitle = () => spotlight().querySelector('h2').textContent;
const namedButton = label => container.querySelector(`button[aria-label="${label}"]`);
test('featured BrandStore preference is independent of CMS ordering and does not fetch twice', async () => {
  client.fetch.mockResolvedValue([records[1], records[0], records[2]]); await render();
  expect(featuredTitle()).toBe('BrandStore'); expect(spotlight().textContent).toContain('02 of 3');
  expect(titles()).toEqual(['Portfolio', 'BrandStore', 'Recipe finder']); expect(client.fetch).toHaveBeenCalledTimes(1);
});
test('featured project falls back to the first actual record', async () => {
  client.fetch.mockResolvedValue(records.slice(1)); await render(); expect(featuredTitle()).toBe('Portfolio'); expect(spotlight().textContent).toContain('01 of 2');
});
test('next and previous update title, screenshot, tags and selection count consistently', async () => {
  await render(); const next = namedButton('Next featured project'); next.focus(); await click(next);
  expect(featuredTitle()).toBe('Portfolio'); expect(spotlight().querySelector('img').src).toContain('image-b'); expect(spotlight().textContent).toContain('Sanity'); expect(spotlight().textContent).toContain('02 of 3'); expect(document.activeElement).toBe(next);
  await click(namedButton('Previous featured project')); expect(featuredTitle()).toBe('BrandStore'); expect(spotlight().querySelector('img').src).toContain('image-a');
});
test('featured navigation wraps without autoplay or another CMS request', async () => {
  await render(); await click(namedButton('Previous featured project')); expect(featuredTitle()).toBe('Recipe finder');
  await click(namedButton('Next featured project')); expect(featuredTitle()).toBe('BrandStore'); expect(client.fetch).toHaveBeenCalledTimes(1);
});
test('one project has disabled previous and next controls and factual count', async () => {
  client.fetch.mockResolvedValue([records[0]]); await render(); expect(namedButton('Previous featured project').disabled).toBe(true); expect(namedButton('Next featured project').disabled).toBe(true); expect(spotlight().textContent).toContain('01 of 1');
});
test('featured failed-image state resets on selection and missing media has a fallback', async () => {
  await render(); await act(async () => spotlight().querySelector('img').dispatchEvent(new Event('error')));
  expect(spotlight().querySelector('img')).toBeNull(); await click(namedButton('Next featured project')); expect(spotlight().querySelector('img')).not.toBeNull();
  await click(namedButton('Next featured project')); expect(spotlight().querySelector('img')).toBeNull(); expect(spotlight().textContent).toContain('Project image unavailable');
});
test.each([['loading', 'Loading the project showcase'], ['error', 'currently unavailable'], ['empty', 'New projects will appear']])('hero remains useful in %s state', async (state, message) => {
  if (state === 'loading') client.fetch.mockReturnValue(new Promise(() => {}));
  if (state === 'error') client.fetch.mockRejectedValue(new Error('Offline'));
  if (state === 'empty') client.fetch.mockResolvedValue([]);
  await render(); expect(spotlight()).toBeNull(); expect(container.querySelector('.work-showcase-placeholder').textContent).toContain(message); expect(container.querySelector('h1')).not.toBeNull();
});
test('search and filtering leave the independent featured selection unchanged', async () => {
  await render(); await click(namedButton('Next featured project')); await change(search(), 'fashion'); expect(titles()).toEqual(['BrandStore']); expect(featuredTitle()).toBe('Portfolio');
  await change(filter(), 'react'); expect(titles()).toEqual([]); expect(featuredTitle()).toBe('Portfolio');
});
test('featured exploration opens a named factual detail dialog and restores focus on close', async () => {
  await render(); const button = spotlight().querySelector('.work-explore'); button.focus(); await click(button);
  const dialog = document.querySelector('[role="dialog"]'); expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toBe('BrandStore');
  expect(dialog.textContent).toContain(records[0].description); expect(dialog.querySelector('img').alt).toBe('BrandStore interface screenshot'); expect(dialog.querySelector('a').href).toBe(records[0].link);
  expect(document.activeElement.getAttribute('aria-label')).toBe('Close project details'); await click(document.querySelector('[aria-label="Close project details"]')); expect(document.activeElement).toBe(button);
});
test('details from grid retain the selected project rather than featured project and Escape closes', async () => {
  await render(); const button = namedButton('View details of Portfolio'); button.focus(); await click(button);
  const dialog = document.querySelector('[role="dialog"]'); expect(dialog.textContent).toContain('Personal profile and selected projects'); expect(dialog.textContent).not.toContain('A fashion storefront');
  await act(async () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))); expect(document.activeElement).toBe(button);
});
test('detail missing fields and unsafe destinations have neutral fallbacks', async () => {
  client.fetch.mockResolvedValue([{ title: null, link: 'javascript:alert(1)' }]); await render(); await click(spotlight().querySelector('.work-explore'));
  const dialog = document.querySelector('[role="dialog"]'); expect(dialog.textContent).toContain('Untitled project'); expect(dialog.textContent).toContain('Project description not provided'); expect(dialog.textContent).toContain('Project image unavailable'); expect(dialog.querySelector('a')).toBeNull();
});
test('detail image failure keeps title and factual content accessible', async () => {
  await render(); await click(spotlight().querySelector('.work-explore')); const dialog = document.querySelector('[role="dialog"]');
  await act(async () => dialog.querySelector('img').dispatchEvent(new Event('error'))); expect(dialog.querySelector('img')).toBeNull(); expect(dialog.textContent).toContain('Project image unavailable'); expect(dialog.textContent).toContain('A fashion storefront');
});
test('video dialog has project context, autofocus and background isolation', async () => {
  await render(); await click(namedButton('Play video of BrandStore')); const dialog = document.querySelector('[role="dialog"]');
  expect(dialog.getAttribute('aria-modal')).toBe('true'); expect(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent).toBe('BrandStore'); expect(document.activeElement.getAttribute('aria-label')).toBe('close'); expect(container.getAttribute('aria-hidden')).toBe('true');
});
test('video loading feedback remains visible until the provider is ready', async () => {
  mockPlayerReady = false; await render(); await click(namedButton('Play video of BrandStore')); expect(document.querySelector('.work-video-state').textContent).toContain('Loading project video'); expect(document.querySelector('[data-testid="player"]')).not.toBeNull();
});
test('provider failure stops loading, unmounts the player and displays clear feedback', async () => {
  mockPlayerReady = false; await render(); await click(namedButton('Play video of BrandStore')); await click(document.querySelector('[data-testid="player-error"]'));
  expect(document.querySelector('[role="alert"]').textContent).toContain('Unable to load this video'); expect(document.querySelector('[data-testid="player"]')).toBeNull(); expect(document.querySelector('.work-video-state').textContent).not.toContain('Loading project video');
});
test('rapid video reopen resets provider error and loading state', async () => {
  mockPlayerReady = false; await render(); const button = namedButton('Play video of BrandStore'); await click(button); await click(document.querySelector('[data-testid="player-error"]')); await click(document.querySelector('[aria-label="close"]')); await click(button);
  expect(document.querySelector('[role="alert"]')).toBeNull(); expect(document.querySelector('.work-video-state').textContent).toContain('Loading project video');
});
test('showcase and dialogs have responsive containment and reduced-motion styles', async () => {
  await render(); expect(spotlight().getAttribute('aria-label')).toBe('Featured projects'); expect(spotlight().querySelector('[aria-live="polite"]')).not.toBeNull();
  const css = fs.readFileSync(path.join(__dirname, 'style/work.css'), 'utf8'); expect(css).toContain('.work-dialog .MuiDialog-paper'); expect(css).toContain('.work-video-frame { aspect-ratio: 16 / 9'); expect(css).toContain('.work-showcase-controls button, .work-dialog a, .work-dialog button { transition: none; }');
});

test('a stalled video provider has a bounded loading state', async () => {
  mockPlayerReady = false; await render(); jest.useFakeTimers();
  try {
    await click(namedButton('Play video of BrandStore'));
    await act(async () => jest.advanceTimersByTime(30000));
    expect(document.querySelector('[role="alert"]').textContent).toContain('Unable to load this video'); expect(document.querySelector('[data-testid="player"]')).toBeNull();
  } finally { jest.useRealTimers(); }
});

test('Work footer preserves the Home and Resume identity and real destinations', async () => {
  await render(); const footer = container.querySelector('footer');
  expect(footer.textContent).toContain(`© ${new Date().getFullYear()} Ali Muhammed · Software Engineer`);
  expect([...footer.querySelectorAll('a')].map(link => link.getAttribute('href'))).toEqual(['#work-main', 'https://github.com/AliiMuhammed', 'https://www.linkedin.com/in/ali-muhammed-dev/']);
  expect(container.querySelector(footer.querySelector('a').getAttribute('href'))).not.toBeNull();
  expect([...footer.querySelectorAll('a span')].every(icon => icon.getAttribute('aria-hidden') === 'true')).toBe(true);
});

test('hero wording is structured as three colored lines within one H1', async () => {
  await render(); const heading = container.querySelector('h1');
  expect([...heading.children].map(line => line.textContent)).toEqual(['Built with', 'curiosity.', 'Made to work.']);
  expect(heading.textContent).toBe('Built with curiosity. Made to work.');
  expect(heading.children[1].className).toBe('work-heading-mint'); expect(heading.children[2].className).toBe('work-heading-purple');
  expect(container.querySelectorAll('h1')).toHaveLength(1);
});
test('circular project badge mirrors the real index without duplicate announcements', async () => {
  client.fetch.mockResolvedValue([records[1], records[0], records[2]]); await render();
  const badge = () => spotlight().querySelector('.work-project-badge');
  expect(badge().querySelector('strong').textContent).toBe('02'); expect(badge().querySelector('span').textContent).toBe('OF 3'); expect(badge().getAttribute('aria-hidden')).toBe('true');
  expect(spotlight().querySelector('[aria-live="polite"]').textContent).toContain('02 of 3');
  await click(namedButton('Next featured project')); expect(badge().querySelector('strong').textContent).toBe('03'); expect(featuredTitle()).toBe('Recipe finder');
  await click(namedButton('Next featured project')); expect(badge().querySelector('strong').textContent).toBe('01'); expect(featuredTitle()).toBe('Portfolio');
});
test('one-record showcase badge remains factual and controls remain disabled', async () => {
  client.fetch.mockResolvedValue([records[0]]); await render(); expect(spotlight().querySelector('.work-project-badge').textContent).toBe('01OF 1'); expect(namedButton('Next featured project').disabled).toBe(true); expect(namedButton('Previous featured project').disabled).toBe(true);
});
test('overlay context, footer tags and exploration belong to the same selected project', async () => {
  await render(); await click(namedButton('Next featured project'));
  expect(spotlight().querySelector('.work-showcase-stage h2').textContent).toBe('Portfolio');
  expect([...spotlight().querySelectorAll('.work-showcase-footer li')].map(tag => tag.textContent)).toEqual(records[1].techStack);
  await click(spotlight().querySelector('.work-explore')); expect(document.querySelector('[role="dialog"]').textContent).toContain(records[1].description);
});
test('technical ticker announces supported labels only once and keeps copies decorative', async () => {
  await render(); const ticker = container.querySelector('.work-ticker'); const groups = [...ticker.querySelectorAll('ul')];
  expect(groups).toHaveLength(4); expect(groups[0].hasAttribute('aria-hidden')).toBe(false); expect(groups.slice(1).every(group => group.getAttribute('aria-hidden') === 'true')).toBe(true);
  const labels = [...groups[0].querySelectorAll('span')].map(label => label.textContent);
  expect(labels).toEqual(['React interfaces', 'JavaScript', 'HTML & CSS', 'Frontend development', 'User interfaces']);
  for (const group of groups) expect([...group.querySelectorAll('span')].map(label => label.textContent)).toEqual(labels);
  expect(ticker.tabIndex).toBe(0); expect(ticker.getAttribute('aria-label')).toContain('pauses on focus'); expect(ticker.textContent).not.toMatch(/expert|proficiency|full-stack|AI engineering/i);
  expect([...ticker.querySelectorAll('i')].every(separator => separator.getAttribute('aria-hidden') === 'true')).toBe(true);
});
test('ticker remains available without CMS content and introduces no new requests', async () => {
  client.fetch.mockRejectedValue(new Error('Offline')); await render(); expect(container.querySelector('.work-ticker ul li').textContent).toContain('React interfaces'); expect(client.fetch).toHaveBeenCalledTimes(1);
});
test('ticker looping and reduced-motion fallback are scoped without changing the grid', async () => {
  await render(); const css = fs.readFileSync(path.join(__dirname, 'style/work.css'), 'utf8');
  expect(css).toContain('animation: work-marquee 36s linear infinite'); expect(css).toContain('@keyframes work-marquee { to { transform: translateX(-25%); } }');
  expect(css).toContain('.work-ticker:focus-within .work-ticker-track { animation-play-state: paused; }');
  expect(css).toContain('.work-ticker-track { animation: none; width: auto; }'); expect(css).toContain('.work-ticker-group[aria-hidden="true"] { display: none; }');
  expect(css).toContain('.work-hero-copy h1 > span { display: block; white-space: nowrap; }');
  expect(container.querySelectorAll('.work-project-grid article')).toHaveLength(3);
});

test('badge and decorative outlines float gently while keeping their angles and reduced-motion fallback', async () => {
  await render(); expect(spotlight().querySelector('.work-project-badge').getAttribute('aria-hidden')).toBe('true'); expect(spotlight().querySelector('.work-showcase-note').getAttribute('aria-hidden')).toBe('true');
  const css = fs.readFileSync(path.join(__dirname, 'style/work.css'), 'utf8');
  expect(css).toContain('animation: work-badge-float 6s ease-in-out infinite'); expect(css).toContain('translateY(-6px) rotate(9deg)');
  expect(css).toContain('animation: work-outline-mint 9s ease-in-out infinite'); expect(css).toContain('animation: work-outline-purple 11s ease-in-out infinite');
  expect(css).toContain('.work-project-badge, .work-showcase::before, .work-showcase::after { animation: none; }');
});

test('Work retains every project regardless of Home featured flags and uses short summaries', async () => {
  client.fetch.mockResolvedValue([{...records[0], showOnHomePage: true, shortDescription: 'Short storefront', longDescription: 'Detailed architecture'}, {...records[1], showOnHomePage: false}, {...records[2], shortDescription: {invalid: true}}]);
  await render(); expect(titles()).toEqual(records.map(p => p.title)); expect(cards()[0].textContent).toContain('Short storefront'); expect(cards()[0].textContent).not.toContain(records[0].description); expect(cards()[1].textContent).toContain(records[1].description); expect(cards()[2].textContent).toContain(records[2].description);
  await change(search(), 'detailed architecture'); expect(titles()).toEqual(['BrandStore']); await change(search(), 'Short storefront'); expect(titles()).toEqual(['BrandStore']);
});
test('project details prefer factual long text while blank or malformed new fields retain legacy descriptions', async () => {
  client.fetch.mockResolvedValue([{...records[0], longDescription: 'Detailed architecture'}, {...records[1], longDescription: {}}, {...records[2], longDescription: '  '}]);
  await render(); await click(container.querySelector('button[aria-label="View details of BrandStore"]'));
  expect(document.querySelector('.work-detail-description').textContent).toBe('Detailed architecture');
  await click(document.querySelector('button[aria-label="Close project details"]'));
  await act(async () => new Promise(resolve => setTimeout(resolve, 250)));
  await click(container.querySelector('button[aria-label="View details of Portfolio"]'));
  expect(document.querySelector('.work-detail-description').textContent).toBe(records[1].description);
});

test.each([
  ['long description', 'First paragraph.\n\nSecond paragraph.\nA new line.', 'Legacy text', 'First paragraph.\n\nSecond paragraph.\nA new line.'],
  ['blank long description', ' \n\t ', 'Legacy first paragraph.\n\nLegacy second paragraph.', 'Legacy first paragraph.\n\nLegacy second paragraph.'],
  ['malformed long description', {}, 'Legacy first line.\nSecond line.', 'Legacy first line.\nSecond line.'],
  ['missing descriptions', null, ' \n ', 'Project description not provided.'],
  ['HTML-looking plain text', '<strong>Plain text</strong>\n<script>not executable</script>', 'Legacy text', '<strong>Plain text</strong>\n<script>not executable</script>'],
])('project details preserve safe multiline plain text: %s', async (label, longDescription, description, expected) => {
  client.fetch.mockResolvedValue([{...records[0], longDescription, description, shortDescription: 'Compact card summary'}]);
  await render();
  expect(cards()[0].querySelector('.work-project-description').textContent).toBe('Compact card summary');
  await click(container.querySelector('button[aria-label="View details of BrandStore"]'));
  const details = document.querySelector('.work-detail-description');
  expect(details.textContent).toBe(expected);
  expect(details.querySelector('strong, script')).toBeNull();
  const css = fs.readFileSync(path.join(__dirname, 'style/work.css'), 'utf8');
  expect(css).toMatch(/\.work-detail-description\s*\{[^}]*white-space:\s*pre-line/);
});
