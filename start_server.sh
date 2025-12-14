#!/bin/bash

echo "========================================"
echo "  Démarrage du serveur Chatbot Python"
echo "========================================"
echo ""
echo "Installation des dépendances..."
pip install -r requirements.txt
echo ""
echo "Démarrage du serveur Flask..."
echo "Le serveur sera accessible sur http://localhost:5000"
echo ""
python app.py
