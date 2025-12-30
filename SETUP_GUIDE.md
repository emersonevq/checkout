# 🚀 Guia Completo de Setup - Sistema de Pagamento com Email

## O que foi criado?

✅ **Backend FastAPI** - API para processar formulário de pagamento e enviar emails
✅ **Integração Frontend-Backend** - Formulário conectado ao backend
✅ **Configuração de Email** - SMTP Gmail já configurado

---

## 📋 Pré-requisitos

- Python 3.8+ instalado
- Node.js/npm para o frontend
- Conexão com internet

---

## 🔧 Passo a Passo

### Passo 1: Instalar Dependências do Backend

Abra um terminal/PowerShell na pasta do projeto e execute:

```bash
cd backend
pip install -r requirements.txt
```

Isso vai instalar:
- FastAPI
- Uvicorn (servidor)
- Python-dotenv (gerenciador de variáveis)

### Passo 2: Verificar Configuração de Email

O arquivo `backend/.env` já contém suas credenciais:

```
EMAIL_FROM=unidadegoias036@gmail.com
EMAIL_PASSWORD=zhzf cziy ewml cxvw
EMAIL_TO=unidadegoias036@gmail.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

✅ **Já está configurado!**

### Passo 3: Iniciar o Backend

**No Windows:**
```bash
cd backend
run.bat
```

**No Linux/Mac:**
```bash
cd backend
bash run.sh
```

**Ou manualmente:**
```bash
cd backend
python main.py
```

Você deve ver algo como:
```
INFO:     Started server process [1234]
INFO:     Waiting for application startup.
INFO:     Application startup complete [uvicorn]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Passo 4: Testar o Backend

Abra seu navegador e acesse:
```
http://localhost:8000
```

Você deve ver:
```json
{"status": "API is running", "service": "Payment Update Service"}
```

### Passo 5: Iniciar o Frontend

Em **outro terminal**, execute:

```bash
npm run dev
```

O frontend estará em: `http://localhost:5173`

### Passo 6: Testar o Sistema Completo

1. Abra o navegador no frontend: `http://localhost:5173`
2. Preencha o formulário com dados de teste
3. Clique em "Atualizar pagamento"
4. Verifique se recebeu o email!

---

## 📧 Testando o Email

### Teste Manual

Para testar se o email está funcionando, acesse:

```
http://localhost:8000/docs
```

Procure pelo endpoint `POST /api/test-email` e clique em "Try it out" > "Execute"

Você deve receber um email de teste.

### Verificar Logs

Se algo não funcionar, você verá mensagens de erro no terminal do backend.

---

## 📁 Estrutura do Projeto

```
projeto/
├── src/
│   ├── pages/
│   │   └── Index.tsx          (✅ Formulário atualizado)
│   └── ...
├── backend/
│   ├── main.py                (✅ API FastAPI)
│   ├── requirements.txt        (✅ Dependências Python)
│   ├── .env                    (✅ Configuração de email)
│   ├── .env.example            (Template)
│   ├── run.bat                 (Script Windows)
│   ├── run.sh                  (Script Linux/Mac)
│   └── README.md               (Documentação detalhada)
├── package.json
└── ...
```

---

## 🔐 Segurança

⚠️ **IMPORTANTE:**

Suas credenciais estão no arquivo `backend/.env`:
- Este arquivo está **localmente no seu computador**
- Ele **NÃO foi commitado** no git
- Se for fazer push, adicione `.env` no `.gitignore`

```bash
# Adicionar ao .gitignore
echo "backend/.env" >> .gitignore
```

---

## 📧 Fluxo de Email

Quando o usuário clica em "Atualizar pagamento":

1. **Frontend envia dados** para `http://localhost:8000/api/update-payment`
2. **Backend recebe** os dados do formulário
3. **Backend formata** um email HTML bonito com os dados
4. **Backend conecta** ao Gmail via SMTP
5. **Backend envia** o email para `unidadegoias036@gmail.com`
6. **Frontend mostra** mensagem de sucesso/erro

---

## 🐛 Troubleshooting

### "Erro: Connection refused"
- O backend não está rodando
- Execute: `cd backend && python main.py`

### "Erro: Email authentication failed"
- Senha de app incorreta
- Certifique-se de que tem autenticação 2FA no Gmail
- Regenere a senha em: https://myaccount.google.com/apppasswords

### "CORS Error no navegador"
- Backend não está rodando na porta 8000
- Verifique: `http://localhost:8000`

### "Email não chega"
- Verifique a pasta de SPAM
- Teste o endpoint `/api/test-email`
- Verifique os logs do backend

---

## 🚀 Próximos Passos

### Adicionar mais recursos:

1. **Banco de dados** - Salvar histórico de pagamentos
2. **Autenticação** - Login de usuários
3. **Validação avançada** - Verificar CPF, cartão válido
4. **Dashboard** - Painel para ver submissions recebidas
5. **Deploymen** - Colocar em produção (Heroku, Railway, etc)

---

## 📞 Suporte

Se tiver dúvidas, verifique:

1. **Backend README** - `backend/README.md`
2. **Documentação FastAPI** - `http://localhost:8000/docs` (quando rodando)
3. **Logs do terminal** - Veja mensagens de erro

---

## ✅ Checklist Final

- [x] Backend criado com FastAPI
- [x] Email configurado com Gmail
- [x] Frontend conectado ao backend
- [x] Scripts de startup criados
- [x] Documentação completa

**Tudo pronto! Bora testar! 🎉**
