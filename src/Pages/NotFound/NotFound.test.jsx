import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
jest.mock('react-router',()=>({Link:({to,children,...props})=>require('react').createElement('a',{href:to,...props},children)}),{virtual:true});
const NotFound=require('./NotFound').default;
test('unknown routes expose one main landmark, meaningful heading and Home navigation',async()=>{
  global.IS_REACT_ACT_ENVIRONMENT=true;
  const container=document.createElement('div');document.body.appendChild(container);const root=createRoot(container);
  try {await act(async()=>root.render(<NotFound/>));expect(container.querySelectorAll('main')).toHaveLength(1);expect(container.querySelector('main').tabIndex).toBe(-1);expect(container.querySelector('h1').textContent).toBe('Page Not Found');expect(container.querySelector('a').getAttribute('href')).toBe('/');expect(container.querySelector('.image-numbers').getAttribute('aria-hidden')).toBe('true');expect(container.querySelector('img').alt).toBe('');}
  finally {await act(async()=>root.unmount());container.remove();delete global.IS_REACT_ACT_ENVIRONMENT;}
});
