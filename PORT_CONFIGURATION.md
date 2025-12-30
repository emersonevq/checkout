# 🔌 Configuração de Portas

## Portas do Projeto

| Serviço | Porta | URL |
|---------|-------|-----|
| **Frontend (React)** | 8081 | http://localhost:8081 |
| **Backend (FastAPI)** | 5555 | http://localhost:5555 |
| **Backend Docs (Swagger)** | 5555 | http://localhost:5555/docs |

---

## 🚀 Como Rodar

### Terminal 1 - Backend (Porta 5555)

```bash
cd backend
python main.py
```

Você verá:
```
INFO:     Uvicorn running on http://0.0.0.0:5555 (Press CTRL+C to quit)
```

✅ Backend disponível em: `http://localhost:5555`

### Terminal 2 - Frontend (Porta 8081)

```bash
npm run dev
```

Você verá:
```
VITE v5.4.19  ready in 234 ms

➜  Local:   http://localhost:8081/
```

✅ Frontend disponível em: `http://localhost:8081`

---

## 📝 Arquivos de Configuração

### Frontend - `vite.config.ts`
```typescript
server: {
  host: "::",
  port: 8081,  // ← Frontend porta 8081
}
```

### Backend - `backend/main.py`
```python
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5555)  # ← Backend porta 5555
```

### Variáveis de Ambiente - `.env.local`
```
VITE_BACKEND_URL=http://localhost:5555  # ← Frontend conecta ao backend aqui
```

### CORS - `backend/main.py`
```python
origins = [
    "http://localhost:8081",   # ← Permite requisições do frontend
    "http://localhost:5555",   # ← Permite requisições internas
    "http://127.0.0.1:8081",
    "http://127.0.0.1:5555",
]
```

---

## ✅ Checklist de Verificação

Quando iniciar os servidores, verifique:

- [ ] Backend rodando em `http://localhost:5555`
- [ ] Frontend rodando em `http://localhost:8081`
- [ ] Documentação do backend em `http://localhost:5555/docs`
- [ ] Formulário abre sem erros em `http://localhost:8081`
- [ ] Preenchimento e envio do formulário funciona
- [ ] Email é recebido na caixa de entrada

---

## 🔄 Fluxo de Requisição

```
Frontend (8081)
    ↓ (POST /api/update-payment)
Backend (5555)
    ↓ (conecta SMTP Gmail)
Gmail
    ↓ (envia email)
seu-email@gmail.com
```

---

## 🐛 Troubleshooting

### "Conexão recusada em localhost:5555"
- Backend não está rodando
- Certifique-se de estar na pasta `backend/`
- Execute: `python main.py`

### "Conexão recusada em localhost:8081"
- Frontend não está rodando
- Certifique-se de estar na raiz do projeto
- Execute: `npm run dev`

### "CORS Error"
- Verifique se ambos os serviços estão rodando
- Verifique a porta correta no `.env.local`
- Limpe o cache do navegador (Ctrl+Shift+Del)

### Email não chega
- Verifique credenciais no `backend/.env`
- Teste o endpoint `/api/test-email` em `http://localhost:6666/docs`
- Verifique pasta de SPAM

---

## 📱 Acessos Rápidos

**Desenvolvedora/o, use estes links:**

- 🌐 Frontend: http://localhost:8081
- 🔧 Backend: http://localhost:5555
- 📚 API Docs (Swagger): http://localhost:5555/docs
- 🔌 API Redoc: http://localhost:5555/redoc

