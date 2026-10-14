import { useEffect, useSyncExternalStore } from 'react';
import { useUserInfo } from '@aippy/runtime/user';
import { sharedChat } from './store';
export function useChat() {
  const user = useUserInfo();
  const state = useSyncExternalStore(sharedChat.subscribe, sharedChat.getSnapshot, sharedChat.getSnapshot);
  useEffect(() => {
    if (!user.isLoading) sharedChat.identify(user.uid && user.username ? { uid: user.uid, username: user.username, nickName: user.nickName, avatar: user.avatar } : null);
  }, [user.isLoading,user.uid,user.username,user.nickName,user.avatar]);
  return { ...state, profileLoading: user.isLoading, send: sharedChat.send, markRead: sharedChat.markRead, moderate: sharedChat.moderate, reconnect: sharedChat.reconnect };
}
