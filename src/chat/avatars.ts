import {leaderAPI,type Rankings,type RankingQuery} from '../leaders/api.ts';
const TTL=5*60*1000;
const key=(name:string)=>name.trim().replace(/^@/,'').toLowerCase();
/** Reuse photos already present on our public leaderboard, without a new service.
 * This lookup is asynchronous and never gates chat admission, sending or gameplay. */
export class ChatAvatarDirectory {
 private cache=new Map<string,{url:string|null;at:number}>();
 private inflight:Promise<void>|null=null;
 private query:(q:RankingQuery)=>Promise<Pick<Rankings,'players'|'hasMore'|'totalPlayers'>>;
 constructor(query:(q:RankingQuery)=>Promise<Pick<Rankings,'players'|'hasMore'|'totalPlayers'>>=q=>leaderAPI.rankings(q)){this.query=query;}
 async resolve(names:string[]):Promise<Record<string,string>>{
  const wanted=[...new Set(names.map(key).filter(Boolean))];
  if(this.inflight)await this.inflight;
  const pending=wanted.filter(name=>Date.now()-(this.cache.get(name)?.at??-Infinity)>=TTL);
  if(pending.length){const work=this.fetch(pending);this.inflight=work;try{await work}finally{if(this.inflight===work)this.inflight=null}}
  return Object.fromEntries(wanted.flatMap(name=>{const url=this.cache.get(name)?.url;return url?[[name,url]]:[]}));
 }
 private async fetch(names:string[]){
  const now=Date.now(),remaining=new Set(names);
  for(const [name,entry]of this.cache)if(now-entry.at>=TTL)this.cache.delete(name);
  for(const name of names)this.cache.set(name,{url:null,at:now});
  try{let offset=0,total=Infinity;
   while(remaining.size&&offset<total){
    const data=await this.query({period:'all-time',toyId:'overall',limit:100,offset});total=Math.min(total,data.totalPlayers);
    for(const p of data.players){const name=key(p.username);if(!name)continue;let url:string|null=null;try{const parsed=new URL(p.avatar||'');if(parsed.protocol==='https:'||parsed.protocol==='http:')url=parsed.href}catch{}this.cache.set(name,{url,at:now});remaining.delete(name);}
    if(!data.hasMore)break;offset+=100;
   }
  }catch{/* Missing/offline photos retain the ordinary initial fallback. */}
 }
}
export const chatAvatars=new ChatAvatarDirectory();
