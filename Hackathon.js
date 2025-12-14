// ===== Mock Data =====
const mockData = {
    mood: 'Good',
    focusLevel: 75,
    stressLevel: 30,
    points: 248,
    weeklyProgress: 68,
    checkIns: 5,
    focusSessions: 3,
    exercises: 2
};

// Chat responses based on tone
const chatResponses = {
    supportive: [
        "I'm here to listen. Take your time.",
        "That sounds challenging. Would you like to try a breathing exercise?",
        "You're doing great by checking in with yourself.",
        "It's okay to feel this way. Would you like some gentle guidance?",
        "I understand. Let's work through this together."
    ],
    friendly: [
        "Hey! How can I help you today?",
        "That's interesting! Tell me more about that.",
        "Sounds like you're handling things well!",
        "Want to try something fun? How about a quick focus game?",
        "I'm here whenever you need someone to chat with!"
    ],
    playful: [
        "Hey there! 🌟 What's on your mind?",
        "Ooh, that sounds like something we can tackle together!",
        "You've got this! Want to try a fun exercise?",
        "Let's turn that frown upside down! 😊",
        "Ready for a little challenge? I've got just the thing!"
    ]
};

// Mood-based encouraging messages for chatbot
const moodEncouragementMessages = {
    low: [
        "I noticed you're feeling low today. I'm here if you'd like to talk about it. Sometimes sharing what's on your mind can help. 💙",
        "It takes courage to acknowledge when you're feeling down. Would you like to chat? I'm here to listen without judgment. 🌟",
        "I see you're having a tough time. Remember, it's okay to not be okay. Want to talk about what's going on? I'm all ears. 💬",
        "Feeling low can be really hard. If you're up for it, I'd love to hear what's on your mind. No pressure, just here if you need. 🤗"
    ],
    neutral: [
        "I see you're feeling neutral today. How are things going? I'm here if you'd like to chat or explore some resources together. 😊",
        "Neutral days can be a good time for reflection. Want to talk about what's on your mind or try something new? 💭",
        "How's your day been? I'm here if you'd like to chat, or we could explore some activities together. What sounds good? 🌈",
        "Sometimes a neutral mood is a good starting point. Feel like chatting or trying something to boost your energy? Let me know! ✨"
    ],
    good: [
        "That's wonderful that you're feeling good! I'd love to hear what's making your day great. Want to share? 😊",
        "It's so nice to see you're in a good mood! What's been going well for you? I'm here to chat and celebrate with you! 🎉",
        "Feeling good is something to celebrate! Want to talk about what's bringing you joy today? I'm all ears! 🌟",
        "I'm glad you're feeling good! It's great to check in when things are going well too. Want to chat about your day? 💬"
    ]
};

// ===== State Management =====
let currentTone = 'supportive';
let chatOpen = false;
let currentMood = 'good'; // Default mood

// ===== API Configuration =====
const API_BASE_URL = 'http://localhost:5000'; // URL de votre serveur Flask
let apiAvailable = false;

// Vérifier si l'API est disponible au démarrage
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        apiAvailable = response.ok && data.status === 'ok';
        console.log('API Status:', apiAvailable ? '✅ Connecté' : '❌ Non disponible');
        return apiAvailable;
    } catch (error) {
        console.warn('API non disponible, utilisation des réponses locales:', error);
        apiAvailable = false;
        return false;
    }
}

// ===== Game State =====
let gameState = {
    isPlaying: false,
    score: 0,
    timeLeft: 30,
    timer: null,
    targetInterval: null,
    gameArea: null,
    gameTarget: null,
    gameOverlay: null
};

// Score threshold for "bad" scores (adjustable)
const BAD_SCORE_THRESHOLD = 10;
const REPETITIVE_BAD_SCORES_COUNT = 3; // Number of consecutive bad scores to trigger recommendation

