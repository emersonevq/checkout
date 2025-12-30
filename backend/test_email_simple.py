#!/usr/bin/env python3
"""
TESTE SUPER SIMPLES DE EMAIL
Execute este script para debugar problemas de email
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

print("\n" + "="*80)
print("🧪 TESTE SIMPLES DE EMAIL")
print("="*80)

# Ler credenciais do .env
EMAIL_FROM = os.getenv("EMAIL_FROM", "").strip()
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "").strip()
EMAIL_TO = os.getenv("EMAIL_TO", "").strip()

print(f"\n1️⃣  Credenciais do arquivo .env:")
print(f"   EMAIL_FROM: {EMAIL_FROM}")
print(f"   EMAIL_PASSWORD: {'CARREGADO' if EMAIL_PASSWORD else '❌ NÃO CARREGADO'}")
print(f"   EMAIL_TO: {EMAIL_TO}")

# Validar
if not EMAIL_FROM:
    print("\n❌ ERRO: EMAIL_FROM vazio em .env")
    exit(1)

if not EMAIL_PASSWORD:
    print("\n❌ ERRO: EMAIL_PASSWORD vazio em .env")
    exit(1)

if not EMAIL_TO:
    print("\n❌ ERRO: EMAIL_TO vazio em .env")
    exit(1)

print("\n✅ Todas as credenciais foram carregadas")

# Tentar enviar
print(f"\n2️⃣  Conectando ao Gmail SMTP...")

try:
    server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
    print("   ✓ Conectado")
    
    print(f"\n3️⃣  Iniciando TLS...")
    server.starttls()
    print("   ✓ TLS ativado")
    
    print(f"\n4️⃣  Autenticando...")
    server.login(EMAIL_FROM, EMAIL_PASSWORD)
    print("   ✓ Autenticação bem-sucedida")
    
    print(f"\n5️⃣  Criando email de teste...")
    message = MIMEMultipart("alternative")
    message["Subject"] = "🧪 TESTE DE EMAIL - Sistema de Pagamento"
    message["From"] = EMAIL_FROM
    message["To"] = EMAIL_TO
    
    text = "Se você recebeu este email, tudo está funcionando!"
    html = "<h2>✅ Teste de Email com Sucesso!</h2><p>Se você recebeu este email, o sistema está configurado corretamente.</p>"
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    message.attach(part1)
    message.attach(part2)
    
    print("   ✓ Email criado")
    
    print(f"\n6️⃣  Enviando para: {EMAIL_TO}...")
    server.sendmail(EMAIL_FROM, EMAIL_TO, message.as_string())
    print("   ✓ Email enviado!")
    
    server.quit()
    
    print("\n" + "="*80)
    print("✅ SUCESSO! EMAIL ENVIADO COM SUCESSO!")
    print("="*80)
    print(f"\nVerifique sua caixa de entrada em: {EMAIL_TO}")
    print("O email deve chegar em poucos segundos.\n")
    
except smtplib.SMTPAuthenticationError as e:
    print(f"\n❌ ERRO DE AUTENTICAÇÃO")
    print(f"Mensagem: {str(e)}")
    print("\n⚠️  SOLUÇÃO:")
    print("  1. Acesse: https://myaccount.google.com/apppasswords")
    print("  2. Selecione 'Mail' e 'Windows Computer'")
    print("  3. Google vai gerar uma senha de 16 caracteres")
    print("  4. Copie essa senha e atualize EMAIL_PASSWORD no arquivo backend/.env")
    print("  5. Salve o arquivo e execute novamente: python test_email_simple.py\n")
    
except Exception as e:
    print(f"\n❌ ERRO: {str(e)}")
    print("\n⚠️  VERIFIQUE:")
    print("  1. Sua conexão com internet")
    print("  2. Se o arquivo backend/.env existe")
    print("  3. Se as credenciais estão corretas\n")
