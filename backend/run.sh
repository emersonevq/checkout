#!/bin/bash

echo "Instalando dependencias..."
pip install -r requirements.txt

echo ""
echo "Iniciando servidor FastAPI na porta 5000..."
echo "Acesse: http://localhost:5000"
echo "Documentacao interativa: http://localhost:5000/docs"
echo ""
python main.py