// Focus resources recommendations
const focusResources = [
    {
        title: "Breathing Exercises",
        description: "Practice deep breathing to calm your mind and improve focus. Try the 4-7-8 technique.",
        icon: "🫁",
        type: "breathing"
    },
    {
        title: "Focus Tips",
        description: "Learn practical techniques to enhance your concentration and reduce distractions.",
        icon: "🎯",
        type: "focus"
    },
    {
        title: "Mindfulness Meditation",
        description: "Short mindfulness exercises can help train your attention and reduce mental clutter.",
        icon: "🧘",
        type: "meditation"
    },
    {
        title: "Grounding Technique",
        description: "Use the 5-4-3-2-1 method to anchor yourself in the present moment and improve focus.",
        icon: "🌍",
        type: "grounding"
    },
    {
        title: "Productivity Reset",
        description: "Simple strategies to refresh your energy and approach tasks with renewed focus.",
        icon: "🔄",
        type: "productivity"
    }
];

// ===== Landing Page =====
function enterApp() {
    const landingPage = document.getElementById('landing');
    const mainNav = document.getElementById('mainNav');
    const mainApp = document.getElementById('mainApp');
    const dashboardSection = document.getElementById('dashboard');

    if (!landingPage || !mainNav || !mainApp || !dashboardSection) {
        console.error('Missing required elements for app navigation');
        return;
    }

    try {
        // Hide landing page
        landingPage.classList.remove('active');
        landingPage.style.display = 'none';

        // Show main app
        mainNav.style.display = 'block';
        mainApp.style.display = 'block';
        dashboardSection.classList.add('active');

        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Initialize app features
        setTimeout(() => {
            updateDashboard();
            updateResources();
        }, 100);
    } catch (error) {
        console.error('Error entering app:', error);
        // Fallback: try direct navigation
        if (landingPage) landingPage.style.display = 'none';
        if (mainNav) mainNav.style.display = 'block';
        if (mainApp) mainApp.style.display = 'block';
        if (dashboardSection) dashboardSection.classList.add('active');
    }
}

function initializeLandingPage() {
    const enterAppBtn = document.getElementById('enterAppBtn');

    if (enterAppBtn) {
        // Remove any existing listeners to avoid duplicates
        const newBtn = enterAppBtn.cloneNode(true);
        enterAppBtn.parentNode.replaceChild(newBtn, enterAppBtn);
        
        // Add click listener to the new button
        const btn = document.getElementById('enterAppBtn');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            enterApp();
        });

        // Also add as onclick as fallback
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            enterApp();
        };
    } else {
        console.error('Enter App button not found');
    }
}

// ===== Navigation =====
// Initialize when DOM is ready
async function initializeApp() {
    // Vérifier la disponibilité de l'API
    await checkAPIHealth();
    
    initializeLandingPage();
    initializeNavigation();
    initializeChat();
    initializeButtons();
    initializeMoodSelector();
    initializeGame();
    updateDashboard();
    updateResources();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already loaded, initialize immediately
    initializeApp();
}

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show target section
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Update resources if navigating to resources section
            if (targetId === 'resources') {
                setTimeout(() => updateResources(), 100);
            }

            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// ===== Chat Widget =====
