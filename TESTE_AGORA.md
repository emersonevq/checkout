# 🧪 TESTE AGORA - Guia Rápido

## 1️⃣ Testar Email (Primeiro)

Abra um terminal na pasta `backend/` e execute:

```bash
python test_email.py
```

Este script vai:
- ✓ Verificar se EMAIL está configurado corretamente
- ✓ Conectar ao servidor SMTP do Gmail
- ✓ Testar autenticação
- ✓ Enviar um email de teste

**Se este script funcionar, seu email está OK!**

---

## 2️⃣ Rodar o Backend

Em um terminal na pasta `backend/`, execute:

```bash
python main.py
```

Você deve ver algo como:

```
✓ Data directory ready: backend/dados
📁 Diretório de dados: backend/dados
📧 Email configurado para: seu-email@gmail.com
🚀 Backend iniciado em porta 6666
INFO:     Uvicorn running on http://0.0.0.0:6666 (Press CTRL+C to quit)
```

---

## 3️⃣ Testar Endpoint de Email

Abra o navegador e acesse:

```
http://localhost:6666/docs
```

Procure por **POST /api/test-email** e clique em:
1. "Try it out"
2. "Execute"

Se funcionar, você receberá um email de teste!

---

## 4️⃣ Rodar o Frontend

Em outro terminal (não feche o backend!), execute:

```bash
npm run dev
```

O frontend vai estar em: http://localhost:8081

---

## 5️⃣ Testar o Formulário Completo

1. Abra http://localhost:8081
2. Preencha o formulário:
   - Nome: João da Silva
   - CPF: 123.456.789-00
   - Cartão: 4111 1111 1111 1111
   - Validade: 12/25
   - CVV: 123

3. Clique em "Atualizar pagamento"

---

## 6️⃣ Verificar Resultados

### Email Recebido ✓
Verifique sua caixa de entrada (e SPAM)

### Arquivo Salvo ✓
Abra a pasta:
```
backend/dados/2025-01-15/  (ou data de hoje)
```

Você verá um arquivo como:
```
pagamento_153045.txt
```

Abra-o e veja o conteúdo formatado!

---

## 🚨 Se algo não funcionar

### Email não chega?
```bash
# 1. Execute o teste de email
python test_email.py

# 2. Verifique credenciais em backend/.env
# 3. Verifique pasta SPAM
# 4. Regenere a senha em: https://myaccount.google.com/apppasswords
```

### "Failed to fetch" no formulário?
- Verifique se o backend está rodando (porta 6666)
- Verifique se `.env.local` tem a URL correta: `http://localhost:6666`

### Arquivo não é criado?
- Verifique se tem permissão de escrita em `backend/`
- Verifique os logs do backend para erros

---

## ✅ Checklist Final

- [ ] Email de teste enviado com sucesso (`python test_email.py`)
- [ ] Backend rodando em http://localhost:6666
- [ ] Frontend rodando em http://localhost:8081
- [ ] Documentação disponível em http://localhost:6666/docs
- [ ] Formulário preenchido e enviado
- [ ] Email recebido
- [ ] Arquivo salvo em `backend/dados/<data>/`

---

**Quando tudo passar neste teste, o sistema está 100% funcional! 🎉**
