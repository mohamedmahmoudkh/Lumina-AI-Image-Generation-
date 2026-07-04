/** Auth hook — subscribe to user state */
import { store, getUser } from '../store/state.js';

export function useAuth(callback) {
  callback(getUser());
  return store.subscribe('user', callback);
}