function initializeChat() {
    const chatButton = document.getElementById('chatButton');
    const chatPanel = document.getElementById('chatPanel');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const toneButtons = document.querySelectorAll('.tone-btn');
    const quickActionButtons = document.querySelectorAll('.quick-action-btn');

    // Open/close chat
    chatButton.addEventListener('click', () => {
        chatOpen = !chatOpen;
        chatPanel.classList.toggle('active', chatOpen);
        // Remove notification animation when chat is opened
        if (chatOpen) {
            chatButton.classList.remove('has-notification');
        }
    });

    chatClose.addEventListener('click', () => {
        chatOpen = false;
        chatPanel.classList.remove('active');
    });

    // Send message
    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Tone selection
    toneButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toneButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTone = btn.getAttribute('data-tone');
        });
    });

    // Quick actions
    quickActionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Désactiver l'input pendant le traitement
    chatInput.disabled = true;
    const chatSend = document.getElementById('chatSend');
    if (chatSend) chatSend.disabled = true;

    // Afficher un indicateur de chargement
    addMessage('...', 'bot');
    const loadingMessage = document.querySelector('.message:last-child');
    if (loadingMessage) {
        loadingMessage.classList.add('loading');
    }

    try {
        let botResponse;
        
        if (apiAvailable) {
            // Utiliser l'API Python
            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    tone: currentTone,
                    mood: currentMood
                })
            });

            if (response.ok) {
                const data = await response.json();
                botResponse = data.response;
            } else {
                throw new Error('Erreur API');
            }
        } else {
            // Fallback: utiliser les réponses locales
            const responses = chatResponses[currentTone];
            botResponse = responses[Math.floor(Math.random() * responses.length)];
        }

        // Retirer le message de chargement
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Ajouter la réponse du bot
        addMessage(botResponse, 'bot');
        
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        
        // Retirer le message de chargement
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Utiliser une réponse de secours
        const responses = chatResponses[currentTone];
        const fallbackResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(fallbackResponse, 'bot');
    } finally {
        // Réactiver l'input
        chatInput.disabled = false;
        if (chatSend) chatSend.disabled = false;
        chatInput.focus();
    }
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `<p>${text}</p>`;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== Mood-Based Chat Bubble =====
async function showMoodChatBubble(mood) {
    let message;
    
    try {
        if (apiAvailable) {
            // Utiliser l'API Python pour obtenir un message d'encouragement
            const response = await fetch(`${API_BASE_URL}/api/mood-encouragement`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mood: mood })
            });

            if (response.ok) {
                const data = await response.json();
                message = data.response;
            } else {
                throw new Error('Erreur API');
            }
        } else {
            // Fallback: utiliser les messages locaux
            const messages = moodEncouragementMessages[mood] || moodEncouragementMessages.neutral;
            message = messages[Math.floor(Math.random() * messages.length)];
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du message d\'encouragement:', error);
        // Fallback: utiliser les messages locaux
        const messages = moodEncouragementMessages[mood] || moodEncouragementMessages.neutral;
        message = messages[Math.floor(Math.random() * messages.length)];
    }

    // Check if chat is already open
    const chatPanel = document.getElementById('chatPanel');
    const isChatOpen = chatPanel && chatPanel.classList.contains('active');

    if (isChatOpen) {
        // If chat is open, just add the message
        addMessage(message, 'bot');
    } else {
        // Show floating chat bubble notification
        showChatBubbleNotification(message, mood);
    }
}

