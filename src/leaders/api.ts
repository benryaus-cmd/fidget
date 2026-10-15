import type {ToyId} from '../gameplay/catalog';
export const API_BASE='https://24.144.88.205/api/leaderboards/v1';
export type Profile={uid:string;username:string;nickName:string;avatar:string};
export type ScoreEvent={kind:string;points:number;atMs:number};
export type ServerRound={ok:boolean;roundId:string;roundSecret:string;startedAt:string;eligibleUntil:string};
export type Submission={uid:string;roundId:string;roundSecret:string;toyId:ToyId;elapsedMs:number;score:number;events:ScoreEvent[];username:string;nickName:string;avatar:string};
export type Acceptance={ok:boolean;acceptedScore:number;overallTotal:number;personalBests:Record<string,number>;acceptedRounds:number;idempotent:boolean};
export type LeaderPlayer={uid:string;rank:number;score:number;name:string;username:string;avatar:string|null;rounds:number;achievedAt:string};
export type Rankings={players:LeaderPlayer[];currentPlayer:LeaderPlayer|null;totalPlayers:number;hasMore:boolean};
export type Meta={scoringVersion:number;serverTime:string;activeDate:string;dailyBoundary:string;nextResetAt:string};
export type RankingQuery={period:'all-time'|'daily';toyId:ToyId|'overall';uid?:string;date?:string;limit:number;offset:number};
export class LeaderError extends Error{retryable:boolean;constructor(message:string,retryable=true){super(message);this.retryable=retryable}}
const object=(v:unknown):Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:{};
const integer=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
const iso=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const bad=()=>new LeaderError('The public server is not returning leaderboard data. Please try again later.');
function player(value:unknown):LeaderPlayer{const p=object(value);if(typeof p.uid!=='string'||!integer(p.rank)||Number(p.rank)<1||!integer(p.score)||!integer(p.rounds)||typeof p.username!=='string'||typeof p.name!=='string'||!iso(p.achievedAt))throw bad();let avatar:string|null=null;try{const u=new URL(String(p.avatar));if(u.protocol==='https:'||u.protocol==='http:')avatar=u.href}catch{}return {uid:p.uid,rank:p.rank as number,score:p.score as number,rounds:p.rounds as number,name:p.name,username:p.username,avatar,achievedAt:p.achievedAt as string};}
export class LeaderAPI{
 private fetcher:typeof fetch;private timeout:number;
 constructor(fetcher:typeof fetch=(...args)=>fetch(...args),timeout=12000){this.fetcher=fetcher;this.timeout=timeout}
 private async request(path:string,body?:unknown,signal?:AbortSignal){
  const abort=new AbortController();const relay=()=>abort.abort();if(signal?.aborted)abort.abort();else signal?.addEventListener('abort',relay,{once:true});const timer=setTimeout(()=>abort.abort(),this.timeout);
  try{const r=await this.fetcher(API_BASE+path,{method:body===undefined?'GET':'POST',headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),signal:abort.signal});let raw:unknown;try{raw=await r.json()}catch{throw bad()}const value=object(raw);if(!r.ok||value.ok===false){const detail=typeof value.message==='string'?value.message:typeof value.error==='string'?value.error:`Server response ${r.status}`;throw new LeaderError(detail.slice(0,180),r.status>=500||r.status===429)}if(value.ok!==true&&!(path==='/meta'&&typeof value.scoringVersion==='number'))throw bad();return value;
  }catch(e){if(e instanceof LeaderError)throw e;throw new LeaderError(abort.signal.aborted?'Leaderboard request timed out. Your game remains playable.':'Leaderboard connection unavailable. Your game remains playable.')}finally{clearTimeout(timer);signal?.removeEventListener('abort',relay)}
 }
 async meta(signal?:AbortSignal):Promise<Meta>{const v=await this.request('/meta',undefined,signal);if(v.scoringVersion!==1)throw new LeaderError('This leaderboard scoring version needs a game update.',false);if(!iso(v.serverTime)||!iso(v.nextResetAt)||typeof v.activeDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v.activeDate)||v.dailyBoundary!=='UTC')throw bad();return v as unknown as Meta;}
 async rankings(q:RankingQuery,signal?:AbortSignal):Promise<Rankings>{const params=new URLSearchParams({period:q.period,toyId:q.toyId,limit:String(q.limit),offset:String(q.offset)});if(q.uid)params.set('uid',q.uid);if(q.date)params.set('date',q.date);const v=await this.request('/rankings?'+params,undefined,signal);if(!Array.isArray(v.players)||v.players.length>100||!integer(v.totalPlayers)||typeof v.hasMore!=='boolean'||v.currentPlayer!==null&&typeof v.currentPlayer!=='object')throw bad();return {players:v.players.map(player),currentPlayer:v.currentPlayer?player(v.currentPlayer):null,totalPlayers:v.totalPlayers as number,hasMore:v.hasMore};}
 async start(uid:string,toyId:ToyId):Promise<ServerRound>{const v=await this.request('/rounds/start',{uid,toyId});if(typeof v.roundId!=='string'||!v.roundId||typeof v.roundSecret!=='string'||!v.roundSecret||!iso(v.startedAt)||!iso(v.eligibleUntil))throw bad();return v as unknown as ServerRound;}
 async submit(body:Submission):Promise<Acceptance>{const v=await this.request('/rounds/submit',body);if(!integer(v.acceptedScore)||!integer(v.overallTotal)||!integer(v.acceptedRounds)||typeof v.idempotent!=='boolean'||!v.personalBests||typeof v.personalBests!=='object'||Array.isArray(v.personalBests)||!Object.values(v.personalBests).every(integer))throw bad();return v as unknown as Acceptance;}
}
export const leaderAPI=new LeaderAPI();
