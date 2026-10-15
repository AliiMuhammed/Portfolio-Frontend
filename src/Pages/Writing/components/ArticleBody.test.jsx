import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import ArticleBody from './ArticleBody';

const code = 'const message = "Hello";\n\n  console.log(message);\n';
const block = (key = 'one', content = code) => ({_type:'articleCode', _key:key, code:content, language:'javascript'});
let container, root, timeout, cancel;
const render = async (body = [block()]) => act(async () => root.render(<ArticleBody body={body} />));
const click = async button => act(async () => button.click());
const advance = async ms => act(async () => jest.advanceTimersByTime(ms));
const deferred = () => {let resolve, reject; const promise = new Promise((yes, no) => {resolve = yes; reject = no;}); return {promise, resolve, reject};};
const copyTimers = () => timeout.mock.calls.flatMap((args, index) => args[1] === 5000 ? [timeout.mock.results[index].value] : []);

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  jest.useFakeTimers();
  timeout = jest.spyOn(global, 'setTimeout'); cancel = jest.spyOn(global, 'clearTimeout');
  navigator.clipboard = {writeText:jest.fn().mockResolvedValue(undefined)};
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount()); container.remove();
  jest.restoreAllMocks(); jest.useRealTimers(); delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('success is inside the stable button for exactly 5000ms after clipboard completion', async () => {
  const request = deferred(); navigator.clipboard.writeText.mockReturnValue(request.promise);
  await render(); const button = container.querySelector('button');
  expect(button.textContent).toBe('Copy'); expect(button.querySelector('svg')).not.toBeNull();
  await click(button); await advance(6000);
  expect(button.textContent).toBe('Copy'); expect(navigator.clipboard.writeText).toHaveBeenCalledWith(code);
  await act(async () => request.resolve());
  expect(button.textContent).toBe('Copied!'); expect(button.classList.contains('is-copied')).toBe(true);
  expect(button.querySelector('.code-copy-check')).not.toBeNull();
  const status = container.querySelector('[role="status"]');
  expect(status.textContent).toBe('Code copied.'); expect(status.classList.contains('is-error')).toBe(false);
  expect(container.querySelector('pre').textContent).toBe(code);
  await advance(4999); expect(button.textContent).toBe('Copied!');
  await advance(1); expect(button.textContent).toBe('Copy'); expect(button.classList.contains('is-copied')).toBe(false);
  expect(button.querySelector('.code-copy-check')).toBeNull(); expect(status.textContent).toBe('');
});

test('each successful repeat restarts one five-second timer', async () => {
  await render(); const button = container.querySelector('button'); await click(button); await advance(4000);
  await click(button); expect(copyTimers()).toHaveLength(2); expect(cancel).toHaveBeenCalledWith(copyTimers()[0]);
  await advance(1000); expect(button.textContent).toBe('Copied!');
  await advance(3999); expect(button.textContent).toBe('Copied!');
  await advance(1); expect(button.textContent).toBe('Copy');
});

test.each(['rejection', 'exception', 'missing clipboard'])('%s keeps success off and exposes useful manual-copy feedback', async failure => {
  await render(); const button = container.querySelector('button'); await click(button);
  if (failure === 'rejection') navigator.clipboard.writeText.mockRejectedValue(Error('denied'));
  else if (failure === 'exception') navigator.clipboard.writeText.mockImplementation(() => {throw Error('denied');});
  else navigator.clipboard = undefined;
  await click(button);
  expect(button.textContent).toBe('Copy'); expect(button.classList.contains('is-copied')).toBe(false);
  const status = container.querySelector('[role="status"]');
  expect(status.textContent).toContain('Select the code'); expect(status.classList.contains('is-error')).toBe(true);
  expect(copyTimers()).toHaveLength(1); expect(cancel).toHaveBeenCalledWith(copyTimers()[0]); expect(container.querySelector('pre').textContent).toBe(code);
});

test('multiple code blocks have independent success states and timers', async () => {
  await render([block(), block('two', 'second\n  example')]);
  const buttons = container.querySelectorAll('button');
  await click(buttons[0]); await advance(2000); expect(buttons[1].textContent).toBe('Copy');
  await click(buttons[1]); await advance(3000);
  expect(buttons[0].textContent).toBe('Copy'); expect(buttons[1].textContent).toBe('Copied!');
  expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith('second\n  example');
  await advance(2000); expect(buttons[1].textContent).toBe('Copy');
});

test('navigating to different content cleans success timers', async () => {
  await render(); await click(container.querySelector('button')); expect(copyTimers()).toHaveLength(1);
  await render([block('one', 'new article code')]); expect(cancel).toHaveBeenCalledWith(copyTimers()[0]);
  expect(container.querySelector('button').textContent).toBe('Copy');
  await click(container.querySelector('button')); await act(async () => root.render(null)); expect(cancel).toHaveBeenCalledWith(copyTimers()[1]);
});

test.each(['content change', 'unmount'])('pending clipboard completion is ignored after %s', async change => {
  const request = deferred(); navigator.clipboard.writeText.mockReturnValue(request.promise);
  await render(); await click(container.querySelector('button'));
  if (change === 'unmount') await act(async () => root.render(null));
  else await render([block('one', 'new article code')]);
  await act(async () => request.resolve());
  expect(copyTimers()).toHaveLength(0); expect(container.textContent).not.toContain('Copied!');
});

test('an older clipboard result cannot overwrite the latest failure', async () => {
  const first = deferred(), second = deferred();
  navigator.clipboard.writeText.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  await render(); const button = container.querySelector('button'); await click(button); await click(button);
  await act(async () => second.reject(Error('denied'))); await act(async () => first.resolve());
  expect(button.textContent).toBe('Copy'); expect(container.querySelector('[role="status"]').textContent).toContain('Select the code');
  expect(copyTimers()).toHaveLength(0);
});
