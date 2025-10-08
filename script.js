// The Phantom Tag - Interactive Quiz Logic
class PhantomTagQuiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.startTime = null;
        this.endTime = null;
        this.timerInterval = null;
        this.totalTime = 0;
        this.deviceId = this.generateDeviceId();
        this.questions = [
            {
                question: "Which HTML tag defines main visible content?",
                answer: "body",
                hints: ["It's the main container for all visible content", "Not <head> or <script>", "Think about the structure of a webpage"],
                story: "The phantom's first clue points to the main content area..."
            },
            {
                question: "Which language runs in the browser to make pages interactive?",
                answer: "javascript",
                hints: ["It's not HTML or CSS", "Starts with 'Java' but isn't Java", "Used for dynamic web interactions"],
                story: "The phantom seems to be using a scripting language..."
            },
            {
                question: "Shortcut to open browser console?",
                answer: "f12",
                hints: ["It's a function key", "Used by developers for debugging", "F12 is the standard shortcut"],
                story: "The phantom left traces in the developer console..."
            },
            {
                question: "CSS property to set text color?",
                answer: "color",
                hints: ["It's a simple CSS property", "Not 'text-color' or 'font-color'", "Just the word 'color'"],
                story: "The phantom's text modifications are becoming clearer..."
            },
            {
                question: "Decode hex #48454C50",
                answer: "help",
                hints: ["Convert each pair of hex to ASCII", "48=H, 45=E, 4C=L, 50=P", "The phantom is asking for something..."],
                story: "The final clue reveals the phantom's message!"
            }
        ];
        
        this.init();
    }

    init() {
        // Check if this device has already attempted the investigation
        if (this.hasAlreadyAttempted()) {
            this.showAttemptRestrictionScreen();
            return;
        }
        
        this.setupEventListeners();
        this.startTypingAnimation();
        this.createCodeRain();
        this.showQuestion();
    }

    generateDeviceId() {
        // Create a unique device fingerprint based on browser characteristics
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL(),
            navigator.hardwareConcurrency || 'unknown',
            navigator.platform
        ].join('|');
        
        // Create a simple hash of the fingerprint
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return 'device_' + Math.abs(hash).toString(36);
    }

    hasAlreadyAttempted() {
        const attemptData = localStorage.getItem('phantom_tag_attempt');
        if (!attemptData) return false;
        
        try {
            const data = JSON.parse(attemptData);
            return data.deviceId === this.deviceId && data.completed;
        } catch (e) {
            return false;
        }
    }

    markAttemptStarted() {
        const attemptData = {
            deviceId: this.deviceId,
            started: true,
            completed: false,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        localStorage.setItem('phantom_tag_attempt', JSON.stringify(attemptData));
    }

    markAttemptCompleted() {
        const attemptData = {
            deviceId: this.deviceId,
            started: true,
            completed: true,
            timestamp: Date.now(),
            completionTime: this.totalTime,
            score: this.score,
            userAgent: navigator.userAgent
        };
        localStorage.setItem('phantom_tag_attempt', JSON.stringify(attemptData));
    }

    showAttemptRestrictionScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const investigationScreen = document.getElementById('investigation-screen');
        const feedbackScreen = document.getElementById('feedback-screen');
        const debugScreen = document.getElementById('debug-screen');
        const finalScreen = document.getElementById('final-screen');
        
        // Hide all other screens
        investigationScreen.classList.add('hidden');
        feedbackScreen.classList.add('hidden');
        debugScreen.classList.add('hidden');
        finalScreen.classList.add('hidden');
        
        // Show restriction message
        welcomeScreen.innerHTML = `
            <div class="terminal-line">
                <span class="prompt">user@phantom-tag:~$</span> <span class="command">./check_attempt_status.sh</span>
            </div>
            <div class="terminal-output">
                <div class="output-line">========================================</div>
                <div class="output-line">⚠️  INVESTIGATION ALREADY COMPLETED</div>
                <div class="output-line">========================================</div>
                <div class="output-line">This device has already completed the investigation.</div>
                <div class="output-line">The Phantom Tag mystery has been solved on this device.</div>
                <div class="output-line">========================================</div>
                <div class="output-line">Device ID: <span class="highlight">${this.deviceId}</span></div>
                <div class="output-line">Attempt Status: <span class="highlight">COMPLETED</span></div>
                <div class="output-line">========================================</div>
                <div class="output-line">For security reasons, only one attempt per device is allowed.</div>
                <div class="output-line">If you believe this is an error, contact the system administrator.</div>
                <div class="output-line">========================================</div>
            </div>
            <div class="terminal-line">
                <span class="prompt">user@phantom-tag:~$</span> <span class="cursor-blink">_</span>
            </div>
            <div class="terminal-output">
                <div class="output-line">Available commands:</div>
                <div class="output-line">• <span class="command">./reset_attempt.sh</span> - Reset attempt (admin only)</div>
                <div class="output-line">• <span class="command">./view_results.sh</span> - View previous results</div>
            </div>
            <button onclick="window.phantomQuiz.showResetPrompt()" class="terminal-button" style="margin-top: 20px;">
                RESET ATTEMPT (ADMIN)
            </button>
            <button onclick="window.phantomQuiz.showPreviousResults()" class="terminal-button" style="margin-top: 10px;">
                VIEW PREVIOUS RESULTS
            </button>
        `;
        
        welcomeScreen.classList.remove('hidden');
    }

    showResetPrompt() {
        const adminCode = prompt('Enter admin code to reset attempt:');
        if (adminCode === 'PHANTOM_RESET_2024') {
            this.resetAttempt();
        } else if (adminCode !== null) {
            alert('Invalid admin code. Access denied.');
        }
    }

    resetAttempt() {
        localStorage.removeItem('phantom_tag_attempt');
        alert('Attempt reset successfully. Refreshing page...');
        location.reload();
    }

    showPreviousResults() {
        const attemptData = localStorage.getItem('phantom_tag_attempt');
        if (!attemptData) {
            alert('No previous attempt found.');
            return;
        }
        
        try {
            const data = JSON.parse(attemptData);
            const completionTime = data.completionTime ? 
                `${Math.floor(data.completionTime / 60000)}:${Math.floor((data.completionTime % 60000) / 1000).toString().padStart(2, '0')}` : 
                'N/A';
            
            const results = `
PREVIOUS INVESTIGATION RESULTS:
========================================
Device ID: ${data.deviceId}
Completion Status: ${data.completed ? 'COMPLETED' : 'INCOMPLETE'}
Score: ${data.score || 0}/5
Completion Time: ${completionTime}
Attempt Date: ${new Date(data.timestamp).toLocaleString()}
User Agent: ${data.userAgent}
========================================
            `;
            
            alert(results);
        } catch (e) {
            alert('Error reading previous results.');
        }
    }

    setupEventListeners() {
        const submitBtn = document.getElementById('submit-btn');
        const answerInput = document.getElementById('answer-input');
        const restartBtn = document.getElementById('restart-btn');

        submitBtn.addEventListener('click', () => this.checkAnswer());
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartQuiz());
        }
    }

    startTypingAnimation() {
        // Terminal theme doesn't need typing animation - it shows static welcome screen
        // This method is kept for compatibility but does nothing
        console.log('Terminal theme initialized');
    }

    createCodeRain() {
        // Terminal theme uses floating elements instead of code rain
        // This method is kept for compatibility but does nothing
        console.log('Terminal floating elements initialized');
    }

    showQuestion() {
        const welcomeScreen = document.getElementById('welcome-screen');
        const investigationScreen = document.getElementById('investigation-screen');
        const feedbackScreen = document.getElementById('feedback-screen');
        const debugScreen = document.getElementById('debug-screen');
        const finalScreen = document.getElementById('final-screen');

        // Hide other screens
        welcomeScreen.classList.add('hidden');
        feedbackScreen.classList.add('hidden');
        debugScreen.classList.add('hidden');
        finalScreen.classList.add('hidden');

        if (this.currentQuestion < this.questions.length) {
            const question = this.questions[this.currentQuestion];
            const questionText = document.getElementById('question-text');
            const questionNumber = document.getElementById('question-number');
            const answerInput = document.getElementById('answer-input');
            
            questionText.textContent = question.question;
            questionNumber.textContent = this.currentQuestion + 1;
            answerInput.value = '';
            answerInput.focus();
            
            investigationScreen.classList.remove('hidden');
            this.updateProgress();
            
            // Start timer on first question and mark attempt as started
            if (this.currentQuestion === 0 && !this.startTime) {
                this.startTimer();
                this.markAttemptStarted();
            }
        } else {
            this.stopTimer();
            this.showFinalReveal();
        }
    }

    checkAnswer() {
        const answerInput = document.getElementById('answer-input');
        const userAnswer = answerInput.value.toLowerCase().trim();
        const correctAnswer = this.questions[this.currentQuestion].answer.toLowerCase();
        const feedbackScreen = document.getElementById('feedback-screen');
        const feedbackContent = document.getElementById('feedback-content');

        feedbackScreen.classList.remove('hidden');

        if (userAnswer === correctAnswer) {
            this.score++;
            this.showCorrectFeedback(feedbackContent);
            setTimeout(() => {
                this.currentQuestion++;
                this.showDebugAnimation();
            }, 2000);
        } else {
            this.showIncorrectFeedback(feedbackContent);
        }
    }

    showCorrectFeedback(container) {
        const question = this.questions[this.currentQuestion];
        container.innerHTML = `
            <div class="terminal-line">
                <span class="prompt">user@phantom-tag:~$</span> <span class="command">./check_answer.sh</span>
            </div>
            <div class="terminal-output feedback-correct">
                <div class="output-line">========================================</div>
                <div class="output-line">✓ CORRECT ANSWER!</div>
                <div class="output-line">========================================</div>
                <div class="output-line">Answer: <span class="highlight">${question.answer}</span></div>
                <div class="output-line">${question.story}</div>
                <div class="output-line">========================================</div>
            </div>
            <div class="terminal-line">
                <span class="prompt">user@phantom-tag:~$</span> <span class="cursor-blink">_</span>
            </div>
        `;
    }

    showIncorrectFeedback(container) {
        const question = this.questions[this.currentQuestion];
        const hint = question.hints[Math.floor(Math.random() * question.hints.length)];
        
        container.innerHTML = `
            <div class="terminal-line">
                <span class="prompt">user@phantom-tag:~$</span> <span class="command">./check_answer.sh</span>
            </div>
            <div class="terminal-output feedback-incorrect">
                <div class="output-line">========================================</div>
                <div class="output-line">✗ INCORRECT ANSWER</div>
                <div class="output-line">========================================</div>
                <div class="output-line">Hint: ${hint}</div>
                <div class="output-line">========================================</div>
            </div>
            <div class="terminal-line">
                <span class="prompt">user@phantom-tag:~$</span> <span class="cursor-blink">_</span>
            </div>
            <button onclick="this.parentElement.classList.add('hidden')" class="terminal-button">
                TRY AGAIN
            </button>
        `;
    }

    showDebugAnimation() {
        const debugScreen = document.getElementById('debug-screen');
        const feedbackScreen = document.getElementById('feedback-screen');
        
        feedbackScreen.classList.add('hidden');
        debugScreen.classList.remove('hidden');

        setTimeout(() => {
            this.showQuestion();
        }, 3000);
    }

    showFinalReveal() {
        const investigationScreen = document.getElementById('investigation-screen');
        const finalScreen = document.getElementById('final-screen');
        
        investigationScreen.classList.add('hidden');
        finalScreen.classList.remove('hidden');
        
        // Mark attempt as completed
        this.markAttemptCompleted();
        
        // Display final timer
        this.displayFinalTimer();
    }

    updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progress = (this.currentQuestion / this.questions.length) * 100;
        
        progressBar.style.width = progress + '%';
        progressText.textContent = `${this.currentQuestion}/${this.questions.length}`;
    }

    startTimer() {
        this.startTime = Date.now();
        this.updateTimerStatus('Investigation in progress...', 'timer-running');
        this.addTimerGlow('timer-active');
        
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.endTime = Date.now();
        this.totalTime = this.endTime - this.startTime;
        this.updateTimerStatus('Investigation completed!', 'timer-completed');
        this.addTimerGlow('timer-finished');
    }

    updateTimerDisplay() {
        if (!this.startTime) return;
        
        const elapsed = Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timerDisplay = document.getElementById('timer-display');
        
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    updateTimerStatus(message, className) {
        const statusElement = document.getElementById('timer-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = className;
        }
    }

    addTimerGlow(className) {
        // Terminal theme doesn't use timer glow effects
        // This method is kept for compatibility but does nothing
        console.log('Timer glow effect not needed in terminal theme');
    }

    displayFinalTimer() {
        const minutes = Math.floor(this.totalTime / 60000);
        const seconds = Math.floor((this.totalTime % 60000) / 1000);
        
        const finalTimer = document.getElementById('final-timer');
        const performance = document.getElementById('timer-performance');
        
        if (finalTimer) {
            finalTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (performance) {
            let performanceText = '';
            if (this.totalTime < 60000) { // Less than 1 minute
                performanceText = 'LIGHTNING FAST';
            } else if (this.totalTime < 180000) { // Less than 3 minutes
                performanceText = 'EXCELLENT';
            } else if (this.totalTime < 300000) { // Less than 5 minutes
                performanceText = 'GOOD';
            } else {
                performanceText = 'THOROUGH';
            }
            performance.textContent = performanceText;
        }
    }

    restartQuiz() {
        // Check if this device has already attempted the investigation
        if (this.hasAlreadyAttempted()) {
            this.showAttemptRestrictionScreen();
            return;
        }
        
        this.currentQuestion = 0;
        this.score = 0;
        this.startTime = null;
        this.endTime = null;
        this.totalTime = 0;
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset timer display
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = '00:00';
        }
        
        // Reset timer status
        this.updateTimerStatus('READY TO BEGIN...', '');
        
        // Hide all screens and show welcome
        const welcomeScreen = document.getElementById('welcome-screen');
        const investigationScreen = document.getElementById('investigation-screen');
        const feedbackScreen = document.getElementById('feedback-screen');
        const debugScreen = document.getElementById('debug-screen');
        const finalScreen = document.getElementById('final-screen');
        
        investigationScreen.classList.add('hidden');
        feedbackScreen.classList.add('hidden');
        debugScreen.classList.add('hidden');
        finalScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        
        // Auto-start after showing welcome
        setTimeout(() => {
            this.showQuestion();
        }, 2000);
    }
}

