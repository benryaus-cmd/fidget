import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=(await import(require.resolve('playwright'))).default;
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {TOYS} from '../src/gameplay/catalog.ts';

const base=process.env.TEST_URL||'http://127.0.0.1:5173';
const baseline=process.argv.includes('--baseline');
const artifactDir='tests/artifacts';
await mkdir(artifactDir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
const page=await context.newPage();
await page.addInitScript(()=>{
 window.__audioMetrics={contexts:0,oscillators:0};
 const Real=window.AudioContext;
 if(Real)window.AudioContext=class extends Real{constructor(...args){super(...args);window.__audioMetrics.contexts++;}createOscillator(){window.__audioMetrics.oscillators++;return super.createOscillator();}};
});
const checks=[];
const errors=[];
const mediaRequests=[];
page.on('request',r=>{if(r.resourceType()==='media')mediaRequests.push(r.url());});
page.on('pageerror',error=>errors.push(error.message));
async function check(name,fn){try{await fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',detail:e.message});await shot(`failure-${checks.length}`);console.log((await page.locator('[role="status"]').allTextContents()).join(' | '));}console.log(`${checks.at(-1).status} ${name}${checks.at(-1).detail?' — '+checks.at(-1).detail:''}`);}
async function shot(name){await page.screenshot({path:`${artifactDir}/${name}.png`,fullPage:true});}
async function fresh(){await page.goto(base);await page.evaluate(()=>localStorage.clear());await page.reload();}
async function nav(name){const results=page.getByRole('dialog',{name:'Round results'});if(await results.count())await results.getByRole('button',{name:'BACK TO ARCADE',exact:true}).click();else{const back=page.getByRole('button',{name:/Back to arcade/i});if(await back.count())await back.first().click();}await page.getByRole('button',{name,exact:true}).click();}
async function showroom(){const welcome=page.getByRole('button',{name:/LET'S PLAY/i});if(await welcome.count())await welcome.click();else await nav('PLAY');}
const toys=baseline?['POP FRENZY','SPIN LAB','SWITCH STACK','NEON KEYS','SLIDE CLUB','HYPER DIAL','MARBLE DROP','MAGNET CHAOS']:TOYS.map(t=>t.name);
const toyButton=name=>page.getByRole('button',{name:new RegExp(name,'i')});
async function saved(){await page.waitForTimeout(650);return page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')||localStorage.getItem('uff-save-v1')||'null'));}
await fresh();
if(!baseline){await shot('welcome-390');await page.setViewportSize({width:320,height:700});await shot('welcome-320');await page.setViewportSize({width:390,height:844});}
await check('welcome starts arcade on direct Play tap',async()=>{await page.getByRole('button',{name:/LET'S PLAY/i}).click();await toyButton('POP FRENZY').waitFor();});
await check('eight distinctive playable toys are present',async()=>{for(const toy of toys)assert.equal(await toyButton(toy).count(),1,`${toy} missing`);});
await shot(baseline?'baseline-showroom':'showroom-390');
await check('early challenge finish awards zero gems and XP',async()=>{
 await toyButton('POP FRENZY').click();
 const before=await page.evaluate(()=>({...localStorage}));
 await page.getByRole('button',{name:/45s CHALLENGE/}).click();
 await page.getByRole('button',{name:'END ROUND',exact:true}).click();
 await page.waitForTimeout(200);
 const after=await page.evaluate(()=>({...localStorage}));
 const findSave=o=>Object.values(o).map(v=>{try{return JSON.parse(v)}catch{return null}}).find(v=>v&&typeof v.gems==='number');
 const a=findSave(before),b=findSave(after);assert.ok(a&&b,'save object available');
 assert.equal(b.gems,a.gems,'early finish gems');assert.equal(b.xp,a.xp,'early finish XP');
});
await check('result offers direct return to free play',async()=>{await page.getByRole('button',{name:/FREE PLAY/i}).waitFor({timeout:2000});});
if(!baseline){
 await fresh();await showroom();
 await check('result dialog blocks hidden piano keyboard progression',async()=>{await toyButton('Piano Rush').click();await page.getByRole('button',{name:/45s CHALLENGE/}).click();await page.getByRole('button',{name:'END ROUND',exact:true}).click();const before=await saved();for(const key of ['a','s','d','f'])await page.keyboard.press(key);const after=await saved();assert.equal(after.interactions,before.interactions);assert.equal(after.xp,before.xp);});
 await check('unmatched challenge switch clicks sound without farming progression',async()=>{await nav('PLAY');await toyButton('Switch Circuit').click();await page.getByRole('button',{name:/45s CHALLENGE/}).click();const before=await saved();const audioBefore=await page.evaluate(()=>window.__audioMetrics.oscillators);await page.getByRole('switch',{name:'Circuit 1'}).tap();const after=await saved();assert.equal(after.interactions,before.interactions);assert.equal(after.xp,before.xp);assert.ok(await page.evaluate(()=>window.__audioMetrics.oscillators)>audioBefore);});
 await fresh();await showroom();
 for(const viewport of [{width:320,height:700},{width:390,height:844},{width:430,height:932},{width:844,height:390},{width:1280,height:800}]){
  await page.setViewportSize(viewport);
  await check(`screens ${viewport.width}×${viewport.height} have no horizontal overflow`,async()=>{for(const name of ['PLAY','SHOP','AWARDS','SETTINGS']){await nav(name);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} overflow`);}await nav('PLAY');});
  await shot(`showroom-${viewport.width}x${viewport.height}`);
 }
 await page.setViewportSize({width:390,height:844});
 for(const viewport of [{width:320,height:700},{width:844,height:390}]){await page.setViewportSize(viewport);for(const toy of TOYS){await check(`${toy.name} stage and controls accessible at ${viewport.width}×${viewport.height}`,async()=>{await nav('PLAY');await toyButton(toy.name).click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const stage=page.locator('.toy-stage');const b=await stage.boundingBox();assert.ok(b.width>100&&b.height>100);await page.getByRole('button',{name:/45s CHALLENGE/}).scrollIntoViewIfNeeded();await shot(`layout-${toy.id}-${viewport.width}`);const clipped=await page.evaluate(()=>{const field=document.querySelector('.play-field').getBoundingClientRect();return [...document.querySelectorAll('.toy-stage button,.toy-stage input,.toy-stage canvas,.angular-surface')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.bottom>field.bottom+1||r.top<field.top-1||r.left<field.left-1||r.right>field.right+1)}).map(e=>e.getAttribute('aria-label')||e.textContent);});assert.deepEqual(clipped,[],'interactive toy controls clipped by play-field');assert.ok(await page.getByRole('button',{name:/45s CHALLENGE/}).isVisible());await page.getByRole('button',{name:/Back to arcade/i}).click();});const back=page.getByRole('button',{name:/Back to arcade/i});if(await back.count())await back.click();}}
 await page.setViewportSize({width:390,height:844});
 await check('effects create one reusable Web Audio context after touch',async()=>{await nav('PLAY');await toyButton('Pop Frenzy').click();for(let i=1;i<=3;i++){await page.getByRole('button',{name:`Bubble ${i}`,exact:true}).tap();await page.waitForTimeout(80);}const audio=await page.evaluate(()=>window.__audioMetrics);assert.equal(audio.contexts,1);assert.ok(audio.oscillators>0);await page.getByRole('button',{name:/Back to arcade/i}).click();});
 await check('visibility transition flushes a recent action immediately',async()=>{await nav('PLAY');await toyButton('Pop Frenzy').click();const before=await saved();await page.getByRole('button',{name:'Bubble 1',exact:true}).tap();const flushed=await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const value=JSON.parse(localStorage.getItem('uff-save-v2'));delete document.visibilityState;delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return value;});assert.equal(flushed.interactions,before.interactions+1);await page.getByRole('button',{name:/Back to arcade/i}).click();});
 for(const toy of TOYS){await check(`${toy.name} genuine freeplay action earns progression`,async()=>{
  await nav('PLAY');await toyButton(toy.name).click();const before=await saved();
  if(toy.id==='pop')await page.getByRole('button',{name:'Bubble 1',exact:true}).tap();
  if(toy.id==='switch')await page.getByRole('switch',{name:'Circuit 1'}).tap();
  if(toy.id==='piano')await page.getByRole('button',{name:'C note',exact:true}).tap();
  if(toy.id==='spinner'||toy.id==='dial'){const surface=page.locator('.angular-surface');const b=await surface.boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2,r=b.width*.32;await page.mouse.move(cx+r,cy);await page.mouse.down();const limit=toy.id==='spinner'?Math.PI*4:Math.PI/2;for(let i=1;i<=48;i++){const a=limit*i/48;await page.mouse.move(cx+Math.cos(a)*r,cy+Math.sin(a)*r);await page.waitForTimeout(8);}await page.mouse.up();}
  if(toy.id==='sliders'){const fader=page.getByRole('slider',{name:/Warmth/});await fader.scrollIntoViewIfNeeded();const b=await fader.boundingBox();await page.mouse.move(b.x+8+(b.width-16)*.2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+8+(b.width-16)*.72,b.y+b.height/2,{steps:12});await page.mouse.up();}
  if(toy.id==='marble'||toy.id==='magnet'){
   const board=page.locator('canvas');await board.scrollIntoViewIfNeeded();const b=await board.boundingBox();await page.mouse.move(b.x+b.width*.5,b.y+30);await page.mouse.down();
   if(toy.id==='magnet'){for(const y of [.25,.5,.75])for(const x of [.2,.5,.8]){await page.mouse.move(b.x+b.width*x,b.y+b.height*y,{steps:8});await page.waitForTimeout(220);}await page.waitForTimeout(400);}
   const oscillators=await page.evaluate(()=>window.__audioMetrics.oscillators);await page.mouse.up();if(toy.id==='marble'){await page.waitForTimeout(80);assert.ok(await page.evaluate(()=>window.__audioMetrics.oscillators)>oscillators,'drop sound starts before landing');assert.equal((await saved()).interactions,before.interactions,'drop alone does not score');await page.waitForTimeout(9000);}
  }
  const after=await saved();assert.ok(after.interactions>before.interactions,`${toy.id} meaningful actions`);assert.ok(after.xp>before.xp);await shot(`toy-${toy.id}`);
  await page.getByRole('button',{name:/Back to arcade/i}).click();
 });const back=page.getByRole('button',{name:/Back to arcade/i});if(await back.count())await back.click();}
 await check('genuine actions persist across reload',async()=>{const before=await saved();await page.reload();const after=await saved();assert.equal(after.xp,before.xp);assert.equal(after.interactions,before.interactions);await showroom();});
 await check('first touch award claims once and remains claimed',async()=>{await nav('AWARDS');const card=page.locator('article').filter({hasText:'FIRST TOUCH'});const before=await saved();await card.getByRole('button',{name:/CLAIM/i}).click();const after=await saved();assert.equal(after.gems,before.gems+20);assert.ok(after.claimed.includes('first'));await page.reload();await nav('AWARDS');assert.ok((await saved()).claimed.includes('first'));assert.ok(await card.getByRole('button').isDisabled());await shot('awards-claimed');});
 await check('45 second challenge scores real target hits and completes with reward',async()=>{
  await nav('PLAY');await toyButton('Pop Frenzy').click();await page.getByRole('button',{name:/45s CHALLENGE/}).click();
  for(let i=0;i<10;i++)await page.getByRole('button',{name:/Bubble \d+, target/}).tap();
  const during=await saved();assert.ok(during.interactions>=10);await shot('challenge-running');
  await page.getByRole('button',{name:/ONE MORE ROUND/}).waitFor({timeout:47000});const completed=await saved();
  assert.ok(completed.best.pop>=120);assert.ok(completed.gems>during.gems);assert.equal(completed.daily.rounds,1);await shot('challenge-result');
  await page.getByRole('button',{name:/FREE PLAY/i}).click();assert.equal(await page.getByRole('button',{name:/45s CHALLENGE/}).count(),1);await page.getByRole('button',{name:/Back to arcade/i}).click();
 });
 await check('locked radio cannot play or equip a station and blocked stream fails honestly',async()=>{
  await nav('SETTINGS');const before=await saved();assert.equal(mediaRequests.length,0,'no radio autoplay');
  await page.getByRole('button',{name:/Vaporwaves/}).click();assert.equal((await saved()).settings.station,before.settings.station,'locked station unchanged');
  await nav('SETTINGS');
  await page.route(/somafm.*(?:mp3|aac)|ice\d*\.somafm/,r=>r.abort('internetdisconnected'));
  await page.getByRole('button',{name:'Play radio',exact:true}).click();
  await page.getByText('Stream unavailable. Check your connection and retry.').waitFor({timeout:18000});
  assert.equal(await page.getByText('Live stream playing',{exact:true}).count(),0);await shot('radio-unavailable');
 });
 await check('shop previews without spending, buys atomically, equips and persists station',async()=>{
  await nav('SHOP');await page.getByRole('tab',{name:/RADIO/i}).click();const before=await saved();
  await page.getByRole('button',{name:'Preview Vaporwaves',exact:true}).click();await page.getByRole('dialog',{name:'Vaporwaves preview'}).waitFor();assert.equal((await saved()).gems,before.gems);await shot('shop-preview');await page.getByRole('button',{name:'Close preview'}).click();
  await page.getByRole('button',{name:'Buy Vaporwaves for 80 Gems'}).click();const immediate=await page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')));assert.equal(immediate.gems,before.gems-80,'purchase committed immediately');const bought=await saved();assert.equal(bought.gems,before.gems-80);assert.ok(bought.owned.includes('vaporwaves'));
  if(await page.getByRole('button',{name:'Equip Vaporwaves',exact:true}).count())await page.getByRole('button',{name:'Equip Vaporwaves',exact:true}).click();
  assert.equal((await saved()).settings.station,'vaporwaves');const controller=await page.evaluate(async()=>{const {radio}=await import('/src/audio/radio.ts');return radio.snapshot();});assert.equal(controller.station,'vaporwaves','shop equip synchronizes global radio');assert.equal(controller.status,'paused');await page.reload();assert.equal((await saved()).settings.station,'vaporwaves');await nav('SETTINGS');await page.getByRole('button',{name:/Vaporwaves/}).waitFor();await shot('radio-owned');
 });
 await check('reduced motion setting persists and suppresses decorative toy bursts',async()=>{await nav('SETTINGS');await page.getByRole('button',{name:'REDUCED MOTION OFF',exact:true}).click();assert.equal((await saved()).settings.reducedMotion,true);await page.reload();await nav('PLAY');await toyButton('Pop Frenzy').click();await page.getByRole('button',{name:'Bubble 1',exact:true}).tap();assert.equal(await page.locator('.toy-bursts span').count(),0);assert.ok(await page.locator('.toy-stage.reduced-motion').count());await page.getByRole('button',{name:/Back to arcade/i}).click();});
 await check('no uncaught application errors during navigation',async()=>{for(const name of ['SHOP','AWARDS','SETTINGS','PLAY'])await nav(name);assert.deepEqual(errors,[]);});
 await shot('showroom-final');
}
await writeFile(`${artifactDir}/${baseline?'baseline':'browser'}-results.json`,JSON.stringify({testedAt:new Date().toISOString(),base,checks,errors},null,2));
await browser.close();
if(checks.some(x=>x.status==='FAIL'))process.exitCode=1;
