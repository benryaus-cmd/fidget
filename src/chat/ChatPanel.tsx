import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUp, X, Users, Shield, RefreshCw } from 'lucide-react';
import { useChat } from './useChat';
import { sharedChat } from './store';
import {chatAvatars} from './avatars';
import { chatMuteLabel, isChatMuteActive } from './chatMute';
import type { ChatMessage } from './protocol';
import './chat.css';

export default function ChatPanel({ mode, onClose }: { mode: 'overlay' | 'room'; onClose: () => void }) {
  const chat = useChat();
  const [text,setText] = useState('');
  const [photos,setPhotos]=useState<Record<string,string>>({});
  const [selection,setSelected] = useState<ChatMessage | null>(null);
  const selected = chat.messages.find(message => message.id === selection?.id) ?? selection;
  const [duration,setDuration] = useState(10);
  const [now,setNow] = useState(Date.now());
  const [viewport,setViewport] = useState({ height: 500, bottom: 0, roomHeight: 500 });
  const panel = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const connected = chat.status === 'connected';
  useEffect(() => sharedChat.show(), []);
  useLayoutEffect(() => {
    const resize = () => {
      const element = panel.current;
      if (!element) return;
      const host = element.closest('.uff') ?? element.parentElement;
      if (!host) return;
      const hostRect = host.getBoundingClientRect();
      const view = window.visualViewport;
      const visibleBottom = view ? view.offsetTop + view.height : window.innerHeight;
      const occlusion = Math.max(0,hostRect.bottom - visibleBottom);
      const parent = element.parentElement!;
      const padding = getComputedStyle(parent);
      const roomHeight = Math.max(0,Math.min(parent.clientHeight - parseFloat(padding.paddingTop || '0') - parseFloat(padding.paddingBottom || '0'), visibleBottom - element.getBoundingClientRect().top - 8));
      const next = { height: Math.round(Math.max(0,hostRect.height - 50 - 8 - Math.max(46,occlusion))), bottom: Math.round(Math.max(46,occlusion) + 8), roomHeight: Math.round(roomHeight) };
      setViewport(old => old.height === next.height && old.bottom === next.bottom && old.roomHeight === next.roomHeight ? old : next);
    };
    resize(); window.addEventListener('resize',resize); window.visualViewport?.addEventListener('resize',resize); window.visualViewport?.addEventListener('scroll',resize);
    const observer = new ResizeObserver(resize);
    if (panel.current?.parentElement) observer.observe(panel.current.parentElement);
    const host = panel.current?.closest('.uff'); if (host) observer.observe(host);
    return () => { observer.disconnect(); window.removeEventListener('resize',resize); window.visualViewport?.removeEventListener('resize',resize); window.visualViewport?.removeEventListener('scroll',resize); };
  },[mode]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()),1000); return () => clearInterval(timer); },[]);
  useLayoutEffect(() => { if (list.current) list.current.scrollTop = list.current.scrollHeight; chat.markRead(); }, [chat.messages, viewport.height, viewport.roomHeight, selected]);
  const send = () => { if (chat.send(text)) { setText(''); input.current?.focus(); } };
  const muted = isChatMuteActive(chat.mute,now);
  const sharedPhoto=(message:ChatMessage)=>chat.players.find(player=>player.playerId===message.playerId)?.avatar||message.avatar;
  const missing=Array.from(new Set(chat.messages.filter(message=>message.username&&message.username!==chat.profile?.username&&!sharedPhoto(message)).map(message=>message.username!.toLowerCase()))).sort().join('\0');
  useEffect(()=>{let live=true;if(missing)void chatAvatars.resolve(missing.split('\0')).then(next=>{if(live)setPhotos(old=>({...old,...next}))});return()=>{live=false}},[missing]);
  const avatar = (message: ChatMessage) => message.username === chat.profile?.username ? chat.profile?.avatar||sharedPhoto(message) : sharedPhoto(message)||photos[message.username?.toLowerCase()||''];
  return <section ref={panel} className={`shared-chat shared-chat-${mode}`} aria-label="Shared community chat" style={{ '--chat-vh': `${viewport.height}px`, '--chat-bottom': `${viewport.bottom}px`, '--chat-room-height': `${viewport.roomHeight}px` } as React.CSSProperties} onKeyDown={event => event.stopPropagation()}>
    <header className="shared-chat-head"><div><span className="shared-chat-label">HUBSIDE COMMUNITY</span><h2>Community chat <i className={'chat-status chat-status-' + chat.status}/></h2></div><div className="shared-chat-head-actions"><span title="People in the shared room, including you"><Users size={13}/>{chat.onlineCount}</span><button onClick={onClose} aria-label="Close chat"><X size={19}/></button></div></header>
    <div className="shared-chat-meta"><span>{chat.profile ? `${chat.profile.nickName || '@' + chat.profile.username} · ${connected ? 'LIVE' : chat.status.toUpperCase()}` : chat.profileLoading ? 'Loading Aippy profile…' : 'Open in Aippy to connect your profile'}</span>{chat.status === 'disconnected' && <button onClick={chat.reconnect} aria-label="Reconnect chat"><RefreshCw size={13}/></button>}</div>
    <div className="shared-chat-log" role="log" aria-live="polite" aria-relevant="additions" ref={list}>
      {!chat.messages.length && <div className="shared-chat-empty">{connected ? 'The room is quiet. Start a conversation.' : 'Your community conversation appears here.'}</div>}
      {chat.messages.map(message => <article className="shared-chat-message" key={message.id}>
        <button className="shared-chat-avatar" onClick={() => setSelected(selected?.id === message.id ? null : message)} aria-label={`View ${message.nickName || message.displayName}'s profile`}><span>{(message.nickName || message.username || message.displayName).slice(0,1).toUpperCase()}</span>{avatar(message)&&<img key={avatar(message)} src={avatar(message)} alt="" referrerPolicy="no-referrer" onError={event=>{event.currentTarget.hidden=true}}/>}</button>
        <div><div className="shared-chat-byline"><button onClick={() => setSelected(selected?.id === message.id ? null : message)}>{message.nickName || message.displayName}</button>{message.username && <span>@{message.username}</span>}<time dateTime={new Date(message.timestamp).toISOString()}>{new Date(message.timestamp).toLocaleTimeString([], { hour:'2-digit',minute:'2-digit' })}</time></div><p>{message.text}</p></div>
      </article>)}
    </div>
    {selected && <div className="shared-chat-profile"><button className="shared-chat-profile-close" onClick={() => setSelected(null)} aria-label="Close profile"><X size={14}/></button><strong>{selected.nickName || selected.displayName}</strong><span>{selected.username ? '@'+selected.username : 'Shared room player'}</span>{chat.isOwner && selected.username && selected.username !== chat.profile?.username && <div className="shared-chat-moderation"><span><Shield size={13}/> OWNER CONTROLS</span><label>Duration (minutes)<input type="number" min={1} max={10080} value={duration} onChange={event => setDuration(Number(event.target.value))}/></label><div>{(['mute','unmute','kick','ban','unban'] as const).map(action => <button key={action} onClick={() => chat.moderate(action,selected.username!,action === 'mute' ? { durationMinutes: duration } : action === 'ban' ? { durationSeconds: duration * 60 } : {})}>{action}</button>)}</div></div>}</div>}
    {(chat.error || chat.moderationResult || chat.mute?.muted) && <p className="shared-chat-notice" role="status">{chat.error || chat.moderationResult || chatMuteLabel(chat.mute,now)}</p>}
    <div className="shared-chat-history">Latest 15 messages · reconnects automatically</div>
    <form className="shared-chat-compose" onSubmit={event => { event.preventDefault(); send(); }}><textarea ref={input} aria-label="Message shared community" rows={1} maxLength={500} value={text} onChange={event => setText(event.target.value)} onKeyDown={event => { event.stopPropagation(); if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} disabled={!connected || muted} placeholder={muted ? 'Muted by the server' : connected ? 'Message the community…' : 'Connect in Aippy to chat'}/><button type="submit" disabled={!connected || muted || !text.trim()} aria-label="Send message"><ArrowUp size={19}/></button></form>
  </section>;
}
