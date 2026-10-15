import {createRequire} from 'node:module';import assert from 'node:assert/strict';import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=createRequire(import.meta.url)('playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:610},hasTouch:true,isMobile:true});page.setDefaultTimeout(5000);const checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));await mkdir('tests/stage1-artifacts',{recursive:true});
const saved=async()=>{await page.waitForTimeout(300);return page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')))};
const check=async(name,fn)=>{try{await fn();checks.push({name,status:'PASS'})}catch(e){checks.push({name,status:'FAIL',detail:e.message});await page.screenshot({path:`tests/stage1-artifacts/failure-${checks.length}.png`});}console.log(checks.at(-1));};
const back=async()=>{const b=page.getByRole('button',{name:'Back to arcade',exact:true});if(await b.count())await b.click();};
const open=async name=>{await back();await page.getByRole('button',{name:'PLAY',exact:true}).click();await page.getByRole('button',{name,exact:true}).click();};
try{
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:5210');
 await check('classic Pop remains the default and Domino needs a deliberate switch',async()=>{await open('Pop Frenzy');assert.equal(await page.getByRole('button',{name:'DOMINO free play',exact:true}).getAttribute('aria-pressed'),'false');assert.equal(await page.locator('[data-bubble]').count(),25);await page.getByRole('button',{name:'DOMINO free play',exact:true}).click();assert.equal(await page.locator('[data-domino]').count(),25);});
 await check('a genuine three-neighbour sweep starts a bounded cascade and only manual pops earn',async()=>{
  const before=await saved(),centres=[];for(const i of [0,1,2]){const b=await page.locator(`[data-domino="${i}"]`).boundingBox();centres.push({x:b.x+b.width/2,y:b.y+b.height/2});}
  await page.mouse.move(centres[0].x,centres[0].y);await page.mouse.down();await page.mouse.move(centres[1].x,centres[1].y,{steps:5});await page.mouse.move(centres[2].x,centres[2].y,{steps:5});await page.mouse.up();await page.waitForTimeout(650);
  const automatic=await page.locator('.domino-auto').count();assert.ok(automatic>0&&automatic<=8);assert.equal(await page.locator('.domino-housing .bubble.popped').count(),3+automatic);const after=await saved();assert.equal(after.interactions,before.interactions+3);assert.equal(after.xp,before.xp+9);await page.screenshot({path:'tests/stage1-artifacts/domino-cascade.png'});
 });
 await check('Domino clears and flips without awarding a classic board-clear milestone',async()=>{
  const before=await saved();for(let i=0;i<25&&!(await page.locator('.domino-housing.board-cleared').count());i++){const b=page.locator('.domino-housing .bubble:not(.popped)').first();if(await b.count())await b.click();}
  await page.getByText('DOMINO CLEAR!',{exact:true}).waitFor();await page.waitForTimeout(850);assert.equal(await page.locator('.domino-housing .bubble.popped').count(),0);assert.equal((await saved()).milestones['pop-board-clear']??0,before.milestones['pop-board-clear']??0);
 });
 await check('a second finger ending cannot interrupt the active Domino sweep',async()=>{
  const points=[];for(const i of [0,1,2]){const b=await page.locator(`[data-domino="${i}"]`).boundingBox();points.push({x:b.x+b.width/2,y:b.y+b.height/2});}
  await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();await page.locator('.domino-housing').dispatchEvent('pointerup',{pointerId:77,pointerType:'touch'});await page.mouse.move(points[1].x,points[1].y,{steps:5});await page.mouse.move(points[2].x,points[2].y,{steps:5});await page.mouse.up();await page.waitForTimeout(650);assert.ok(await page.locator('.domino-auto').count()>0);
 });
 await check('ranked Pop ignores the sandbox switch and uses 12-point target events',async()=>{
  await page.getByRole('button',{name:'Leaderboard Challenge',exact:true}).click();assert.equal(await page.locator('.toy-variant').count(),0);assert.equal(await page.locator('[data-domino]').count(),0);assert.equal(await page.locator('[data-bubble]').count(),25);await page.getByRole('button',{name:/Bubble \d+, target/}).click();assert.equal((await page.locator('.live-score').innerText()).replace(/\s/g,''),'12PTS');await back();
 });
 await check('catch practice has a visible arc and a real timed catch changes the target',async()=>{
  await open('Spin Lab');await page.getByRole('button',{name:'CATCH GAME free play',exact:true}).click();const surface=page.locator('.angular-surface');assert.equal(await page.locator('.brake-target').count(),1);const target=await page.locator('.brake-target circle').getAttribute('cx');let caught=false;
  for(let attempt=0;attempt<4&&!caught;attempt++){
   const b=await surface.boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2,r=b.width*.32;await page.mouse.move(cx+r,cy);await page.mouse.down();for(let i=1;i<=48;i++){const a=Math.PI*2*i/48;await page.mouse.move(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}await page.mouse.up();
   await page.evaluate(()=>new Promise(resolve=>{const start=performance.now();const check=()=>{const matrix=new DOMMatrix(getComputedStyle(document.querySelector('.spinner-rotor')).transform),angle=Math.atan2(matrix.b,matrix.a),c=document.querySelector('.brake-target circle'),target=Math.atan2(Number(c.getAttribute('cy'))-50,Number(c.getAttribute('cx'))-50),error=Math.atan2(Math.sin(angle-target),Math.cos(angle-target));if(Math.abs(error)<.08||performance.now()-start>1600)resolve();else requestAnimationFrame(check)};requestAnimationFrame(check)}));
   await page.mouse.down();caught=(await page.locator('.toy-status').innerText()).includes('1 clean catches');if(caught)await page.screenshot({path:'tests/stage1-artifacts/perfect-catch.png'});await page.mouse.up();
  }
  assert.equal(caught,true);await page.getByText('PERFECT CATCH! Next mint arc.',{exact:true}).waitFor();assert.notEqual(await page.locator('.brake-target circle').getAttribute('cx'),target);
 });
 await check('Orbit captures via an actual touch hold and releases eight into a vortex',async()=>{
  await open('Magnet Field');await page.getByRole('button',{name:'ORBIT free play',exact:true}).click();const before=await saved(),canvas=page.locator('.orbit-housing canvas'),b=await canvas.boundingBox(),cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+b.width/2,y:b.y+b.height/2,id:9}]});await canvas.locator('xpath=.').evaluate(el=>new Promise((resolve,reject)=>{const start=performance.now();const poll=()=>{if(el.dataset.orbit==='8')resolve();else if(performance.now()-start>6500)reject(Error('orbit did not gather'));else requestAnimationFrame(poll)};poll()}));
  assert.equal((await saved()).interactions,before.interactions+8);await page.screenshot({path:'tests/stage1-artifacts/orbit-held.png'});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.getByText('VORTEX CLEAR! A fresh constellation is coming.',{exact:true}).waitFor();assert.equal((await saved()).interactions,before.interactions+8);await page.screenshot({path:'tests/stage1-artifacts/vortex-clear.png'});await page.waitForTimeout(1200);assert.equal(await canvas.getAttribute('data-banked'),'0');await cdp.detach();
 });
 await check('cancelled orbit recapture does not repay previously caught crystals',async()=>{
  const canvas=page.locator('.orbit-housing canvas'),b=await canvas.boundingBox(),before=await saved();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(1500);await canvas.dispatchEvent('pointercancel',{pointerId:1,pointerType:'mouse'});await page.mouse.up();await page.mouse.down();await page.waitForTimeout(3200);assert.equal((await saved()).interactions,before.interactions+8);await page.mouse.up();await back();
 });
 for(const {width,height} of [{width:320,height:520},{width:390,height:610},{width:430,height:650}]){
  await page.setViewportSize({width,height});for(const [toy,mode] of [['Pop Frenzy','DOMINO'],['Spin Lab','CATCH GAME'],['Magnet Field','ORBIT']]){
   await check(`${mode} fits ${width}×${height}`,async()=>{await open(toy);await page.getByRole('button',{name:`${mode} free play`,exact:true}).click();const area=await page.locator('.play-field').boundingBox();for(const el of await page.locator('.toy-stage button,.toy-stage canvas,.angular-surface').all()){const b=await el.boundingBox();assert.ok(b&&b.x>=area.x-1&&b.y>=area.y-1&&b.x+b.width<=area.x+area.width+1&&b.y+b.height<=area.y+area.height+1,`${toy} ${JSON.stringify(b)} outside ${JSON.stringify(area)}`);}await page.screenshot({path:`tests/stage1-artifacts/${mode.replace(/ /g,'-')}-${width}.png`});});
  }
 }
 await check('no uncaught production errors',async()=>assert.deepEqual(errors,[]));
}finally{await browser.close();await writeFile('tests/stage1-artifacts/results.json',JSON.stringify({checks,errors},null,2));}
if(checks.some(c=>c.status==='FAIL'))process.exitCode=1;
