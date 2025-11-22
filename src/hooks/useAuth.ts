
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthContextData } from '../contexts/authTypes';

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
