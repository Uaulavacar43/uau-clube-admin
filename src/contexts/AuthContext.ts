
import { createContext } from 'react';
import { AuthContextData } from './authTypes';

export const AuthContext = createContext<AuthContextData | undefined>(undefined);
