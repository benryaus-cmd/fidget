import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:8088');
 await page.getByRole('button',{name:/LET'S PLAY/}).tap();
 await page.getByRole('button',{name:'Pop Frenzy',exact:true}).tap();
 await page.getByRole('button',{name:'Bubble 1',exact:true}).tap();
 await page.waitForTimeout(400);
 const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')));
 assert.equal(save.interactions,1);assert.ok(save.xp>0);
 await page.getByRole('button',{name:'Back to arcade',exact:true}).tap();
 await page.getByRole('button',{name:'SHOP',exact:true}).tap();
 await page.getByRole('tab',{name:'RADIO',exact:true}).tap();
 await page.getByRole('button',{name:'Buy Vaporwaves for 80 Gems',exact:true}).tap();
 const purchase=await page.evaluate(()=>JSON.parse(localStorage.getItem('uff-save-v2')));assert.equal(purchase.gems,10);assert.equal(purchase.settings.station,'vaporwaves');
 await page.reload();await page.getByRole('button',{name:/LET'S PLAY/}).tap();
 assert.equal(await page.getByRole('button',{name:'10 Gems'}).count(),1);
 assert.equal(await page.locator('#root>.uff').count(),1);assert.deepEqual(errors,[]);
 console.log('Production bundle boot, actual touch pop, immediate purchase, reload persistence and one root passed.');
}finally{await browser.close()}
