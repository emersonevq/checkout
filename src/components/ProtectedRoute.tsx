import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Verifica se o usuário tem acesso ao painel admin
 * Atualmente redireciona para a página inicial
 * Pode ser expandido com autenticação no futuro
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // TODO: Implementar sistema de autenticação/autorização
  // Por enquanto, apenas clientes não têm acesso
  // Um token de admin seria armazenado em localStorage ou sessionStorage
  
  const isAdmin = localStorage.getItem('admin_token') === 'true';
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
