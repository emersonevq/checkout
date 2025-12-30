import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente de rota protegida
 * Atualmente permite acesso direto ao admin
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return <>{children}</>;
};