function showChatBubbleNotification(message, mood) {
    // Remove any existing bubble
    const existingBubble = document.getElementById('moodChatBubble');
    if (existingBubble) {
        existingBubble.remove();
    }

    // Get chat button
    const chatButton = document.getElementById('chatButton');
    if (!chatButton) return;

    // Add pulsing animation to chat button
    chatButton.classList.add('has-notification');

    // Create bubble element
    const bubble = document.createElement('div');
    bubble.id = 'moodChatBubble';
    bubble.className = 'chat-bubble-notification';

    // Get chat button position
    const buttonRect = chatButton.getBoundingClientRect();
    
    bubble.innerHTML = `
        <div class="bubble-content">
            <div class="bubble-header">
                <span class="bubble-bot-icon">🤖</span>
                <span class="bubble-name">EchoMind</span>
            </div>
            <div class="bubble-message">
                <p>${message}</p>
            </div>
            <div class="bubble-actions">
                <button class="bubble-btn bubble-btn-primary" id="openChatFromBubble">Open Chat</button>
                <button class="bubble-btn bubble-btn-close" id="closeChatBubble">×</button>
            </div>
        </div>
    `;

    document.body.appendChild(bubble);

    // Position bubble near chat button
    const bubbleRect = bubble.getBoundingClientRect();
    bubble.style.position = 'fixed';
    bubble.style.bottom = `${window.innerHeight - buttonRect.top + 20}px`;
    bubble.style.right = `${window.innerWidth - buttonRect.right}px`;
    bubble.style.zIndex = '1500';

    // Animate in
    setTimeout(() => {
        bubble.classList.add('active');
    }, 100);

    // Add event listeners
    const openChatBtn = document.getElementById('openChatFromBubble');
    const closeBubbleBtn = document.getElementById('closeChatBubble');

    if (openChatBtn) {
        openChatBtn.addEventListener('click', () => {
            // Add message to chat
            addMessage(message, 'bot');
            // Open chat panel
            openChatPanel();
            // Remove bubble
            bubble.classList.remove('active');
            // Remove notification animation
            if (chatButton) {
                chatButton.classList.remove('has-notification');
            }
            setTimeout(() => bubble.remove(), 300);
        });
    }

    if (closeBubbleBtn) {
        closeBubbleBtn.addEventListener('click', () => {
            bubble.classList.remove('active');
            // Remove notification animation
            if (chatButton) {
                chatButton.classList.remove('has-notification');
            }
            setTimeout(() => bubble.remove(), 300);
        });
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.classList.remove('active');
            // Remove notification animation
            if (chatButton) {
                chatButton.classList.remove('has-notification');
            }
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.remove();
                }
            }, 300);
        }
    }, 10000);
}

function openChatPanel() {
    const chatButton = document.getElementById('chatButton');
    const chatPanel = document.getElementById('chatPanel');
    
    if (chatButton && chatPanel) {
        chatOpen = true;
        chatPanel.classList.add('active');
    }
}

function handleQuickAction(action) {
    const chatMessages = document.getElementById('chatMessages');

    if (action === 'exercise') {
        addMessage("I'd like to try a calming exercise", 'user');
        setTimeout(() => {
            addMessage("Great choice! Let's do a simple breathing exercise. Inhale for 4 counts, hold for 4, exhale for 4. Ready? Let's begin...", 'bot');
        }, 800);
    } else if (action === 'game') {
        addMessage("I'd like to try a focus game", 'user');
        setTimeout(() => {
            addMessage("Great idea! I recommend trying our Focus Dot game. It's a fun way to improve your concentration. Let me take you there!", 'bot');
            // Navigate to games section after a short delay
            setTimeout(() => {
                const gamesLink = document.querySelector('a[href="#games"]');
                if (gamesLink) {
                    gamesLink.click();
                    // Close chat panel
                    chatOpen = false;
                    const chatPanel = document.getElementById('chatPanel');
                    if (chatPanel) {
                        chatPanel.classList.remove('active');
                    }
                }
            }, 1500);
        }, 800);
    }
}

// ===== Mood Selector =====
function initializeMoodSelector() {
    const moodOptions = document.querySelectorAll('.mood-option');

    moodOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedMood = option.getAttribute('data-mood');
            selectMood(selectedMood);
        });
    });
}

function selectMood(mood) {
    currentMood = mood;

    // Update active state
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(opt => opt.classList.remove('active'));
    document.querySelector(`.mood-option[data-mood="${mood}"]`).classList.add('active');

    // Update mood indicator in dashboard
    updateMoodIndicator(mood);

    // Show feedback message
    showMoodFeedback(mood);

    // Update resources
    updateResources();

    // Update body class for visual adaptation
    document.body.className = '';
    document.body.classList.add(`mood-${mood}`);

    // Update mock data
    mockData.mood = mood.charAt(0).toUpperCase() + mood.slice(1);

    // Trigger chatbot interaction with mood-based encouragement
    setTimeout(() => {
        showMoodChatBubble(mood);
    }, 1500);
}

