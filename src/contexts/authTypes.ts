
import { User } from '../types/User';

export interface AuthContextData {
  user: User | undefined;
  token: string | undefined;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}
