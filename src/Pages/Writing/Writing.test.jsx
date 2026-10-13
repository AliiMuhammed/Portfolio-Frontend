import React,{act} from 'react';
import {createRoot} from 'react-dom/client';
import {TextEncoder,TextDecoder} from 'util';
import fs from 'fs';
import path from 'path';
global.TextEncoder=TextEncoder;global.TextDecoder=TextDecoder;
jest.mock('react-router-dom',()=>require('../../../node_modules/react-router/dist/development/index.js'),{virtual:true});
jest.mock('../../Client',()=>({client:{fetch:jest.fn()}}));
const {MemoryRouter,Routes,Route,useNavigate}=require('react-router-dom');
const Writing=require('./Writing').default;
const {filterEntries}=require('./Writing');
const {client}=require('../../Client');
const contract=require('./writingContract');
const ArticleBody=require('./components/ArticleBody').default;
const record={_id:'mock-article',slug:'mock-react-note',title:'Mock React engineering article',entryType:'article',excerpt:'Test-only content. Not a published owner article.',topic:'React',tags:['UI'],publishedAt:'2026-01-01T00:00:00Z',featured:true,searchText:'cleanup and cancellation',body:[{_type:'block',_key:'heading1',style:'h2',children:[{_type:'span',text:'Same heading',marks:[]}]},{_type:'block',_key:'heading2',style:'h2',children:[{_type:'span',text:'Same heading',marks:[]}]},{_type:'articleCode',_key:'code',language:'javascript',code:'const x = 1;\n\nconsole.log(x);'},{_type:'articleCallout',_key:'note',text:'A test callout.'}]};
const note={...record,_id:'mock-note',slug:'mock-css-note',title:'Mock CSS field note',entryType:'note',topic:'CSS',tags:['CSS'],featured:false,publishedAt:'2025-01-01T00:00:00Z',searchText:'layout grid'};
let container,root,navigate;
function Harness(){navigate=useNavigate();return <Routes><Route path="/writing" element={<Writing/>}/><Route path="/writing/:slug" element={<Writing/>}/></Routes>}
const render=async(url='/writing')=>act(async()=>root.render(<MemoryRouter initialEntries={[url]}><Harness/></MemoryRouter>));
const click=async(element)=>act(async()=>element.click());
const fill=async(element,value)=>act(async()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,value);element.dispatchEvent(new Event('input',{bubbles:true}));});
const titles=()=>[...container.querySelectorAll('.entry-body h3')].map(e=>e.textContent);
beforeEach(()=>{
 global.IS_REACT_ACT_ENVIRONMENT=true;window.scrollTo=jest.fn();window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});global.ResizeObserver=class{observe(){}disconnect(){}};
 navigator.clipboard={writeText:jest.fn().mockResolvedValue(undefined)};
 process.env.REACT_APP_CANONICAL_ORIGIN='https://portfolio.example';
 client.fetch.mockReset().mockImplementation((query,params)=>Promise.resolve(query.includes('searchText')?[record,note]:params.slug===record.slug?record:params.slug===note.slug?note:null));
 container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(async()=>{await act(async()=>root.unmount());container.remove();delete global.IS_REACT_ACT_ENVIRONMENT;delete process.env.REACT_APP_CANONICAL_ORIGIN;jest.restoreAllMocks();});
