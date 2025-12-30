import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CardPasswordModalProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CardPasswordModal = ({
  isOpen,
  onSubmit,
  onCancel,
  isLoading = false,
}: CardPasswordModalProps) => {
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-0">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />

      {/* Modal */}
      <div className="relative z-10 w-full h-full sm:h-auto sm:max-w-sm bg-background sm:rounded-lg border-0 sm:border sm:border-border/50 shadow-none sm:shadow-lg p-6 sm:p-6 space-y-6 flex flex-col sm:flex-col justify-center">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Confirmação de Identidade
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Insira a senha do seu cartão para confirmar
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Senha do cartão
            </label>
            <Input
              placeholder="••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Digite os 4 dígitos da sua senha (opcional)
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </div>
        </form>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs border-t border-border/50 pt-4">
          <Lock className="h-3 w-3" />
          <span>Seus dados estão protegidos e criptografados</span>
        </div>
      </div>
    </div>
  );
};
