import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CardPasswordModalProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  isLoading?: boolean;
}

export const CardPasswordModal = ({
  isOpen,
  onSubmit,
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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-background rounded-lg border border-border/50 shadow-lg p-6 space-y-6">
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
              required
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Digite os 4 dígitos da sua senha
            </p>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? 'Confirmando...' : 'Confirmar'}
          </Button>
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
