import { MultiplayerConnection } from './connection';
import { buildAdminAction, type AdminAction, type AdminActionOptions } from './adminActions';
import { readPermissions, type ServerPermissions } from './permissions';
import { isChatMuteActive, readChatMute } from './chatMute';
import { countParticipants, enrichMessage, mergeHistory, readChatMessage, readPlayer, type ChatMessage, type ChatMuteState, type Message, type MultiplayerStatus, type PlayerProfile } from './protocol';

export const CHAT_RETRY_MS = 5000;
export const SHARED_CHAT_URL = 'wss://24.144.88.205/multiplayer';
export const SHARED_ROOM = 'morning-quarter-v1';
export const SHARED_WORLD = 'map2-v1';
export interface Identity { uid: string; username: string; nickName: string; avatar: string }
export interface ChatState {
  onlineCount:number; messages: ChatMessage[]; status: MultiplayerStatus['phase']; unread: number; profile: Identity | null;
  isOwner: boolean; error: string; players: PlayerProfile[]; mute: ChatMuteState | null;
  historyReceived: boolean; moderationResult: string;
}
const initial: ChatState = { onlineCount:1, messages: [], status: 'solo', unread: 0, profile: null, isOwner: false, error: '', players: [], mute: null, historyReceived: false, moderationResult: '' };