function updateMoodIndicator(mood) {
    const moodValue = document.querySelector('.mood-value');
    const moodFill = document.querySelector('.mood-fill');

    if (moodValue && moodFill) {
        const moodLabels = {
            low: 'Low',
            neutral: 'Neutral',
            good: 'Good'
        };

        moodValue.textContent = moodLabels[mood];
        moodFill.className = `mood-fill ${mood}`;

        // Set width based on mood
        const widths = {
            low: '30%',
            neutral: '50%',
            good: '80%'
        };
        moodFill.style.width = widths[mood];
    }
}

function showMoodFeedback(mood) {
    const feedbackDiv = document.getElementById('moodFeedback');
    const feedbackText = feedbackDiv.querySelector('.mood-feedback-text');

    const feedbackMessages = {
        low: "Thanks for sharing. Let's find something that may help.",
        neutral: "Thanks for sharing. Here are some resources that might be useful.",
        good: "Thanks for sharing. Here are some activities to keep the positive energy flowing."
    };

    feedbackText.textContent = feedbackMessages[mood];
    feedbackDiv.style.display = 'block';
}

function updateResources() {
    const resourcesGrid = document.getElementById('resourcesGrid');
    if (!resourcesGrid) return; // Resources section might not be visible

    const resourceCards = resourcesGrid.querySelectorAll('.resource-card');
    const resourcesSubtitle = document.getElementById('resourcesSubtitle');

    if (resourcesSubtitle) {
        // Update subtitle based on mood
        const subtitles = {
            low: "Based on how you're feeling, these gentle resources may help",
            neutral: "Based on how you're feeling, these resources may be useful",
            good: "Based on how you're feeling, these activities may help maintain your positive energy"
        };
        resourcesSubtitle.textContent = subtitles[currentMood] || "Based on how you're feeling, these may help";
    }

    // Hide all resources first
    resourceCards.forEach(card => {
        card.classList.remove('visible');
        card.classList.add('hidden');
    });

    // Show resources for current mood
    setTimeout(() => {
        const relevantCards = resourcesGrid.querySelectorAll(`.resource-card[data-mood="${currentMood}"]`);
        relevantCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.remove('hidden');
                card.classList.add('visible');
            }, index * 100); // Stagger animation
        });
    }, 200);
}

// ===== Button Handlers =====
function initializeButtons() {
    const exploreTipsBtn = document.getElementById('exploreTipsBtn');

    if (exploreTipsBtn) {
        exploreTipsBtn.addEventListener('click', () => {
            // Navigate to resources section
            const resourcesLink = document.querySelector('a[href="#resources"]');
            if (resourcesLink) {
                resourcesLink.click();
            }
        });
    }

    // Resource card buttons (using event delegation for dynamic content)
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-secondary') && e.target.closest('.resource-card')) {
            const resourceCard = e.target.closest('.resource-card');
            const resourceTitle = resourceCard.querySelector('h3').textContent;
            showNotification(`Starting ${resourceTitle}...`);
        }
    });

    // Product buttons
    const productButtons = document.querySelectorAll('.btn-product');
    productButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const productCard = btn.closest('.product-card');
            const productTitle = productCard.querySelector('h3').textContent;
            showNotification(`Viewing details for ${productTitle}`);
        });
    });

    // Donation buttons
    const donationAmounts = document.querySelectorAll('.donation-amount');
    donationAmounts.forEach(btn => {
        btn.addEventListener('click', () => {
            donationAmounts.forEach(b => {
                b.style.background = 'var(--soft-pastel-blue)';
                b.style.color = 'var(--primary-blue)';
                b.style.borderColor = 'transparent';
            });
            btn.style.background = 'var(--primary-blue)';
            btn.style.color = 'var(--white)';
            btn.style.borderColor = 'var(--primary-blue)';
        });
    });

    const donateButtons = document.querySelectorAll('.donation-card .btn-primary');
    donateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const donationType = btn.textContent.includes('Points') ? 'points' : 'money';
            showNotification(`Thank you for your ${donationType} donation! Your contribution makes a difference.`);
        });
    });
}

