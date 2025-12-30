#!/usr/bin/env python3
"""
Script para testar a configuração de email e SMTP
Use este script para debugar problemas de email
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

def test_email_config():
    """Test email configuration"""
    
    EMAIL_FROM = os.getenv("EMAIL_FROM", "").strip()
    EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "").strip()
    EMAIL_TO = os.getenv("EMAIL_TO", "").strip()
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    
    print("\n" + "="*60)
    print("🧪 TESTE DE CONFIGURAÇÃO DE EMAIL")
    print("="*60)
    
    # 1. Verificar variáveis de ambiente
    print("\n1️⃣  Verificando variáveis de ambiente...")
    
    if not EMAIL_FROM:
        print("   ❌ EMAIL_FROM não configurado!")
        return False
    else:
        print(f"   ✓ EMAIL_FROM: {EMAIL_FROM}")
    
    if not EMAIL_PASSWORD:
        print("   ❌ EMAIL_PASSWORD não configurado!")
        return False
    else:
        print(f"   ✓ EMAIL_PASSWORD: {'*' * len(EMAIL_PASSWORD)}")
    
    if not EMAIL_TO:
        print("   ❌ EMAIL_TO não configurado!")
        return False
    else:
        print(f"   ✓ EMAIL_TO: {EMAIL_TO}")
    
    print(f"   ✓ SMTP_SERVER: {SMTP_SERVER}")
    print(f"   ✓ SMTP_PORT: {SMTP_PORT}")
    
    # 2. Testar conexão SMTP
    print("\n2️⃣  Testando conexão SMTP...")
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10)
        print(f"   ✓ Conectado a {SMTP_SERVER}:{SMTP_PORT}")
        
        # Test TLS
        server.starttls()
        print("   ✓ TLS ativado")
        
        # Test authentication
        server.login(EMAIL_FROM, EMAIL_PASSWORD)
        print("   ✓ Autenticação bem-sucedida")
        
        server.quit()
        print("   ✓ Desconectado com sucesso")
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"   ❌ Erro de autenticação: {str(e)}")
        print("      • Verifique EMAIL_FROM e EMAIL_PASSWORD")
        print("      • Para Gmail: Use App Password, não sua senha principal")
        print("      • Referência: https://myaccount.google.com/apppasswords")
        return False
    except smtplib.SMTPException as e:
        print(f"   ❌ Erro SMTP: {str(e)}")
        return False
    except Exception as e:
        print(f"   ❌ Erro de conexão: {str(e)}")
        return False
    
    # 3. Enviar email de teste
    print("\n3️⃣  Enviando email de teste...")
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "🧪 Teste de Configuração de Email"
        message["From"] = EMAIL_FROM
        message["To"] = EMAIL_TO
        
        text = """Teste de Email
================

Se você recebeu este email, a configuração está funcionando!

Configuração SMTP:
- Servidor: smtp.gmail.com
- Porta: 587
- TLS: Ativado
- Autenticação: Bem-sucedida
"""
        
        html = """
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>✓ Teste de Configuração de Email</h2>
                <p>Se você recebeu este email, a configuração está funcionando!</p>
                <h3>Configuração SMTP:</h3>
                <ul>
                    <li>Servidor: smtp.gmail.com</li>
                    <li>Porta: 587</li>
                    <li>TLS: Ativado</li>
                    <li>Autenticação: Bem-sucedida</li>
                </ul>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Este é um email automático de teste.
                </p>
            </body>
        </html>
        """
        
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, EMAIL_TO, message.as_string())
        
        print(f"   ✓ Email enviado para: {EMAIL_TO}")
        
    except Exception as e:
        print(f"   ❌ Erro ao enviar email: {str(e)}")
        return False
    
    print("\n" + "="*60)
    print("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print("="*60)
    print(f"\nVerifique seu email em: {EMAIL_TO}")
    print("O email deve chegar em poucos segundos.\n")
    
    return True

if __name__ == "__main__":
    success = test_email_config()
    exit(0 if success else 1)
