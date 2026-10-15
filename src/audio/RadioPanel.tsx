import { useEffect, useSyncExternalStore } from 'react';
import { Radio, Play, Pause, RotateCcw, LockKeyhole } from 'lucide-react';
import { radio, STATIONS } from './radio';
import './audio.css';
type Props={station:string;volume:number;owned:string[];onStation:(id:string)=>void;onVolume:(n:number)=>void;onShop:()=>void};
export default function RadioPanel({station,volume,owned,onStation,onVolume,onShop}:Props){
  const state=useSyncExternalStore(radio.subscribe,radio.snapshot,radio.snapshot);
  const canUse=(id:string)=>id==='poptron'||owned.includes(id)||owned.includes(`radio-${id}`)||owned.includes(`station-${id}`);
  useEffect(()=>{radio.select(canUse(station)?station:'poptron');},[station,owned.join(',')]);
  useEffect(()=>{radio.volume(volume);},[volume]);
  const active=STATIONS.find(s=>s.id===state.station)??STATIONS[0];
  const busy=state.status==='playing'||state.status==='loading';
  return <section className="uff-radio" aria-label="Studio radio">
    <div className="uff-radio-heading"><Radio size={24}/><div><h2>Studio radio</h2><p>Your soundtrack. Your pace.</p></div><span className="uff-radio-live">LIVE</span></div>
    <div className={`uff-radio-now ${state.status==='playing'?'is-playing':''}`}>
      <div className="uff-radio-bars" aria-hidden="true"><i/><i/><i/><i/><i/></div>
      <div><strong>{active.name}</strong><p role="status" aria-live="polite">{state.status==='playing'?'Live stream playing':state.status==='loading'?'Connecting…':state.status==='error'?'Stream unavailable. Check your connection and retry.':'Paused · tap play to listen'}</p></div>
      <button className="uff-radio-play" aria-label={busy?'Pause radio':state.status==='error'?'Retry radio':'Play radio'} onClick={()=>busy?radio.pause():radio.play()}>{busy?<Pause size={24}/>:state.status==='error'?<RotateCcw size={23}/>:<Play size={24}/>}</button>
    </div>
    <label className="uff-radio-volume">Radio volume <span>{Math.round(volume*100)}%</span><input aria-label="Radio volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={e=>onVolume(Number(e.target.value))}/></label>
    <div className="uff-radio-stations">{STATIONS.map(s=>{const unlocked=canUse(s.id);return <button key={s.id} className={state.station===s.id?'is-selected':''} aria-pressed={state.station===s.id} onClick={()=>{if(!unlocked){onShop();return;}radio.select(s.id);onStation(s.id);}}><span className="uff-radio-dot"/><span><strong>{s.name}</strong><small>{s.mood}</small></span>{unlocked?<span className="uff-radio-tag">{s.id==='poptron'?'FREE':'OWNED'}</span>:<LockKeyhole size={17} aria-label="Unlock in shop"/>}</button>;})}</div>
    <p className="uff-radio-footnote">Radio stations from SomaFM. Choosing a station pauses playback. Radio uses mobile data.</p>
  </section>;
}