// ===== Dashboard Updates =====
function updateDashboard() {
    // Update mood indicator (will be updated by mood selector)
    updateMoodIndicator(currentMood);

    // Update focus level
    const focusProgress = document.querySelectorAll('.focus-card .progress-fill')[0];
    if (focusProgress) {
        focusProgress.style.width = `${mockData.focusLevel}%`;
    }

    // Update stress level
    const stressProgress = document.querySelectorAll('.stress-card .progress-fill')[0];
    if (stressProgress) {
        stressProgress.style.width = `${mockData.stressLevel}%`;
    }

    // Update points
    const pointsValue = document.getElementById('pointsValue');
    if (pointsValue) {
        pointsValue.textContent = mockData.points;
    }

    // Update progress ring
    const progressRing = document.querySelector('.ring-progress');
    if (progressRing) {
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (mockData.weeklyProgress / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    // Update progress percentage
    const progressPercent = document.querySelector('.progress-percent');
    if (progressPercent) {
        progressPercent.textContent = `${mockData.weeklyProgress}%`;
    }

    // Update stats
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length >= 3) {
        statNumbers[0].textContent = mockData.checkIns;
        statNumbers[1].textContent = mockData.focusSessions;
        statNumbers[2].textContent = mockData.exercises;
    }
}

// ===== Utility Functions =====
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, var(--primary-blue), var(--primary-green));
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(107, 157, 209, 0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    notification.textContent = message;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// ===== Smooth Animations =====
// Add intersection observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.summary-card, .resource-card, .product-card, .donation-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// ===== Game Logic =====
function initializeGame() {
    gameState.gameArea = document.getElementById('gameArea');
    gameState.gameTarget = document.getElementById('gameTarget');
    gameState.gameOverlay = document.getElementById('gameOverlay');
    const startGameBtn = document.getElementById('startGameBtn');

    if (startGameBtn) {
        startGameBtn.addEventListener('click', startGame);
    }

    if (gameState.gameTarget) {
        gameState.gameTarget.addEventListener('click', handleTargetClick);
    }
}

function startGame() {
    if (gameState.isPlaying) return;

    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.timeLeft = 30;

    // Hide overlay
    if (gameState.gameOverlay) {
        gameState.gameOverlay.style.display = 'none';
    }

    // Show target
    if (gameState.gameTarget) {
        gameState.gameTarget.style.display = 'block';
    }

    // Update UI
    updateGameUI();

    // Start timer
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateGameUI();

        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);

    // Start spawning targets
    spawnTarget();
}

