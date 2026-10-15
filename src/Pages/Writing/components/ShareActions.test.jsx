import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import ShareActions from './ShareActions';

let root, container, timeout, cancel;
const entry = {title:'Test field note', slug:'test-field-note'};
const url = 'https://portfolio.example/writing/test-field-note';
const click = async el => act(async () => el.click());
const render = async (value = entry) => act(async () => root.render(<ShareActions entry={value} />));
const advance = async ms => act(async () => jest.advanceTimersByTime(ms));
const trigger = () => container.querySelector('.reader-icon');
const button = () => container.querySelector('.writing-share-panel button');
const timers = () => timeout.mock.calls.flatMap((args, index) => args[1] === 5000 ? [timeout.mock.results[index].value] : []);

beforeEach(async () => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  process.env.REACT_APP_CANONICAL_ORIGIN = 'https://portfolio.example';
  jest.useFakeTimers();
  timeout = jest.spyOn(global, 'setTimeout'); cancel = jest.spyOn(global, 'clearTimeout');
  navigator.clipboard = {writeText:jest.fn().mockResolvedValue(undefined)};
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  await render(); await click(trigger());
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove();
  jest.restoreAllMocks(); jest.useRealTimers(); delete process.env.REACT_APP_CANONICAL_ORIGIN;
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('URL copy feedback lives inside the button with decorative copy/check icons and a live announcement', async () => {
  expect(button().textContent).toBe('Copy article URL');
  expect(button().querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  await click(button());
  expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
  expect(button().textContent).toBe('Copied!'); expect(button().classList.contains('is-copied')).toBe(true);
  expect(button().querySelector('.writing-share-check')).not.toBeNull();
  const status = container.querySelector('[role="status"]');
  expect(status.textContent).toBe('Link copied.'); expect(status.classList.contains('writing-share-status')).toBe(true);
  expect(status.classList.contains('is-error')).toBe(false);
  await advance(4999); expect(button().textContent).toBe('Copied!');
  await advance(1); expect(button().textContent).toBe('Copy article URL'); expect(status.textContent).toBe('');
});

test('success starts only after the clipboard write succeeds', async () => {
  let resolve; navigator.clipboard.writeText.mockReturnValue(new Promise(done => {resolve = done;}));
  await click(button()); await advance(6000); expect(button().textContent).toBe('Copy article URL');
  await act(async () => resolve()); expect(button().textContent).toBe('Copied!');
  await advance(4999); expect(button().textContent).toBe('Copied!');
  await advance(1); expect(button().textContent).toBe('Copy article URL');
});

test('repeated success restarts the five-second period and cancels the previous timeout', async () => {
  await click(button()); await advance(4000); await click(button());
  expect(timers()).toHaveLength(2); expect(cancel).toHaveBeenCalledWith(timers()[0]);
  await advance(1000); expect(button().textContent).toBe('Copied!');
  await advance(4000); expect(button().textContent).toBe('Copy article URL');
});

test('clipboard failure never shows success and keeps the visible manual URL fallback', async () => {
  navigator.clipboard.writeText.mockRejectedValue(Error('denied'));
  await click(button()); expect(button().textContent).toBe('Copy article URL');
  expect(button().classList.contains('is-copied')).toBe(false);
  expect(container.querySelector('[role="status"]').classList.contains('is-error')).toBe(true);
  expect(container.querySelector('[aria-label="Permanent article URL"]').value).toBe(url);
});

test('closing the menu cancels the timeout and reopening starts in the default state', async () => {
  await click(button()); const timer = timers()[0]; await click(trigger());
  expect(cancel).toHaveBeenCalledWith(timer);
  await click(trigger()); expect(button().textContent).toBe('Copy article URL');
  expect(container.querySelector('[role="status"]').textContent).toBe('');
});

test.each(['close', 'article change', 'unmount'])('late clipboard success is ignored after %s', async change => {
  let resolve; navigator.clipboard.writeText.mockReturnValue(new Promise(done => {resolve = done;}));
  await click(button());
  if (change === 'close') {await click(trigger()); await click(trigger());}
  if (change === 'article change') await render({...entry, slug:'another-note'});
  if (change === 'unmount') await act(async () => root.render(null));
  await act(async () => resolve());
  expect(container.textContent).not.toContain('Copied!'); expect(timers()).toHaveLength(0);
});
