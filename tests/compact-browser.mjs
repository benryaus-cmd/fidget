import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {TOYS} from '../src/gameplay/catalog.ts';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const baseline=process.argv.includes('--baseline');
const url=process.env.TEST_URL||'http://127.0.0.1:5173';
const out='tests/compact-artifacts';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
await context.addInitScript(()=>{window.__audioMetrics={contexts:0,oscillators:0};const Real=window.AudioContext;if(Real)window.AudioContext=class extends Real{constructor(...args){super(...args);window.__audioMetrics.contexts++;}createOscillator(){window.__audioMetrics.oscillators++;return super.createOscillator();}};});
const page=await context.newPage();page.setDefaultTimeout(4000);
const checks=[],errors=[],mediaRequests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.resourceType()==='media')mediaRequests.push(r.url());});
async function shot(name){await page.screenshot({path:`${out}/${baseline?'baseline-':''}${name}.png`});const surface=page.locator('#simulated-aippy-surface');if(await surface.count())await surface.screenshot({path:`${out}/${baseline?'baseline-':''}surface-${name}.png`});}
async function test(name,fn){try{await fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',detail:e.message});await shot(`failure-${checks.length}`);}console.log(`${checks.at(-1).status} ${name}${checks.at(-1).detail?' — '+checks.at(-1).detail:''}`);}
async function host(width,height){await page.setViewportSize({width,height:844});await page.goto(url);await page.evaluate(()=>localStorage.clear());await page.reload();await page.evaluate(({width,height})=>{const root=document.querySelector('#root'),parent=document.createElement('div');parent.id='simulated-aippy-surface';root.before(parent);parent.append(root);const style=document.createElement('style');style.textContent=`#simulated-aippy-surface{width:${width}px;height:${height}px;position:relative;overflow:hidden}#root{height:100%;width:100%}body{color:#000;background:#222}h1,h2,h3,button{color:#000}`;document.head.append(style);},{width,height});}
async function nav(name){const modal=page.getByRole('dialog',{name:'Round results'});if(await modal.count())await modal.getByRole('button',{name:'BACK TO ARCADE',exact:true}).click();else{const back=page.getByRole('button',{name:/Back to arcade/i});if(await back.count())await back.first().click();}await page.getByRole('button',{name,exact:true}).click();}
async function open(toy){await nav('PLAY');await page.getByRole('button',{name:toy.name,exact:true}).click();}
async function save(){await page.waitForTimeout(300);return page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')));}
async function withinSurface(locator){const b=await locator.boundingBox(),host=await page.locator('#simulated-aippy-surface').boundingBox();assert.ok(b&&b.x>=host.x-1&&b.y>=host.y-1&&b.x+b.width<=host.x+host.width+1&&b.y+b.height<=host.y+host.height+1,`bounds ${JSON.stringify(b)} exceed host ${JSON.stringify(host)}`);}
async function readable(){const black=await page.evaluate(()=>[...document.querySelectorAll('.uff h1,.uff h2,.uff .top-center strong,.uff .bottom-nav button,.uff .primary,.uff .small-primary,.uff .toy-copy strong,.uff .toy-info p,.uff .toy-status,.uff .shop-name strong')].filter(e=>e.getBoundingClientRect().width).filter(e=>{const rgb=getComputedStyle(e).color.match(/[\d.]+/g)?.slice(0,3).map(Number)||[];return rgb.length<3||Math.max(...rgb)<80;}).map(e=>e.textContent.trim()));assert.deepEqual(black,[],'host black styles leak onto dark UI');}
for(const size of [{width:320,height:520},{width:390,height:610},{width:430,height:650}]){
 await host(size.width,size.height);
 await test(`welcome fits embedded ${size.width}×${size.height} and Play is visible`,async()=>{await withinSurface(page.locator('.uff'));await withinSurface(page.getByRole('button',{name:/LET'S PLAY/i}));await withinSurface(page.locator('.bottom-nav'));});
 await shot(`welcome-${size.width}`);
 await test(`navigation starts no AudioContext or radio at ${size.width}`,async()=>{for(const name of ['PLAY','SHOP','AWARDS','SETTINGS','PLAY'])await nav(name);assert.equal(await page.evaluate(()=>window.__audioMetrics.contexts),0);assert.equal(mediaRequests.length,0);});
 await test(`host typography remains readable at ${size.width}`,readable);
 if(size.width===390)await test('showroom displays eight complete cards above navigation at 390×610',async()=>{await withinSurface(page.locator('.bottom-nav'));const nav=await page.locator('.bottom-nav').boundingBox();for(const card of await page.locator('.toy-card').all()){await withinSurface(card);const b=await card.boundingBox();assert.ok(b.y+b.height<=nav.y+1,`card bottom ${b.y+b.height}>nav ${nav.y}`);}});
 await shot(`showroom-${size.width}`);
 for(const toy of TOYS){await open(toy);await test(`${toy.name} controls fit stage and compact ${size.width}×${size.height}`,async()=>{
  await withinSurface(page.locator('.toy-screen'));await withinSurface(page.getByRole('button',{name:/45s CHALLENGE/}));
  const clipping=await page.evaluate(()=>{const f=document.querySelector('.play-field').getBoundingClientRect();return [...document.querySelectorAll('.toy-stage button,.toy-stage input,.toy-stage canvas,.angular-surface')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.left<f.left-1||r.right>f.right+1||r.top<f.top-1||r.bottom>f.bottom+1)}).map(e=>e.getAttribute('aria-label')||e.textContent)});assert.deepEqual(clipping,[]);await readable();
 });
 await test(`${toy.name} offers opt-in music without obscuring its board at ${size.width}`,async()=>{assert.equal(await page.getByRole('button',{name:/^Play radio/}).count(),1);await withinSurface(page.getByRole('button',{name:/^Play radio/}));const music=await page.locator('.uff-toy-music').boundingBox(),board=await page.locator('.pop-housing,.angular-housing,.field-housing,.slider-housing,.piano-housing,.switch-housing').boundingBox();assert.ok(music.x+music.width<=board.x+1||board.x+board.width<=music.x+1||music.y+music.height<=board.y+1||board.y+board.height<=music.y+1,'music badge overlaps primary board');});
 await shot(`toy-${toy.id}-${size.width}`);
 }
}
if(!baseline){
 await host(390,610);
 await test('muted welcome/menu/toy gestures create no AudioContext',async()=>{await nav('SETTINGS');await page.getByRole('button',{name:'SOUND EFFECTS ON',exact:true}).click();assert.equal((await save()).settings.muted,true);await page.reload();await nav('PLAY');await open(TOYS[0]);await page.getByRole('button',{name:'Bubble 1',exact:true}).tap();assert.equal(await page.evaluate(()=>window.__audioMetrics.contexts),0);});
 await host(390,610);
 await test('music control starts on tap, handles unavailable stream and shares settings state',async()=>{await open(TOYS[0]);await page.route(/ice\d*\.somafm/,r=>r.abort('internetdisconnected'));await page.getByRole('button',{name:/^Play radio/}).click();await page.getByRole('button',{name:/^Retry radio/}).waitFor({timeout:18000});await nav('SETTINGS');await page.getByText('Stream unavailable. Check your connection and retry.').waitFor();await shot('shared-radio-error');});
 await test('slider pointer release awards once; clicking bubble twice cannot farm',async()=>{await open(TOYS.find(t=>t.id==='sliders'));const before=await save();const slider=page.getByRole('slider',{name:/Warmth/}),b=await slider.boundingBox();await page.mouse.move(b.x+8+(b.width-16)*.2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+8+(b.width-16)*.72,b.y+b.height/2,{steps:12});await page.mouse.up();const after=await save();assert.equal(after.interactions,before.interactions+1);await open(TOYS[0]);const p=await save();await page.getByRole('button',{name:'Bubble 1',exact:true}).dblclick();assert.equal((await save()).interactions,p.interactions+1);});
 await test('compact session has no uncaught errors',async()=>assert.deepEqual(errors,[]));
}
await writeFile(`${out}/${baseline?'baseline':'compact'}-results.json`,JSON.stringify({testedAt:new Date().toISOString(),checks,errors},null,2));await browser.close();if(checks.some(x=>x.status==='FAIL'))process.exitCode=1;
