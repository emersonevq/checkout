#!/bin/bash

echo "Instalando dependencias..."
pip install -r requirements.txt

echo ""
echo "Iniciando servidor FastAPI na porta 5555..."
echo "Acesse: http://localhost:5555"
echo "Documentacao interativa: http://localhost:5555/docs"
echo ""
python main.py
