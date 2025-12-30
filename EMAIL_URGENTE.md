# 🚨 EMAIL NÃO ESTÁ FUNCIONANDO? FAÇA ISTO AGORA!

## ⚡ PASSO 1: Teste Super Rápido

Abra um terminal na pasta `backend/` e execute:

```bash
python test_email_simple.py
```

**Este script vai dizer exatamente qual é o problema!**

---

## ✅ Se o teste funcionar:

Parabéns! Seu email está OK. Então o problema é outra coisa:

1. Pare o backend (Ctrl+C)
2. Execute novamente: `python main.py`
3. Teste o formulário novamente

---

## ❌ Se receber erro de autenticação:

```
❌ ERRO DE AUTENTICAÇÃO
SMTPAuthenticationError: [Errno 535] '5.7.8 Username and password not accepted'
```

**SOLUÇÃO - Faça isto:**

1. Abra: https://myaccount.google.com/apppasswords
2. Você vai ver uma tela pedindo "Selecionar app" e "Selecionar dispositivo"
3. Selecione: **"Mail"** e **"Windows Computer"** (ou Mac/Linux)
4. Clique em "Gerar"
5. Google vai mostrar uma senha com 16 caracteres (tipo: `abcd efgh ijkl mnop`)
6. Copie essa senha (toda, sem espaços)
7. Abra o arquivo `backend/.env`
8. Encontre a linha: `EMAIL_PASSWORD=`
9. Substitua pelo que você copiou do Google
10. Salve o arquivo
11. Feche o terminal do backend (Ctrl+C)
12. Execute novamente: `python main.py`
13. Execute novamente o teste: `python test_email_simple.py`

---

## 🔍 As Credenciais Estão Corretas:

Seu arquivo `backend/.env` está assim:

```
EMAIL_FROM=unidadegoias036@gmail.com
EMAIL_PASSWORD=zhzf cziy ewml cxvw
EMAIL_TO=unidadegoias036@gmail.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
```

✅ **Todas as credenciais que você deu estão aqui!**

---

## 📧 Checklist:

- [ ] Executei `python test_email_simple.py`
- [ ] O teste passou (disse "SUCESSO")?
- [ ] Se não, regenerei a senha do Google
- [ ] Atualizei o arquivo `backend/.env`
- [ ] Reiniciei o backend com `python main.py`
- [ ] Executei o teste novamente

---

## 🚀 Depois que o teste passar:

1. Tenha certeza de que o backend está rodando: `python main.py`
2. Abra o frontend: http://localhost:8081
3. Preencha o formulário
4. Clique em "Atualizar pagamento"
5. **VOCÊ VAI RECEBER O EMAIL!** ✅

---

## 💬 Se ainda não funcionar:

Execute isto e me mostre a saída completa:

```bash
python test_email_simple.py
```

Copie tudo que aparecer no terminal e envie. Com isso posso diagnosticar o problema exato.

---

**TUDO BEM, VAI DAR CERTO AGORA! 💪**
