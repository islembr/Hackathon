@echo off
echo ========================================
echo   Demarrage du serveur Chatbot Python
echo ========================================
echo.
echo [ETAPE 1/2] Installation des dependances...
pip install -r requirements.txt
echo.
echo [ETAPE 2/2] Demarrage du serveur Flask...
echo.
echo ========================================
echo   IMPORTANT : Gardez cette fenetre ouverte !
echo ========================================
echo.
echo Le serveur sera accessible sur http://localhost:5000
echo.
echo Une fois que vous voyez "Serveur demarre sur http://localhost:5000"
echo Ouvrez le fichier Hackathon.html dans votre navigateur
echo.
echo ========================================
echo.
python app.py
pause
