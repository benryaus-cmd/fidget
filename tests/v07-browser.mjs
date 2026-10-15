import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:390,height:610},isMobile:true,hasTouch:true});
await page.addInitScript(()=>{const seed=sessionStorage.getItem('uff-v07-seed');if(seed){localStorage.setItem('uff-save-v2',seed);sessionStorage.removeItem('uff-v07-seed');}});
const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('tests/v07-artifacts',{recursive:true});
const check=async(name,fn)=>{try{await fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',detail:e.message});await page.screenshot({path:`tests/v07-artifacts/failure-${checks.length}.png`});}console.log(checks.at(-1));};
const saved=async()=>{await page.waitForTimeout(320);return page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')))};
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5200');
 await check('welcome bubbles move before Play without earning progress',async()=>{const first=page.getByRole('button',{name:'Play with bubble 3',exact:true});await first.waitFor();const before=await first.boundingBox(),save=await saved();await page.waitForTimeout(450);const after=await first.boundingBox();assert.ok(Math.hypot(after.x-before.x,after.y-before.y)>1);assert.equal((await saved()).interactions,save.interactions);await page.screenshot({path:'tests/v07-artifacts/welcome-live.png'});});
 await page.getByRole('button',{name:'PLAY',exact:true}).click();
 await page.getByRole('button',{name:'Slider Sync',exact:true}).click();
 await check('track tap never teleports the handle or pays a reward',async()=>{
  const slider=page.getByRole('slider',{name:/Warmth/}),before=await saved();
  const old=await slider.evaluate(e=>e.getAttribute('aria-valuenow')??e.value),track=await page.locator('.slider-track').first().boundingBox();
  await page.touchscreen.tap(track.x+track.width*.75,track.y+track.height/2);
  assert.equal(await slider.evaluate(e=>e.getAttribute('aria-valuenow')??e.value),old);
  assert.equal((await saved()).interactions,before.interactions);
 });

 await check('edge grab preserves offset, precise drag scores once, and track stays inert',async()=>{
  const f=page.getByRole('slider',{name:/Warmth/}),b=await f.boundingBox(),track=await page.locator('.slider-track').first().boundingBox(),before=await saved();
  await page.mouse.move(b.x+b.width-4,b.y+b.height/2);await page.mouse.down();
  assert.equal(await f.getAttribute('aria-valuenow'),'20');
  await page.mouse.move(b.x+b.width-4+track.width*.52,b.y+b.height/2,{steps:16});await page.mouse.up();
  assert.equal(await f.getAttribute('aria-valuenow'),'72');assert.equal((await saved()).interactions,before.interactions+1);
  await page.mouse.up();assert.equal((await saved()).interactions,before.interactions+1);
 });
 await check('cancelled drag restores the original value without scoring',async()=>{
  const f=page.getByRole('slider',{name:/Resonance/}),b=await f.boundingBox(),track=await page.locator('.slider-track').nth(1).boundingBox(),before=await saved();
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2-track.width*.22,b.y+b.height/2,{steps:8});
  assert.equal(await f.getAttribute('aria-valuenow'),'28');await f.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await page.mouse.up();
  assert.equal(await f.getAttribute('aria-valuenow'),'50');assert.equal((await saved()).interactions,before.interactions);
 });
 await check('touchscreen handle drag follows the finger and scores on release',async()=>{
  const f=page.getByRole('slider',{name:/Energy/}),b=await f.boundingBox(),t=await page.locator('.slider-track').nth(2).boundingBox(),before=await saved(),cdp=await page.context().newCDPSession(page),x=b.x+b.width/2,y=b.y+b.height/2;
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:7}]});for(let i=1;i<=12;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-t.width*.22*i/12,y,id:7}]});assert.equal((await saved()).interactions,before.interactions);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal(await f.getAttribute('aria-valuenow'),'58');assert.equal((await saved()).interactions,before.interactions+1);await cdp.detach();
 });
 await check('keyboard adjustments work and only a completed release earns points',async()=>{
  const f=page.getByRole('slider',{name:/Resonance/}),before=await saved();await f.focus();
  await page.keyboard.down('ArrowLeft');await page.keyboard.up('ArrowLeft');assert.equal(await f.getAttribute('aria-valuenow'),'49');assert.equal((await saved()).interactions,before.interactions);
 });
 await page.getByRole('button',{name:'Back to arcade',exact:true}).click();
 await check('studio goal pins from a preview and survives reload',async()=>{
  await page.getByRole('button',{name:'SHOP',exact:true}).click();await page.getByRole('button',{name:'Preview Electric Sunset',exact:true}).click();await page.getByRole('button',{name:'PIN AS MY NEXT GOAL',exact:true}).click();
  assert.equal((await saved()).goal,'electric');await page.reload();await page.getByRole('button',{name:'PLAY',exact:true}).click();await page.getByRole('button',{name:'View goal Electric Sunset',exact:true}).waitFor();assert.equal((await saved()).goal,'electric');
 });
 await check('purchasing the pinned item clears the goal and preserves earlier play',async()=>{
  const before=await saved();await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('uff-save-v2'));s.gems=500;sessionStorage.setItem('uff-v07-seed',JSON.stringify(s));});await page.reload();await page.getByRole('button',{name:'SHOP',exact:true}).click();await page.getByRole('button',{name:'Buy Electric Sunset for 180 Gems',exact:true}).click();
  const after=await saved();assert.equal(after.goal,null);assert.equal(after.gems,320);assert.equal(after.interactions,before.interactions);assert.equal(after.theme,'electric');
 });
 await check('Pip wardrobe goal opens on the pinned hat preview',async()=>{
  await page.getByRole('button',{name:'Open pet studio',exact:true}).click();await page.getByRole('tab',{name:'HATS',exact:true}).click();await page.getByRole('button',{name:'Preview Little DJ pet style',exact:true}).click();await page.getByRole('button',{name:'PIN LITTLE DJ · ◆ 55',exact:true}).click();await page.getByRole('button',{name:'Close pet studio',exact:true}).click();
  await page.getByRole('button',{name:'PLAY',exact:true}).click();await page.getByRole('button',{name:'View goal Little DJ',exact:true}).click();assert.equal(await page.getByRole('tab',{name:'HATS',exact:true}).getAttribute('aria-selected'),'true');await page.getByText('TRYING LITTLE DJ',{exact:true}).waitFor();await page.getByRole('button',{name:'Buy Little DJ for 55 Gems',exact:true}).click();assert.equal((await saved()).goal,null);await page.getByRole('button',{name:'Close pet studio',exact:true}).click();
 });
 await check('welcome merges and burst respond to actual drags without minting rewards',async()=>{
  await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('uff-save-v2'));s.settings.reducedMotion=true;sessionStorage.setItem('uff-v07-seed',JSON.stringify(s));});await page.reload();
  const before=await saved();const drag=async()=>{const a=await page.getByRole('button',{name:'Play with bubble 1',exact:true}).boundingBox(),b=await page.getByRole('button',{name:'Play with bubble 2',exact:true}).boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:15});await page.mouse.up();};
  await drag();assert.equal(await page.locator('.welcome-bubble[data-level="1"]').count(),2);await page.getByText('A BIGGER WOBBLE! MERGE THE TWO BIG ONES',{exact:true}).waitFor();await drag();await page.getByText('BIG SQUISH! GO AGAIN?',{exact:true}).waitFor();
  await page.waitForTimeout(800);assert.equal(await page.locator('.welcome-burst').count(),0);const after=await saved();assert.equal(after.gems,before.gems);assert.equal(after.xp,before.xp);assert.equal(after.interactions,before.interactions);assert.equal(after.pet.feeds,before.pet.feeds);
 });

 await check('leaderboard sliders require three genuine releases, lock individually, and keep 30-point caps',async()=>{
  await page.getByRole('button',{name:'PLAY',exact:true}).click();await page.getByRole('button',{name:'Slider Sync',exact:true}).click();await page.getByRole('button',{name:'Leaderboard Challenge',exact:true}).click();
  for(const [index,target] of [[0,72],[1,28],[2,58]]){const f=page.locator('.fader-handle').nth(index),start=Number(await f.getAttribute('aria-valuenow')),b=await f.boundingBox(),t=await page.locator('.slider-track').nth(index).boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+t.width*(target-start)/100,b.y+b.height/2,{steps:15});await page.mouse.up();if(index<2)assert.equal(await f.isDisabled(),true);}
  assert.equal((await page.locator('.live-score').innerText()).replace(/\s/g,''),'90PTS');assert.equal(await page.locator('.fader-handle:disabled').count(),0);await page.getByText('All synced! Tune the next set.',{exact:true}).waitFor();assert.equal(await page.locator('.pet-dock').getAttribute('data-event'),'slider-sync');await page.screenshot({path:'tests/v07-artifacts/sliders-synced.png'});await page.getByRole('button',{name:'Back to arcade',exact:true}).click();
 });
 await check('spinner coasts, can be grabbed to brake, and Pip notices',async()=>{
  await page.getByRole('button',{name:'Spin Lab',exact:true}).click();await page.waitForTimeout(1500);const surface=page.locator('.angular-surface'),b=await surface.boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2,r=b.width*.32;
  await page.mouse.move(cx+r,cy);await page.mouse.down();for(let i=1;i<=40;i++){const a=Math.PI*2*i/40;await page.mouse.move(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}
  await page.mouse.up();await page.waitForTimeout(50);assert.equal(await surface.getAttribute('data-motion'),'coasting');await page.mouse.down();await page.waitForTimeout(50);assert.equal(await surface.getAttribute('data-motion'),'held');assert.equal(await page.locator('.pet-dock').getAttribute('data-event'),'spin-brake');await page.mouse.up();await page.screenshot({path:'tests/v07-artifacts/spinner-brake.png'});await page.getByRole('button',{name:'Back to arcade',exact:true}).click();
 });
 await check('magnet completes a physical wave and celebrates without bonus score events',async()=>{
  await page.getByRole('button',{name:'Magnet Field',exact:true}).click();const before=await saved(),board=await page.locator('.field-housing canvas').boundingBox();await page.mouse.move(board.x+board.width*.15,board.y+board.height*.2);await page.mouse.down();
  outer:for(let pass=0;pass<3;pass++)for(let row=0;row<4;row++){for(let col=0;col<4;col++){if((await page.locator('.toy-status').innerText()).includes('Wave collected'))break outer;const x=row%2?3-col:col;await page.mouse.move(board.x+board.width*(.1+x*.26),board.y+board.height*(.15+row*.22),{steps:6});await page.waitForTimeout(350);}}
  // Aim at remaining visible crystal pixels, as a player would after the broad sweep.
  for(let attempt=0;attempt<8&&!(await page.locator('.toy-status').innerText()).includes('Wave collected');attempt++){
   const spot=await page.locator('.field-housing canvas').evaluate(c=>{const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data,colors=[[251,109,168],[255,197,117],[183,237,133],[105,231,206],[121,180,255],[179,150,255],[242,134,223]],hits=colors.map(()=>({x:0,y:0,n:0}));for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,k=colors.findIndex(v=>v[0]===pixels[i]&&v[1]===pixels[i+1]&&v[2]===pixels[i+2]);if(k>=0){hits[k].x+=x;hits[k].y+=y;hits[k].n++;}}const p=hits.find(h=>h.n>5);return p?{x:p.x/p.n/c.width,y:p.y/p.n/c.height}:null;});
   if(!spot)break;await page.mouse.move(board.x+board.width*spot.x,board.y+board.height*spot.y,{steps:8});await page.waitForTimeout(650);
  }
  await page.getByText('Wave collected! Release to recharge.',{exact:true}).waitFor({timeout:3000});assert.equal((await saved()).interactions,before.interactions+8);await page.mouse.up();await page.getByText('Recharged. Sweep the next crystal wave.',{exact:true}).waitFor();await page.screenshot({path:'tests/v07-artifacts/magnet-wave.png'});await page.getByRole('button',{name:'Back to arcade',exact:true}).click();
 });
 for(const {width,height} of [{width:320,height:520},{width:390,height:610},{width:430,height:650}]){
  await page.setViewportSize({width,height});await page.reload();
  await check(`welcome controls and play fit ${width}×${height}`,async()=>{const viewport=page.viewportSize();for(const locator of [page.getByRole('button',{name:/LET'S PLAY/}),page.locator('.bottom-nav'),page.locator('.welcome-bubble-field')]){const b=await locator.boundingBox();assert.ok(b&&b.width>50&&b.x>=0&&b.y>=0&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1,JSON.stringify(b));}});
  await page.screenshot({path:`tests/v07-artifacts/welcome-${width}.png`});
  await page.getByRole('button',{name:'PLAY',exact:true}).click();await page.getByRole('button',{name:'Pop Frenzy',exact:true}).click();
  await check(`Pop board clears and flips once at ${width}`,async()=>{const before=await saved();for(let i=1;i<=25;i++)await page.getByRole('button',{name:`Bubble ${i}`,exact:true}).click();await page.locator('[data-board-clear]').waitFor();await page.screenshot({path:`tests/v07-artifacts/clear-${width}.png`});await page.waitForTimeout(800);assert.equal(await page.locator('.bubble.popped').count(),0);assert.equal((await saved()).interactions,before.interactions+25);});
 }
 await check('no production JavaScript errors',async()=>assert.deepEqual(errors,[]));

}finally{await browser.close();await writeFile('tests/v07-artifacts/results.json',JSON.stringify({checks,errors},null,2));}
if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
