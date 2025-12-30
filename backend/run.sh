#!/bin/bash

echo "Instalando dependencias..."
pip install -r requirements.txt

echo ""
echo "Iniciando servidor FastAPI..."
python main.py
