import { useSyncExternalStore } from 'react';
import { Play, Pause, RotateCcw, SlidersHorizontal, LoaderCircle } from 'lucide-react';
import { radio, STATIONS } from './radio';
import './audio.css';
type Props={station:string;onSettings:()=>void};
/** Shares radio ownership with the settings panel; mounting this control never starts audio. */
export default function ToyMusicButton({station,onSettings}:Props){
  const state=useSyncExternalStore(radio.subscribe,radio.snapshot,radio.snapshot);
  const busy=state.status==='playing'||state.status==='loading';
  const active=STATIONS.find(s=>s.id===(busy?state.station:station))??STATIONS[0];
  const label=state.status==='loading'?'Connecting':state.status==='error'?'Retry radio':state.status==='playing'?'Pause radio':'Play radio';
  return <div className={`uff-toy-music uff-toy-music-${state.status}`} aria-label="Toy music controls">
    <button className="uff-toy-music-toggle" aria-label={`${label}: ${active.name}`} title={state.status==='error'?'Stream unavailable. Tap to retry.':`${label}: ${active.name}`} onClick={()=>{if(busy)radio.pause();else{radio.select(station);radio.play();}}}>
      {state.status==='loading'?<LoaderCircle className="uff-toy-music-loading" size={17}/>:state.status==='playing'?<Pause size={17}/>:state.status==='error'?<RotateCcw size={17}/>:<Play size={17} fill="currentColor"/>}
      <span><small>{state.status==='playing'?'LIVE MUSIC':state.status==='loading'?'CONNECTING':state.status==='error'?'RETRY MUSIC':'PLAY MUSIC'}</small><strong>{active.name}</strong></span>
    </button>
    <button className="uff-toy-music-settings" aria-label="Choose radio station and volume" title="Radio settings" onClick={onSettings}><SlidersHorizontal size={17}/></button>
    <span className="uff-audio-sr-only" role="status" aria-live="polite">{state.status==='error'?'Radio unavailable. Retry or open radio settings.':state.status==='loading'?'Radio connecting.':state.status==='playing'?`${active.name} playing.`:'Radio paused.'}</span>
  </div>;
}