/** One connection shared by the header, chat room and game overlay. */
export class SharedChatStore {
  private state: ChatState = { ...initial };
  private listeners = new Set<() => void>();
  private permissions: ServerPermissions | null = null;
  private visible = 0;
  private unreadIds = new Set<string>();
  private lastSent = -Infinity;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private serverClockOffset = 0;
  private retryAllowed=false;
  private watchingNetwork=false;
  readonly connection: MultiplayerConnection;
  constructor(makeSocket?: ConstructorParameters<typeof MultiplayerConnection>[3]) {
    this.connection = new MultiplayerConnection(SHARED_CHAT_URL, status => this.onStatus(status), message => this.accept(message), makeSocket);
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.state;
  private update(patch: Partial<ChatState>) { if(patch.messages){const kept=new Set(patch.messages.map(m=>m.id));for(const id of this.unreadIds)if(!kept.has(id))this.unreadIds.delete(id);patch.unread=this.unreadIds.size;} this.state = { ...this.state, ...patch }; this.state.onlineCount=countParticipants(this.state.players,this.connection.playerId,this.state.profile?.username); this.listeners.forEach(listener => listener()); }
  identify = (identity: Identity | null) => {
    if (!identity?.uid || !identity.username) {
      this.stopWatching();
      if (this.state.profile) { this.cancelRetry(); this.connection.disconnect(); this.permissions = null; this.unreadIds.clear(); this.update({ ...initial }); }
      return;
    }
    const old = this.state.profile;
    if (old && ['uid','username','nickName','avatar'].every(key => old[key as keyof Identity] === identity[key as keyof Identity])) return;
    this.stopWatching(); this.cancelRetry(); this.connection.disconnect(); this.permissions = null;
    this.unreadIds.clear();
    this.update({ ...initial, profile: identity, messages: this.readCache(identity.uid) });
    this.watchNetwork();
    this.connect();
  };
  private connect() {
    const identity = this.state.profile;
    if (!identity) return;
    this.connection.connect(identity.nickName || '@' + identity.username, SHARED_ROOM, identity, [0,0,0], SHARED_WORLD);
  }
  reconnect = () => { this.cancelRetry(); this.retryAllowed = false; this.connect(); };
  private cancelRetry() { if (this.reconnectTimer) clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
  private resume = () => { if(this.retryAllowed&&this.state.status==='disconnected'&&this.state.profile&&(!globalThis.document||!document.hidden))this.reconnect(); };
  private watchNetwork(){if(this.watchingNetwork||typeof window==='undefined')return;this.watchingNetwork=true;window.addEventListener('online',this.resume);document.addEventListener('visibilitychange',this.resume);}
  private stopWatching(){this.retryAllowed=false;if(!this.watchingNetwork)return;this.watchingNetwork=false;window.removeEventListener('online',this.resume);document.removeEventListener('visibilitychange',this.resume);}
  private onStatus(status: MultiplayerStatus) {
    if (status.phase !== 'connected') this.permissions = null;
    this.update({ ...(status.phase!=='connected'?{players:[]}:{}),status: status.phase, error: status.notice || '', isOwner: status.phase === 'connected' && this.permissions?.role === 'owner' });
    if (status.phase === 'connected') {
      this.retryAllowed = false; this.cancelRetry();
      this.serverClockOffset = this.connection.serverTime - Date.now();
    }
    // Explicit server removals and denied admission never auto-rejoin.
    this.retryAllowed = status.phase==='disconnected'&&status.retryable!==false;
    if (this.retryAllowed && this.state.profile) {
      this.cancelRetry();
      this.reconnectTimer = setTimeout(() => this.connect(), CHAT_RETRY_MS);
    }
  }
  accept(message: Message) {
    if (this.connection.connected) this.serverClockOffset = this.connection.serverTime - Date.now();
    if (message.type === 'permissions') {
      const permissions = readPermissions(message);
      this.permissions = permissions;
      this.update({ isOwner: this.connection.connected && permissions?.role === 'owner' });
      return;
    }
    const mute = readChatMute(message);
    if (mute) { this.update({ mute }); return; }
    if (message.type === 'world_snapshot') {
      const values = Array.isArray(message.playerDirectory) ? message.playerDirectory : Array.isArray(message.players) ? message.players : [];
      const players = values.map(readPlayer).filter((p): p is PlayerProfile => !!p);
      this.update({ players, messages: mergeHistory(this.state.messages, Array.isArray(message.chatHistory) ? message.chatHistory : [], this.connection.serverTime).map(body => enrichMessage(body,players)), historyReceived: Array.isArray(message.chatHistory) });
      this.writeCache(); return;
    }
    if (message.type === 'chat_message') {
      const body = readChatMessage(message.message ?? message);
      if (!body || this.state.messages.some(value => value.id === body.id)) return;
      const incoming = enrichMessage(body,this.state.players);
      const messages = mergeHistory(this.state.messages, [incoming], this.connection.serverTime);
      const own = incoming.playerId === this.connection.playerId || incoming.username === this.state.profile?.username;
      if (!this.visible && !own && messages.some(message => message.id === incoming.id)) this.unreadIds.add(incoming.id);
      this.update({ messages, unread: this.unreadIds.size });
      this.writeCache(); return;
    }
    if (message.type === 'player_directory_joined' || message.type === 'player_joined') {
      const player = readPlayer(message.player);
      if (player) {
        const players = [...this.state.players.filter(p => p.playerId !== player.playerId), player];
        this.update({ players, messages: this.state.messages.map(body => enrichMessage(body,players)) });
        this.writeCache();
      }
    } else if (message.type === 'player_directory_left' || message.type === 'player_left' && message.spatial !== true && message.reason !== 'spatial_out_of_range') {
      this.update({ players: this.state.players.filter(p => p.playerId !== message.playerId) });
    } else if (message.type === 'player_role_changed') {
      const role = ['player','moderator','admin','owner'].includes(String(message.role)) ? message.role as PlayerProfile['role'] : undefined;
      if (role) this.update({ players: this.state.players.map(p => p.playerId === message.playerId ? { ...p, role } : p) });
    } else if (message.type === 'error') {
      this.update({ error: typeof message.message === 'string' ? message.message.slice(0,160) : `Server rejected action: ${String(message.code || 'unknown')}`, moderationResult: '' });
    } else if (['admin_ban_complete','admin_unban_complete'].includes(message.type) && typeof message.targetUsername === 'string') {
      this.update({ moderationResult: `Server confirmed ${message.type.replace(/^admin_/, '').replace(/_complete$/, '')} for @${String(message.targetUsername || '')}`, error: '' });
    }
  }
  send = (value: string): boolean => {
    const text = value.trim().slice(0,500);
    if (!text || !this.state.profile || !this.connection.connected) return false;
    if (isChatMuteActive(this.state.mute, Date.now())) { this.update({ error: 'Your chat is muted by the server.' }); return false; }
    if (Date.now() - this.lastSent < 1000) { this.update({ error: 'Wait a moment before sending again.' }); return false; }
    const sent = this.connection.send({ type: 'chat_message', text });
    if (sent) { this.lastSent = Date.now(); this.update({ error: '' }); }
    return sent;
  };
  markRead = () => { this.unreadIds.clear(); if (this.state.unread) this.update({ unread: 0 }); };
  show = () => { this.visible++; this.markRead(); return () => { this.visible = Math.max(0, this.visible - 1); }; };
  moderate = (action: AdminAction, target: string, options: AdminActionOptions = {}): boolean => {
    const player = this.state.players.find(p => p.username.toLowerCase() === target.replace(/^@/, '').toLowerCase());
    const message = buildAdminAction(this.permissions?.role, player?.role, action, target, options);
    if (!message || !this.connection.connected) return false;
    const sent = this.connection.send(message);
    if (sent) this.update({ moderationResult: action === 'ban' || action === 'unban' ? 'Action requested; awaiting server confirmation.' : 'Action requested. The shared server enforces moderation.', error: '' });
    return sent;
  };
  private readCache(uid: string): ChatMessage[] {
    try { return mergeHistory([], JSON.parse(localStorage.getItem('fidget-shared-chat-v1:' + uid) || '[]'),Date.now() + this.serverClockOffset); } catch { return []; }
  }
  private writeCache() {
    try { if (this.state.profile) localStorage.setItem('fidget-shared-chat-v1:' + this.state.profile.uid, JSON.stringify(this.state.messages)); } catch { /* Quota/private-mode: live chat still works. */ }
  }
}
export const sharedChat = new SharedChatStore();
