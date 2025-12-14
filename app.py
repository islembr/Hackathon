from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Permet les requêtes depuis le frontend

# Configuration
API_PORT = 5000

# --- Configuration API Google Gemini ---
API_KEY = "AIzaSyCjN-Wu4ccMK2A8lANhthOpZgIoKjJlYLo"
os.environ["GEMINI_API_KEY"] = API_KEY

# --- Imports LangChain pour la méthode LCEL ---
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# --- Initialisation du Modèle LangChain ---
MODEL_NAME = "gemini-2.0-flash-exp"  # Vous pouvez changer pour "gemini-2.5-flash" si disponible
llm = ChatGoogleGenerativeAI(model=MODEL_NAME, max_output_tokens=200)  # Augmenté pour des réponses plus longues

# Variable globale pour stocker la chaîne (initialisée dans init_chatbot)
chain = None

# ===== Initialisation du Chatbot LangChain =====
def init_chatbot():
    """
    Initialise le chatbot LangChain avec Google Gemini
    Utilise le code exact de votre chatbot Python
    """
    global chain
    
    # Instruction Système (identique à votre code)
    SYSTEM_INSTRUCTION = (
        "You are a highly friendly, engaging, and supportive AI conversation partner. Your main goal is to mirror and enhance the user's emotional state. "
        "1. When the user is positive or curious: Use lighthearted, playful language and inject positive humor. "
        "2. When the user is negative, stressed, or sad: Be deeply empathetic, supportive, and comforting. After validating their feelings, **you MUST recommend a simple activity, a casual game, or a small distraction task** to help them forget the stress and boost their mood. "
        "Maintain a warm, enthusiastic, and highly responsive tone. "
        "IMPORTANT: Always respond in the same language as the user's message. If the user writes in French, respond in French. If in English, respond in English."
    )
    
    # Création du Prompt Template
    prompt = ChatPromptTemplate.from_messages([
        SystemMessagePromptTemplate.from_template(SYSTEM_INSTRUCTION),
        HumanMessagePromptTemplate.from_template("{text}")
    ])
    
    # Création de la chaîne (méthode LCEL : Prompt -> Modèle -> Parseur)
    chain = (
        {"text": RunnablePassthrough()}  # Prend l'entrée utilisateur comme variable 'text'
        | prompt
        | llm
        | StrOutputParser()
    )
    
    print("✅ Chatbot LangChain initialisé avec succès!")

# ===== Chatbot Logic =====
# Vous pouvez intégrer votre chatbot Python ici
# Par exemple, si vous utilisez un modèle de NLP, une API externe, etc.

# ===== INTÉGRATION DE VOTRE CHATBOT PYTHON =====
# Remplacez cette fonction par votre code de chatbot existant

def get_chatbot_response(user_message, tone='supportive', mood='good'):
    """
    Fonction principale du chatbot utilisant LangChain avec Google Gemini
    
    Args:
        user_message: Message de l'utilisateur
        tone: Ton du chatbot (supportive, friendly, playful)
        mood: Humeur de l'utilisateur (low, neutral, good)
    
    Returns:
        Réponse du chatbot
    """
    
    if chain is None:
        return "Erreur: Le chatbot n'est pas initialisé. Veuillez redémarrer le serveur."
    
    try:
        # Ajouter le contexte du ton et de l'humeur au message si nécessaire
        # Vous pouvez personnaliser le message selon le tone et mood
        context_message = user_message
        
        # Le système instruction gère déjà l'humeur, pas besoin de préfixe
        # On peut utiliser directement le message utilisateur
        context_message = user_message
        
        # Exécution de la chaîne LangChain
        response = chain.invoke(context_message)
        
        return response.strip()
        
    except Exception as e:
        print(f"[ERREUR] Erreur lors de l'appel à l'API Gemini: {e}")
        # Réponse de secours en cas d'erreur
        return f"Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer. (Erreur: {str(e)})"

# ===== API Routes =====

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Endpoint pour recevoir les messages du chat
    """
    try:
        data = request.json
        user_message = data.get('message', '')
        tone = data.get('tone', 'supportive')
        mood = data.get('mood', 'good')
        
        if not user_message:
            return jsonify({'error': 'Message vide'}), 400
        
        # Obtenir la réponse du chatbot
        bot_response = get_chatbot_response(user_message, tone, mood)
        
        return jsonify({
            'response': bot_response,
            'success': True
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """
    Endpoint pour vérifier que l'API fonctionne
    """
    return jsonify({
        'status': 'ok',
        'message': 'Chatbot API is running'
    })

@app.route('/api/mood-encouragement', methods=['POST'])
def mood_encouragement():
    """
    Endpoint pour obtenir un message d'encouragement basé sur l'humeur
    """
    try:
        data = request.json
        mood = data.get('mood', 'good')
        
        # Messages d'encouragement basés sur l'humeur
        encouragement_messages = {
            'low': [
                "J'ai remarqué que vous vous sentez mal aujourd'hui. Je suis là si vous souhaitez en parler. Parfois, partager ce qui vous préoccupe peut aider. 💙",
                "Cela demande du courage d'admettre quand on se sent mal. Voulez-vous discuter ? Je suis là pour écouter sans jugement. 🌟",
                "Je vois que vous traversez une période difficile. Rappelez-vous, c'est normal de ne pas aller bien. Voulez-vous parler de ce qui se passe ? Je suis tout ouïe. 💬"
            ],
            'neutral': [
                "Je vois que vous vous sentez neutre aujourd'hui. Comment ça va ? Je suis là si vous souhaitez discuter ou explorer des ressources ensemble. 😊",
                "Les jours neutres peuvent être un bon moment pour la réflexion. Voulez-vous parler de ce qui vous préoccupe ou essayer quelque chose de nouveau ? 💭",
                "Comment s'est passée votre journée ? Je suis là si vous souhaitez discuter ou explorer des activités ensemble. Qu'est-ce qui vous ferait plaisir ? 🌈"
            ],
            'good': [
                "C'est merveilleux que vous vous sentiez bien ! J'aimerais savoir ce qui rend votre journée agréable. Voulez-vous partager ? 😊",
                "C'est si agréable de voir que vous êtes de bonne humeur ! Qu'est-ce qui se passe bien pour vous ? Je suis là pour discuter et célébrer avec vous ! 🎉",
                "Je suis content(e) que vous vous sentiez bien ! C'est bien de faire un point quand les choses vont bien aussi. Voulez-vous parler de votre journée ? 💬"
            ]
        }
        
        import random
        messages = encouragement_messages.get(mood, encouragement_messages['neutral'])
        response = random.choice(messages)
        
        return jsonify({
            'response': response,
            'success': True
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Initialisation du serveur Chatbot LangChain + Flask")
    print("=" * 60)
    
    # Initialiser le chatbot avant de démarrer le serveur
    try:
        init_chatbot()
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation du chatbot: {e}")
        print("⚠️  Le serveur démarrera mais le chatbot ne fonctionnera pas correctement.")
    
    print(f"\n🌐 Serveur démarré sur http://localhost:{API_PORT}")
    print(f"📡 API Health Check: http://localhost:{API_PORT}/api/health")
    print(f"💬 API Chat: http://localhost:{API_PORT}/api/chat")
    print("=" * 60)
    print("Appuyez sur Ctrl+C pour arrêter le serveur\n")
    
    app.run(debug=True, port=API_PORT, host='0.0.0.0')