function spawnTarget() {
    if (!gameState.isPlaying) return;

    const gameArea = gameState.gameArea;
    const gameTarget = gameState.gameTarget;

    if (!gameArea || !gameTarget) return;

    // Get game area dimensions
    const areaRect = gameArea.getBoundingClientRect();
    const areaWidth = areaRect.width - 60; // Account for target size
    const areaHeight = areaRect.height - 60;

    // Random position
    const x = Math.random() * areaWidth;
    const y = Math.random() * areaHeight;

    // Set position
    gameTarget.style.left = `${x}px`;
    gameTarget.style.top = `${y}px`;

    // Random size (between 40px and 80px)
    const size = 40 + Math.random() * 40;
    gameTarget.style.width = `${size}px`;
    gameTarget.style.height = `${size}px`;

    // Random color
    const colors = [
        'var(--primary-blue)',
        'var(--primary-green)',
        '#FF6B6B',
        '#FFD93D',
        '#9B59B6',
        '#3498DB'
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    gameTarget.style.backgroundColor = color;

    // Show target with animation
    gameTarget.style.opacity = '0';
    gameTarget.style.transform = 'scale(0)';
    setTimeout(() => {
        gameTarget.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        gameTarget.style.opacity = '1';
        gameTarget.style.transform = 'scale(1)';
    }, 10);

    // Schedule next spawn (faster as time goes on)
    const spawnDelay = Math.max(800, 2000 - (30 - gameState.timeLeft) * 30);
    gameState.targetInterval = setTimeout(() => {
        if (gameState.isPlaying) {
            spawnTarget();
        }
    }, spawnDelay);
}

function handleTargetClick() {
    if (!gameState.isPlaying) return;

    // Increase score
    gameState.score++;
    updateGameUI();

    // Hide target with animation
    if (gameState.gameTarget) {
        gameState.gameTarget.style.transition = 'opacity 0.1s ease, transform 0.1s ease';
        gameState.gameTarget.style.opacity = '0';
        gameState.gameTarget.style.transform = 'scale(0)';
    }

    // Spawn new target after a short delay
    setTimeout(() => {
        if (gameState.isPlaying) {
            spawnTarget();
        }
    }, 200);
}

function updateGameUI() {
    const scoreValue = document.getElementById('scoreValue');
    const timeValue = document.getElementById('timeValue');

    if (scoreValue) {
        scoreValue.textContent = gameState.score;
    }

    if (timeValue) {
        timeValue.textContent = gameState.timeLeft;
    }
}

function endGame() {
    gameState.isPlaying = false;

    // Clear intervals
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    if (gameState.targetInterval) {
        clearTimeout(gameState.targetInterval);
    }

    // Hide target
    if (gameState.gameTarget) {
        gameState.gameTarget.style.display = 'none';
    }

    // Track score
    trackScore(gameState.score);

    // Check for repetitive bad scores
    const hasRepetitiveBadScores = checkRepetitiveBadScores();
    
    // Show overlay with results
    if (gameState.gameOverlay) {
        const overlayTitle = gameState.gameOverlay.querySelector('h3');
        const overlayText = gameState.gameOverlay.querySelector('p');
        const startBtn = gameState.gameOverlay.querySelector('button');

        if (overlayTitle) {
            overlayTitle.textContent = 'Game Over!';
        }
        if (overlayText) {
            overlayText.textContent = `Great job! You scored ${gameState.score} points. Want to try again?`;
        }
        if (startBtn) {
            startBtn.textContent = 'Play Again';
        }

        gameState.gameOverlay.style.display = 'flex';
    }

    // Show notification
    showNotification(`Game Over! Your score: ${gameState.score} points`);

    // Show recommendations if repetitive bad scores detected
    if (hasRepetitiveBadScores) {
        setTimeout(() => {
            showFocusRecommendations();
        }, 2000);
    }
}

// ===== Score Tracking =====
function trackScore(score) {
    try {
        const scoreHistory = getScoreHistory();
        const timestamp = Date.now();
        
        scoreHistory.push({
            score: score,
            timestamp: timestamp,
            date: new Date(timestamp).toISOString()
        });

        // Keep only last 10 scores
        if (scoreHistory.length > 10) {
            scoreHistory.shift();
        }

        localStorage.setItem('focusGameScores', JSON.stringify(scoreHistory));
    } catch (error) {
        console.error('Error tracking score:', error);
    }
}

function getScoreHistory() {
    try {
        const stored = localStorage.getItem('focusGameScores');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error getting score history:', error);
        return [];
    }
}

function checkRepetitiveBadScores() {
    const scoreHistory = getScoreHistory();
    
    if (scoreHistory.length < REPETITIVE_BAD_SCORES_COUNT) {
        return false;
    }

    // Get the last N scores
    const recentScores = scoreHistory.slice(-REPETITIVE_BAD_SCORES_COUNT);
    
    // Check if all recent scores are below threshold
    const allBadScores = recentScores.every(entry => entry.score < BAD_SCORE_THRESHOLD);
    
    return allBadScores;
}

// ===== Focus Recommendations =====
function showFocusRecommendations() {
    // Create recommendation modal/panel
    const recommendationPanel = document.createElement('div');
    recommendationPanel.id = 'focusRecommendations';
    recommendationPanel.className = 'focus-recommendations-panel';
    
    // Select random 2-3 resources
    const shuffled = [...focusResources].sort(() => 0.5 - Math.random());
    const selectedResources = shuffled.slice(0, 3);
    
    recommendationPanel.innerHTML = `
        <div class="recommendations-content">
            <div class="recommendations-header">
                <span class="recommendations-icon">💡</span>
                <h3>Focus Improvement Tips</h3>
                <button class="recommendations-close" id="closeRecommendations">×</button>
            </div>
            <div class="recommendations-message">
                <p>We noticed you might be having trouble focusing. Here are some resources that can help improve your concentration and reduce distractions:</p>
            </div>
            <div class="recommendations-list">
                ${selectedResources.map(resource => `
                    <div class="recommendation-item">
                        <div class="recommendation-icon">${resource.icon}</div>
                        <div class="recommendation-info">
                            <h4>${resource.title}</h4>
                            <p>${resource.description}</p>
                        </div>
                        <button class="btn-recommendation" data-resource="${resource.type}">Try Now</button>
                    </div>
                `).join('')}
            </div>
            <div class="recommendations-footer">
                <button class="btn-primary" id="viewAllResources">View All Resources</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(recommendationPanel);
    
    // Add event listeners
    const closeBtn = document.getElementById('closeRecommendations');
    const viewAllBtn = document.getElementById('viewAllResources');
    const tryButtons = document.querySelectorAll('.btn-recommendation');
    
    const closePanel = () => {
        recommendationPanel.classList.remove('active');
        setTimeout(() => {
            recommendationPanel.remove();
        }, 300);
    };
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closePanel);
    }
    
    // Close when clicking outside
    recommendationPanel.addEventListener('click', (e) => {
        if (e.target === recommendationPanel) {
            closePanel();
        }
    });
    
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            closePanel();
            // Navigate to resources section
            setTimeout(() => {
                const resourcesLink = document.querySelector('a[href="#resources"]');
                if (resourcesLink) {
                    resourcesLink.click();
                }
            }, 300);
        });
    }
    
    tryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const resourceType = btn.getAttribute('data-resource');
            closePanel();
            // Navigate to resources and highlight relevant resource
            setTimeout(() => {
                const resourcesLink = document.querySelector('a[href="#resources"]');
                if (resourcesLink) {
                    resourcesLink.click();
                    setTimeout(() => {
                        highlightResource(resourceType);
                    }, 300);
                }
            }, 300);
        });
    });
    
    // Animate in
    setTimeout(() => {
        recommendationPanel.classList.add('active');
    }, 100);
}

function highlightResource(resourceType) {
    // Find and highlight the relevant resource card
    const resourceCards = document.querySelectorAll('.resource-card');
    let found = false;
    
    resourceCards.forEach(card => {
        const cardTitle = card.querySelector('h3')?.textContent.toLowerCase();
        const cardIcon = card.querySelector('.resource-icon')?.textContent;
        
        // Match by type keywords
        const typeKeywords = {
            'breathing': ['breathing', '🫁'],
            'focus': ['focus', '🎯'],
            'meditation': ['meditation', 'mindfulness', '🧘'],
            'grounding': ['grounding', '🌍'],
            'productivity': ['productivity', '🔄']
        };
        
        const keywords = typeKeywords[resourceType] || [resourceType];
        const matches = keywords.some(keyword => 
            cardTitle?.includes(keyword.toLowerCase()) || 
            cardIcon?.includes(keyword)
        );
        
        if (matches && !found) {
            found = true;
            // Make sure card is visible
            card.classList.remove('hidden');
            card.classList.add('visible');
            
            // Highlight
            card.style.border = '3px solid var(--primary-blue)';
            card.style.boxShadow = '0 8px 30px rgba(107, 157, 209, 0.4)';
            card.style.transform = 'scale(1.02)';
            card.style.transition = 'all 0.3s ease';
            
            // Scroll into view
            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            
            // Remove highlight after 5 seconds
            setTimeout(() => {
                card.style.border = '';
                card.style.boxShadow = '';
                card.style.transform = '';
            }, 5000);
        }
    });
}
