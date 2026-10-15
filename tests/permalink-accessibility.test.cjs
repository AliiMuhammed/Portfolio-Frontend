const {test}=require('node:test');const assert=require('node:assert/strict');
const {createHandler}=require('../server/publicPermalink');
for(const section of ['writing','work'])test(`${section} error documents retain status and expose language, title, main and index navigation`,async()=>{
 const handler=createHandler({section});
 const call=async method=>{const res={headers:{},setHeader(k,v){this.headers[k]=v},status(v){this.code=v;return this},send(v){this.body=v;return this}};await handler({method,query:{slug:'Bad'}},res);return res};
 const response=await call('GET');assert.equal(response.code,404);assert.match(response.body,/<html lang="en">/);assert.match(response.body,/<title>[^<]+<\/title>/);assert.match(response.body,/<main\b/);assert.ok(response.body.includes(`href="/${section}"`));assert.ok(response.body.includes('noindex'));assert.equal(response.headers['Cache-Control'],'no-store');
 assert.equal((await call('HEAD')).body,'');
});
