const {test,beforeEach,afterEach}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs/promises');const {mock}=require('node:test');
const handler=require('../api/writing-article');const {metadataQuery,origin}=require('../src/Pages/Writing/writingContract');
const shell='<!doctype html><html><head><title>Generic</title><meta name="description" content="Generic"><meta property="og:title" content="Generic"><meta property="og:url" content="https://old.example"><meta name="twitter:title" content="Generic"><script defer src="/static/js/main.hash.js"></script><link href="/static/css/main.hash.css" rel="stylesheet"></head><body><div id="root"></div></body></html>';
const entry={_id:'test',title:'Mock entry',slug:'mock-entry',entryType:'article',excerpt:'Test only',publishedAt:'2026-01-01T00:00:00Z'};
let previousFetch,previousOrigin;
beforeEach(()=>{previousFetch=global.fetch;previousOrigin=process.env.REACT_APP_CANONICAL_ORIGIN;process.env.REACT_APP_CANONICAL_ORIGIN='https://portfolio.example';mock.method(fs,'readFile',async()=>shell);global.fetch=async()=>({ok:true,json:async()=>({result:entry})});});
afterEach(()=>{global.fetch=previousFetch;if(previousOrigin===undefined)delete process.env.REACT_APP_CANONICAL_ORIGIN;else process.env.REACT_APP_CANONICAL_ORIGIN=previousOrigin;mock.restoreAll();});
const call=async(slug='mock-entry',method='GET',headers={host:'evil.example'})=>{const res={headers:{},setHeader(k,v){this.headers[k]=v},status(v){this.code=v;return this},send(v){this.body=v;return this}};await handler({method,query:{slug},headers},res);return res};
test('valid published metadata is in raw HTML with one relevant tag set and unchanged assets',async()=>{
 global.fetch=async(url,options)=>{const parsed=new URL(url);assert.equal(parsed.searchParams.get('perspective'),'published');assert.equal(parsed.searchParams.get('$slug'),'"mock-entry"');assert.equal(parsed.searchParams.get('query'),metadataQuery);assert.ok(options.signal);return {ok:true,json:async()=>({result:entry})}};
 const res=await call();assert.equal(res.code,200);assert.equal(res.headers['Cache-Control'],'public, max-age=0, s-maxage=60');
 const head=res.body;assert.equal((head.match(/property="og:title"/g)||[]).length,1);assert.ok(head.includes('https://portfolio.example/writing/mock-entry'));assert.ok(head.includes('/static/js/main.hash.js'));assert.ok(res.body.includes('writing-base-metadata'));assert.ok(!head.includes('evil.example'));assert.ok(!head.includes('og:image'));
});
test('two different entries generate distinct metadata and plain HTML-looking text stays escaped',()=>{
 const first=handler.renderShell(shell,entry,'https://portfolio.example');const second=handler.renderShell(shell,{...entry,slug:'another',title:'<script>alert("x")</script>'},'https://portfolio.example');assert.notEqual(first,second);assert.ok(second.includes('&lt;script&gt;'));assert.ok(!second.includes('<script>alert'));assert.ok(second.includes('/writing/another'));
});
for(const slug of ['../bad','Bad','x'.repeat(97),'with space','',null,['mock-entry']])test(`invalid slug ${JSON.stringify(slug)} is 404 before CMS access`,async()=>{global.fetch=()=>{throw Error('Must not fetch')};assert.equal((await call(slug)).code,404)});
for(const invalid of [null,{...entry,_id:'drafts.test'},{...entry,publishedAt:'2099-01-01T00:00:00Z'},{...entry,publishedAt:'bad'},{...entry,slug:'another'}])test(`unavailable entry ${JSON.stringify(invalid)} is not a fake successful page`,async()=>{global.fetch=async()=>({ok:true,json:async()=>({result:invalid})});const res=await call();assert.equal(res.code,404);assert.equal(res.headers['Cache-Control'],'no-store')});
test('CMS rejection or malformed response is 503, not 404',async()=>{global.fetch=async()=>{throw Error('offline')};assert.equal((await call()).code,503);global.fetch=async()=>({ok:false});assert.equal((await call()).code,503);global.fetch=async()=>({ok:true,json:async()=>{throw Error('bad JSON')}});assert.equal((await call()).code,503)});
test('bounded provider timeout aborts the read and returns 503',async t=>{t.mock.timers.enable({apis:['setTimeout']});global.fetch=(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(Error('aborted'))));const result=call();t.mock.timers.tick(8000);assert.equal((await result).code,503);t.mock.timers.reset()});
test('unconfigured canonical origin is 503; Host never becomes canonical',async()=>{delete process.env.REACT_APP_CANONICAL_ORIGIN;assert.equal((await call()).code,503);for(const value of ['http://site.example','https://site.example/path','https://user:pass@site.example','https://localhost'])assert.equal(origin(value),null)});
test('approved Sanity images win, arbitrary image URLs never enter metadata',()=>{
 const image={asset:{url:`https://cdn.sanity.io/images/yv2hgb0y/production/${'a'.repeat(40)}-1200x630.png`,metadata:{dimensions:{width:1200,height:630}}},alt:'Actual cover'};
 const html=handler.renderShell(shell,{...entry,coverImage:image,socialImage:{asset:{url:'https://evil.example/track.svg'}}},'https://portfolio.example');assert.ok(html.includes(image.asset.url));assert.ok(html.includes('og:image:width'));assert.ok(!html.includes('evil.example'));
});
test('methods, HEAD response, missing build artifact and rewrite precedence are explicit',async()=>{
 assert.equal((await call('mock-entry','POST')).code,405);assert.equal((await call('mock-entry','HEAD')).body,'');fs.readFile.mock.mockImplementation(async()=>{throw Error('missing shell')});assert.equal((await call()).code,503);
 const config=require('../vercel.json');assert.equal(config.functions['api/writing-article.js'].includeFiles,'build/index.html');assert.equal(config.rewrites[0].source,'/writing/:slug');assert.ok(!config.rewrites.some(r=>r.source==='/(.*)'));
 for(const file of ['/static/js/a.js','/images/test.png','/api/other','/Ali Muhammed Ahmed.pdf'])assert.ok(!config.rewrites.some(r=>r.source===file));
});
