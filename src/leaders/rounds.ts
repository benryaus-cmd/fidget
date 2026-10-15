import {leaderAPI,LeaderError,type Profile,type ScoreEvent,type ServerRound,type Submission,type Acceptance} from './api.ts';
import type {ToyId} from '../gameplay/catalog';
export type RankedAttempt={id:string;toyId:ToyId;profile:Profile|null;server:ServerRound|null;events:ScoreEvent[];reason:string;overflow:boolean};
export type RoundStatus={state:'local'|'pending'|'retry'|'accepted'|'rejected';message:string;acceptedScore?:number;dailyRank?:number;dailyBest?:number;dailyState?:'loading'|'ready'|'unavailable'};
type Pending={id:string;body:Submission};
type Storage={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
type API=Pick<typeof leaderAPI,'start'|'submit'>&Partial<Pick<typeof leaderAPI,'rankings'>>;
const KEY='uff-leaderboards-pending-v1',MAX_PENDING=20;
const toys=new Set(['pop','spinner','switch','piano','sliders','dial','marble','magnet']);
export function captureEvent(events:ScoreEvent[],event:{kind:string;points:number},atMs:number){
 if(!Number.isFinite(event.points)||event.points<=0||!Number.isFinite(atMs)||atMs<0||atMs>45000||typeof event.kind!=='string'||!event.kind||events.length>=5000)return false;
 const at=Math.floor(atMs);if(events.length&&at<events[events.length-1].atMs)return false;events.push({kind:event.kind,points:Math.min(100,Math.floor(event.points)),atMs:at});return true;
}
const browserStorage=()=>{try{return globalThis.localStorage}catch{return undefined}};
export class RankedRounds{
 private queue:Pending[]=[];private listeners=new Set<()=>void>();private busy=new Set<string>();private snapshot:{results:Record<string,RoundStatus>;revision:number}={results:{},revision:0};
 private api:API;private storage:Storage|undefined;
 constructor(api:API=leaderAPI,storage:Storage|undefined=browserStorage()){this.api=api;this.storage=storage;
  try{const values=JSON.parse(this.storage?.getItem(KEY)??'[]');if(Array.isArray(values))this.queue=values.filter(v=>typeof v?.id==='string'&&typeof v?.body?.uid==='string'&&typeof v?.body?.roundId==='string'&&typeof v?.body?.roundSecret==='string'&&toys.has(v?.body?.toyId)&&Array.isArray(v?.body?.events)&&v.body.events.length<=5000&&Number.isFinite(v.body.score)&&Number.isFinite(v.body.elapsedMs)).slice(0,MAX_PENDING);for(const p of this.queue)this.snapshot.results[p.id]={state:'retry',message:'Saved submission ready to retry.'}}catch{}
 }
 subscribe=(fn:()=>void)=>{this.listeners.add(fn);return()=>{this.listeners.delete(fn)}};
 getSnapshot=()=>this.snapshot;
 private status(id:string,value:RoundStatus){const results={...this.snapshot.results,[id]:value};const keys=Object.keys(results);if(keys.length>100){for(const key of keys.slice(0,keys.length-100))if(!this.queue.some(p=>p.id===key))delete results[key]}this.snapshot={results,revision:this.snapshot.revision+1};for(const fn of this.listeners)fn()}
 private saveQueue(){try{this.storage?.setItem(KEY,JSON.stringify(this.queue))}catch{/* In-memory retry remains available. */}}
 pending(uid:string){return this.queue.filter(p=>p.body.uid===uid).map(p=>({id:p.id,toyId:p.body.toyId,score:p.body.score}));}
 async begin(profile:Profile|null,toyId:ToyId):Promise<RankedAttempt>{const r:RankedAttempt={id:globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random()}`,profile:profile?{...profile}:null,toyId,server:null,events:[],reason:profile?'':'Open in Aippy with your profile to rank.',overflow:false};if(profile&&this.queue.length<MAX_PENDING){try{r.server=await this.api.start(profile.uid,toyId)}catch(e){r.reason=e instanceof Error?e.message:'Ranked start unavailable.'}}else if(profile)r.reason='Retry pending scores before starting another ranked round.';return r;}
 async finish(r:RankedAttempt,elapsedMs:number,score:number){
  if(this.snapshot.results[r.id]?.state==='accepted'||this.busy.has(r.id))return;
  if(!r.server||!r.profile||r.overflow||elapsedMs<10000||score<=0||!Number.isFinite(score)||!Number.isFinite(elapsedMs)||r.events.reduce((n,e)=>n+e.points,0)!==score){this.status(r.id,{state:'local',message:r.reason||(elapsedMs<10000?'Play at least 10 seconds to submit a score.':'This round could not be verified for ranking.')});return;}
  if(!this.queue.some(p=>p.id===r.id)){const {uid,username,nickName,avatar}=r.profile;this.queue.push({id:r.id,body:{uid,username,nickName,avatar,roundId:r.server.roundId,roundSecret:r.server.roundSecret,toyId:r.toyId,elapsedMs:Math.floor(Math.min(45000,elapsedMs)),score,events:r.events.map(e=>({...e}))}});this.saveQueue()}
  await this.retry(r.id,r.profile.uid);
 }
 async retry(id:string,uid:string){const p=this.queue.find(p=>p.id===id&&p.body.uid===uid);if(!p||this.busy.has(id))return;this.busy.add(id);this.status(id,{state:'pending',message:'Sending challenge score…'});
  try{const accepted=await this.api.submit(p.body);this.queue=this.queue.filter(v=>v.id!==id);this.saveQueue();this.status(id,{state:'accepted',message:'Accepted by the leaderboard server.',acceptedScore:accepted.acceptedScore,...(this.api.rankings?{dailyState:'loading' as const}:{})});if(this.api.rankings)void this.loadPlacement(id,p.body);}
  catch(e){const retryable=!(e instanceof LeaderError)||e.retryable;if(!retryable){this.queue=this.queue.filter(v=>v.id!==id);this.saveQueue()}this.status(id,{state:retryable?'retry':'rejected',message:e instanceof Error?e.message:'Score submission unavailable.'});}
  finally{this.busy.delete(id)}
 }
 private async loadPlacement(id:string,body:Submission){
  try{const board=await this.api.rankings!({period:'daily',toyId:body.toyId,uid:body.uid,limit:1,offset:0});const current=this.snapshot.results[id];if(current?.state!=='accepted')return;const player=board.currentPlayer;if(player&&player.uid===body.uid&&player.score>=(current.acceptedScore??0))this.status(id,{...current,dailyState:'ready',dailyRank:player.rank,dailyBest:player.score});else this.status(id,{...current,dailyState:'unavailable'});}
  catch{const current=this.snapshot.results[id];if(current?.state==='accepted')this.status(id,{...current,dailyState:'unavailable'});}
 }

}
