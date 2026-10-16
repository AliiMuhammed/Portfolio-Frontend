import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Analytics } from '@vercel/analytics/react';

jest.mock('react-dom/client', () => ({createRoot:jest.fn(() => ({render:jest.fn()}))}));
jest.mock('react-router-dom', () => ({RouterProvider:() => null}));
jest.mock('@vercel/analytics/react', () => ({Analytics:() => null}), {virtual:true});
jest.mock('./Router', () => ({routes:{}}));

let tree;
beforeAll(() => {
  document.body.innerHTML='<div id="root"></div>';
  require('./index');
  tree=createRoot.mock.results[0].value.render.mock.calls[0][0];
});

test('mounts Analytics once beside the persistent RouterProvider inside Redux', () => {
  expect(tree.type).toBe(Provider);
  const children=Array.isArray(tree.props.children)?tree.props.children:[tree.props.children];
  expect(children.filter(child => child.type===RouterProvider)).toHaveLength(1);
  expect(children.filter(child => child.type===Analytics)).toHaveLength(1);
});

test.each([
  ['https://alimuhammed.vercel.app/work?search=private#projects','https://alimuhammed.vercel.app/work'],
  ['https://alimuhammed.vercel.app/writing/css-note?email=private#example','https://alimuhammed.vercel.app/writing/css-note'],
  ['https://alimuhammed.vercel.app/','https://alimuhammed.vercel.app/']
])('redacts query/fragment from %s while preserving the page path', (url,expected) => {
  const analytics=tree.props.children.find(child => child.type===Analytics);
  const event={type:'pageview',url};
  expect(analytics.props.beforeSend(event)).toEqual({type:'pageview',url:expected});
  expect(event.url).toBe(url);
});
