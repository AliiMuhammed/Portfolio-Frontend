import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import PageTransition from './PageTransition';

let mockPathname = '/';
jest.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
}), { virtual: true });

let container;
let root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
  mockPathname = '/';
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete global.IS_REACT_ACT_ENVIRONMENT;
});

test('renders initial content immediately without waiting for a timer', async () => {
  await act(async () => root.render(<PageTransition><p>Home</p></PageTransition>));
  expect(container.textContent).toBe('Home');
  expect(container.firstChild.style.opacity).toBe('1');
});

test('renders the new route immediately without retaining the old route', async () => {
  await act(async () => root.render(<PageTransition><p>Home</p></PageTransition>));
  mockPathname = '/work';
  await act(async () => root.render(<PageTransition><p>Work</p></PageTransition>));
  expect(container.textContent).toBe('Work');
  expect(Number(container.firstChild.style.opacity)).toBeGreaterThan(0);
});
