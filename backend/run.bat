@echo off
echo Instalando dependencias...
pip install -r requirements.txt

echo.
echo Iniciando servidor FastAPI na porta 6666...
echo Acesse: http://localhost:6666
echo Documentacao interativa: http://localhost:6666/docs
echo.
python main.py