// Additional utility functions
function createFloatingCode() {
    // Floating elements are already defined in HTML
    // This function is kept for compatibility but does nothing
    console.log('Floating elements already initialized in HTML');
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.phantomQuiz = new PhantomTagQuiz();
    createFloatingCode();
    
    // Add terminal-themed effects
    document.addEventListener('mousemove', (e) => {
        const cursor = document.querySelector('.cursor');
        if (!cursor) {
            const newCursor = document.createElement('div');
            newCursor.className = 'cursor';
            newCursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, rgba(0, 255, 0, 0.8) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease;
            `;
            document.body.appendChild(newCursor);
        }
        
        const cursorElement = document.querySelector('.cursor');
        if (cursorElement) {
            cursorElement.style.left = e.clientX - 10 + 'px';
            cursorElement.style.top = e.clientY - 10 + 'px';
        }
    });
    
    // Add terminal keyboard effects
    document.addEventListener('keydown', (e) => {
        if (e.target.id === 'answer-input') {
            const input = e.target;
            input.style.boxShadow = '0 0 15px #00ff00';
            setTimeout(() => {
                input.style.boxShadow = '';
            }, 100);
        }
    });
});

// Add some Easter eggs
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.code);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Easter egg: Matrix mode
        document.body.style.filter = 'hue-rotate(120deg)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 5000);
        
        // Show secret message
        const secretMsg = document.createElement('div');
        secretMsg.innerHTML = '<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); color: #00ff00; padding: 20px; border: 2px solid #00ff00; border-radius: 10px; z-index: 10000; font-family: monospace;">SECRET: The phantom was actually a time-traveling developer from 1995!</div>';
        document.body.appendChild(secretMsg);
        setTimeout(() => secretMsg.remove(), 3000);
        
        konamiCode = [];
    }
});
