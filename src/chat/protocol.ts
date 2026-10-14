export type Message = Record<string, unknown> & { type: string };
export type ServerRole = 'player' | 'moderator' | 'admin' | 'owner';
export interface MultiplayerStatus { phase: 'solo' | 'connecting' | 'connected' | 'disconnected'; playerCount: number; notice?: string; role?: ServerRole }
export interface ChatMuteState { muted: boolean; mutedUntil: number | null; remainingMs: number | null; receivedAt: number; reason: string }
export interface ChatMessage { id: string; playerId: string; username?: string; nickName?: string; displayName: string; text: string; timestamp: number; avatar?: string }
export interface PlayerProfile { playerId: string; username: string; nickName: string; displayName: string; role?: ServerRole; avatar?: string }
export function readPlayer(value: unknown): PlayerProfile | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Record<string, unknown>;
  const id = p.playerId ?? p.id;
  if (typeof id !== 'string' || !id) return null;
  const field = (v: unknown) => typeof v === 'string' ? v.trim().slice(0, 40) : '';
  const username = field(p.username).replace(/^@/, '');
  const nickName = field(p.nickName);
  const role = ['player','moderator','admin','owner'].includes(String(p.role)) ? p.role as ServerRole : undefined;
  const avatar = typeof p.avatar === 'string' && /^https?:\/\//i.test(p.avatar) ? p.avatar.slice(0,2000) : undefined;
  return { playerId: id, username, nickName, displayName: field(p.displayName) || nickName || (username ? '@' + username : 'PLAYER'), role, avatar };
}
export function readChatMessage(value: unknown): ChatMessage | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || !v.id || typeof v.playerId !== 'string' || !v.playerId || typeof v.text !== 'string' || typeof v.timestamp !== 'number' || !Number.isFinite(v.timestamp) || Math.abs(v.timestamp) > 8.64e15) return null;
  const p = readPlayer(v)!;
  return { id: v.id, playerId: v.playerId, username: p.username, nickName: p.nickName, displayName: p.displayName, text: v.text.slice(0,500), timestamp: v.timestamp, avatar: p.avatar };
}
export const HISTORY_WINDOW = 60 * 60 * 1000;
/** Legacy bodies can borrow missing fields only from the same server player ID. */
export function enrichMessage(message: ChatMessage, directory: PlayerProfile[]): ChatMessage {
  const player = directory.find(profile => profile.playerId === message.playerId);
  if (!player) return message;
  return { ...message, username: message.username || player.username, nickName: message.nickName || player.nickName, avatar: message.avatar || player.avatar };
}
export function mergeHistory(previous: ChatMessage[], incoming: unknown[], now = Date.now()): ChatMessage[] {
  const messages = new Map<string, ChatMessage>();
  for (const value of [...previous, ...incoming]) {
    const message = readChatMessage(value);
    if (message && message.timestamp >= now - HISTORY_WINDOW && message.timestamp <= now + 60_000) messages.set(message.id, message);
  }
  return [...messages.values()].sort((a,b) => a.timestamp - b.timestamp).slice(-2000);
}