test('faithful archive, real counts and public projection with no saved controls',async()=>{
 await render();expect(container.querySelector('main#writing-main')).not.toBeNull();expect(container.querySelector('main').tabIndex).toBe(-1);expect(container.querySelector('.filter-panel').getAttribute('role')).toBe('group');expect(titles()).toEqual([record.title,note.title]);expect(container.querySelector('h1').textContent).toBe('Notes fromthe buildingside.');expect(container.querySelector('.terminal')).not.toBeNull();expect(container.querySelector('.entry-card.featured h3').textContent).toBe(record.title);
 expect(client.fetch.mock.calls[0][0]).toContain('pt::text(body)');expect(client.fetch.mock.calls[0][2].perspective).toBe('published');expect(client.fetch).toHaveBeenCalledTimes(1);
 expect(container.querySelector('[aria-label*="Save"],.bookmark')).toBeNull();expect(container.textContent).not.toMatch(/Saved|illustrative entries|100%/);expect(container.querySelector('.results').textContent).toBe('2 entries');
});
test('search, topic and format intersect; reset returns all without another read',async()=>{
 await render();await fill(container.querySelector('input[type="search"]'),'CLEANUP');expect(titles()).toEqual([record.title]);
 await click([...container.querySelectorAll('.topic')].find(e=>e.textContent==='CSS'));expect(titles()).toEqual([]);expect(container.textContent).toContain('Nothing in this corner');
 await click(container.querySelector('.clear-btn'));expect(titles()).toEqual([record.title,note.title]);
 await click([...container.querySelectorAll('.tab')].find(e=>e.textContent.startsWith('Field notes')));expect(titles()).toEqual([note.title]);expect(client.fetch).toHaveBeenCalledTimes(1);
});
test.each(['title','excerpt','tags','topic','searchText'])('search uses %s',field=>{const entries=[{...record,title:'Other',excerpt:'',tags:[],topic:'',searchText:'',[field]:field==='tags'?['UNIQUE']: 'UNIQUE'}];expect(filterEntries(entries,{q:' unique '})).toHaveLength(1);});
test('all sort modes, deterministic ties and featured treatment',()=>{
 const recent={...note,_id:'z',title:'Zed',publishedAt:'2026-09-01T00:00:00Z'};expect(filterEntries([recent,record],{}).map(e=>e._id)).toEqual([record._id,'z']);expect(filterEntries([recent,record],{q:'mock',sort:'newest'}).map(e=>e._id)).toEqual([record._id]);
 expect(filterEntries([record,note],{sort:'oldest'})[0]).toBe(note);expect(filterEntries([recent,record],{sort:'az'})[0]).toBe(record);
 expect(filterEntries([{...record,_id:'b'},{...record,_id:'a'}],{}).map(e=>e._id)).toEqual(['a','b']);
});
test('loading, error with retry, empty and invalid responses are distinct',async()=>{
 let reject;client.fetch.mockReturnValueOnce(new Promise((r,j)=>{reject=j}));await render();expect(container.textContent).toContain('Loading published writing');await act(async()=>reject(Error('offline')));expect(container.textContent).toContain('Unable to load writing');
 client.fetch.mockResolvedValue([]);await click([...container.querySelectorAll('button')].find(e=>e.textContent==='Retry'));expect(container.textContent).toContain('No writing published');
});
test('unmount aborts and ignores stale CMS reads',async()=>{let resolve;client.fetch.mockReturnValue(new Promise(r=>{resolve=r}));await render();const signal=client.fetch.mock.calls[0][2].signal;await act(async()=>root.render(null));expect(signal.aborted).toBe(true);await act(async()=>resolve([record]));expect(container.textContent).toBe('');});
test.each([{...record,_id:'drafts.test'},{...record,publishedAt:'2099-01-01T00:00:00Z'},{...record,publishedAt:'bad'},{...record,slug:'../bad'},{...record,title:null},{...record,entryType:'saved'}])('ineligible content is excluded: %j',async invalid=>{client.fetch.mockResolvedValue([invalid]);await render();expect(titles()).toEqual([]);});
test('direct entry loads named modal, TOC, original code and focus containment',async()=>{
 await render(`/writing/${record.slug}`);expect(document.querySelector('[role="dialog"] h1').textContent).toBe(record.title);expect(document.querySelectorAll('.reader-toc a')).toHaveLength(2);
 const ids=[...document.querySelectorAll('.reader-content h2')].map(e=>e.id);expect(new Set(ids).size).toBe(2);
 expect(document.activeElement.getAttribute('aria-label')).toBe('Close reader');expect(document.querySelector('.reader-content pre').textContent).toBe(record.body[2].code);
 expect(client.fetch.mock.calls.find(([q])=>!q.includes('searchText'))[1]).toEqual({slug:record.slug});
});
test('archive opening, Escape, Back/Forward and filters retain route context',async()=>{
 await render('/writing?topic=React');const button=container.querySelector('.read-link');await click(button);expect(document.querySelector('.reader-content h1').textContent).toBe(record.title);
 await act(async()=>document.querySelector('[aria-label="Close reader"]').dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));expect(container.querySelector('input[type="search"]')).not.toBeNull();expect(titles()).toEqual([record.title]);
 await act(async()=>navigate(1));expect(document.querySelector('.reader-content h1').textContent).toBe(record.title);
 await act(async()=>navigate(-1));expect(titles()).toEqual([record.title]);
});
test('cold direct Close goes to archive, not an unrelated prior site',async()=>{await render(`/writing/${record.slug}`);await click(document.querySelector('[aria-label="Close reader"]'));expect(container.querySelector('.results').textContent).toBe('2 entries');});
test('missing entry differs from upstream failure; invalid slug never fetches detail',async()=>{await render('/writing/unknown');expect(document.querySelector('.writing-reader-state h1').textContent).toBe('Entry not found.');});
test('reader upstream failure has retry',async()=>{client.fetch.mockImplementation(q=>q.includes('searchText')?Promise.resolve([record]):Promise.reject(Error('offline')));await render(`/writing/${record.slug}`);expect(document.querySelector('.writing-reader-state h1').textContent).toBe('Unable to load this entry.');});
test('code copy preserves text and honest Clipboard-denied manual fallback',async()=>{await render(`/writing/${record.slug}`);await click(document.querySelector('.code-copy'));expect(navigator.clipboard.writeText).toHaveBeenCalledWith(record.body[2].code);expect(document.querySelector('.writing-copy-status').textContent).toBe('Code copied.');navigator.clipboard.writeText.mockRejectedValue(Error('denied'));await click(document.querySelector('.code-copy'));expect(document.querySelector('.writing-copy-status').textContent).toContain('Select the code');});
test('share actions use canonical URLs without filter parameters; Copy succeeds or offers manual URL',async()=>{
 await render('/writing?q=cleanup');await click(container.querySelector('[aria-label^="Share "]'));
 const links=[...container.querySelectorAll('.writing-share-panel a')];expect(links).toHaveLength(3);expect(new URL(links[0].href).searchParams.get('url')).toBe(`https://portfolio.example/writing/${record.slug}`);expect(links.every(e=>e.rel==='noopener noreferrer')).toBe(true);
 const copy=container.querySelector('.writing-share-panel button');await click(copy);expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`https://portfolio.example/writing/${record.slug}`);
 navigator.clipboard.writeText.mockRejectedValue(Error('denied'));await click(copy);expect(container.querySelector('[aria-label="Permanent article URL"]').value).toContain(`/writing/${record.slug}`);
});
test('missing canonical configuration preserves reading and refuses fake share URLs',async()=>{delete process.env.REACT_APP_CANONICAL_ORIGIN;await render();await click(container.querySelector('[aria-label^="Share "]'));expect(container.querySelector('.writing-share-panel a')).toBeNull();expect(container.textContent).toContain('Public sharing is not configured');expect(container.querySelector('.read-link')).not.toBeNull();});
test('Share Escape closes the panel first and keeps reader open',async()=>{await render(`/writing/${record.slug}`);const trigger=document.querySelector('.reader-actions [aria-label^="Share "]');await click(trigger);await act(async()=>trigger.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})));expect(document.querySelector('.writing-share-panel')).toBeNull();expect(document.querySelector('.reader-content h1')).not.toBeNull();expect(document.activeElement).toBe(trigger);});
test('TOC scrolls correct duplicate-title heading and reduced-motion styles remain scoped',async()=>{
 HTMLElement.prototype.scrollIntoView=jest.fn();await render(`/writing/${record.slug}`);await click(document.querySelectorAll('.reader-toc a')[1]);expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({block:'start',behavior:'smooth'});
 const css=fs.readFileSync(path.join(__dirname,'style/writing.css'),'utf8');expect(css).toContain('prefers-reduced-motion:reduce');expect(css).toContain('100dvh');expect(css).toContain('.writing-reader');
});
test('Portable Text safely handles markup-looking code, malformed blocks and links',async()=>{
 await act(async()=>root.render(<ArticleBody body={[{_type:'block',_key:'p',children:[{_type:'span',text:'unsafe link',marks:['a']}],markDefs:[{_key:'a',_type:'link',href:'javascript:alert(1)'}]},{_type:'articleCode',code:'<script>alert(1)</script>'},{_type:'block',children:null},{_type:'unknown'}]}/>));expect(container.querySelector('script,a')).toBeNull();expect(container.textContent).toContain('<script>');expect(container.textContent).toContain('Content block unavailable');
});
test.each(['http://site.example','https://user:pass@site.example','https://site.example/path','https://site.example?x=y','https://localhost','not a url'])('unsafe canonical origin %s cannot create share URL',value=>expect(contract.articleUrl(value,record.slug)).toBeNull());
test('reading progress uses the actual reader container, fits short content and cleans observers',async()=>{
 const callbacks=[];const cancel=jest.spyOn(window,'cancelAnimationFrame');jest.spyOn(window,'requestAnimationFrame').mockImplementation(callback=>{callbacks.push(callback);return callbacks.length});
 const disconnect=jest.fn();global.ResizeObserver=class{observe(){}disconnect(){disconnect()}};
 await render(`/writing/${record.slug}`);const scroll=document.querySelector('.reader-scroll');Object.defineProperty(scroll,'scrollHeight',{configurable:true,value:1000});Object.defineProperty(scroll,'clientHeight',{configurable:true,value:500});scroll.scrollTop=250;
 await act(async()=>callbacks.splice(0).forEach(cb=>cb()));expect(document.querySelector('.reader-progress span').style.width).toBe('50%');
 Object.defineProperty(scroll,'scrollHeight',{configurable:true,value:400});await act(async()=>window.dispatchEvent(new Event('resize')));await act(async()=>callbacks.splice(0).forEach(cb=>cb()));expect(document.querySelector('.reader-progress span').style.width).toBe('100%');
 await act(async()=>root.render(null));expect(disconnect).toHaveBeenCalled();expect(cancel).toHaveBeenCalled();
});
test('metadata updates without duplicate OG tags and restores prior head on leaving Writing',async()=>{
 const original=document.title;await render(`/writing/${record.slug}`);expect(document.title).toContain(record.title);expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);await act(async()=>root.render(null));expect(document.title).toBe(original);
});
test('image fallback and unknown prototype identifiers cannot interrupt the reader',async()=>{
 await act(async()=>root.render(<ArticleBody body={[{_type:'articleImage',asset:{url:'https://evil.example/asset.svg'},alt:'test'},{_type:'__proto__'},{_type:'block',style:'h2',children:[{text:'Repeated'}]},{_type:'block',style:'h2',children:[{text:'Repeated'}]}]}/>));expect(container.querySelector('img')).toBeNull();expect(container.textContent).toContain('Image unavailable');expect(new Set([...container.querySelectorAll('h2')].map(e=>e.id)).size).toBe(2);
});

test('server baseline metadata restores UTF-8 punctuation after direct article navigation',async()=>{
 const previous=document.head.innerHTML;const baseline='<title>Ali Muhammed — Frontend Software Engineer</title><meta property="og:title" content="Ali Muhammed — Frontend Software Engineer">';
 const template=document.createElement('template');template.id='writing-base-metadata';template.dataset.head=Buffer.from(baseline,'utf8').toString('base64');document.head.appendChild(template);
 await render(`/writing/${record.slug}`);await act(async()=>root.render(null));expect(document.title).toBe('Ali Muhammed — Frontend Software Engineer');expect(document.head.querySelector('meta[property="og:title"]').content).toBe('Ali Muhammed — Frontend Software Engineer');
 document.head.innerHTML=previous;
});
