let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let selectedQuestions = [];
let wrongAnswers = [];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const feedbackText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-btn');
const progress = document.getElementById('progress');
const questionCount = document.getElementById('question-count');
const finalScore = document.getElementById('final-score');
const totalQuestions = document.getElementById('total-questions');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');
const restartBtn = document.getElementById('restart-btn');
const retryWrongBtn = document.getElementById('retry-wrong-btn');
const rating = document.getElementById('rating');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

// Load questions when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});

// Function to load questions
function loadQuestions() {
    fetch('questions.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            questions = data;
            console.log('Questions loaded:', questions.length); // Debug log
            enableQuizButtons();
        })
        .catch(error => {
            console.error('Error loading questions:', error);
            questionText.textContent = 'Error loading questions. Please refresh the page.';
        });
}

// Enable quiz buttons once questions are loaded
function enableQuizButtons() {
    document.querySelectorAll('.quiz-length-btn').forEach(button => {
        button.addEventListener('click', () => {
            const length = parseInt(button.dataset.length);
            console.log('Starting quiz with length:', length); // Debug log
            startQuiz(length);
        });
    });
}

function shuffleArray(array) {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...array];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function startQuiz(length) {
    // Reset state
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    wrongAnswers = [];
    
    // Make sure length doesn't exceed available questions
    const quizLength = Math.min(length, questions.length);
    
    // Thoroughly shuffle questions and select the required number
    const shuffledQuestions = shuffleArray(questions);
    selectedQuestions = shuffledQuestions.slice(0, quizLength);
    
    console.log('Selected questions:', selectedQuestions.length); // Debug log
    
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    if (!selectedQuestions || selectedQuestions.length === 0) {
        console.error('No questions available');
        return;
    }

    const currentQuestion = selectedQuestions[currentQuestionIndex];
    if (!currentQuestion) {
        console.error('Invalid question index');
        return;
    }

    questionText.textContent = currentQuestion.question_text;
    optionsContainer.innerHTML = '';
    
    // Update progress
    progress.style.width = `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%`;
    questionCount.textContent = `Question ${currentQuestionIndex + 1}/${selectedQuestions.length}`;

    // Create options
    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => checkAnswer(option));
        optionsContainer.appendChild(optionElement);
    });
}

function checkAnswer(selectedOption) {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const options = document.querySelectorAll('.option');
    
    // Disable all options
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });

    // Mark correct and incorrect answers
    options.forEach(option => {
        if (option.textContent === currentQuestion.correct_answer) {
            option.classList.add('correct');
        } else if (option.textContent === selectedOption && selectedOption !== currentQuestion.correct_answer) {
            option.classList.add('incorrect');
        }
    });

    // Show feedback
    feedback.classList.remove('hidden');
    if (selectedOption === currentQuestion.correct_answer) {
        feedbackText.textContent = 'Correct!';
        score++;
        correctAnswers++;
    } else {
        feedbackText.textContent = `Incorrect! The correct answer is: ${currentQuestion.correct_answer}`;
        incorrectAnswers++;
        // Store wrong answer for retry
        wrongAnswers.push(currentQuestion);
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < selectedQuestions.length) {
        showQuestion();
        feedback.classList.add('hidden');
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    totalQuestions.textContent = selectedQuestions.length;
    finalScore.textContent = score;
    correctCount.textContent = correctAnswers;
    incorrectCount.textContent = incorrectAnswers;
    
    // Show rating
    const percentage = (score / selectedQuestions.length) * 100;
    let ratingText = '';
    let ratingClass = '';
    
    if (percentage >= 90) {
        ratingText = 'Excellent!';
        ratingClass = 'excellent';
    } else if (percentage >= 70) {
        ratingText = 'Good!';
        ratingClass = 'good';
    } else if (percentage >= 50) {
        ratingText = 'Fair';
        ratingClass = 'fair';
    } else {
        ratingText = 'Poor';
        ratingClass = 'poor';
    }
    
    rating.textContent = ratingText;
    rating.className = `rating ${ratingClass}`;
    
    // Show/hide retry button based on wrong answers
    retryWrongBtn.style.display = wrongAnswers.length > 0 ? 'block' : 'none';
}

function retryWrongAnswers() {
    if (wrongAnswers.length > 0) {
        // Randomize the wrong answers
        selectedQuestions = shuffleArray(wrongAnswers);
        currentQuestionIndex = 0;
        score = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        wrongAnswers = []; // Clear wrong answers for this new attempt
        
        resultScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        showQuestion();
    }
}

// Function to return to main menu
function backToMenu() {
    // Confirm before exiting the quiz
    if (confirm('Are you sure you want to return to the menu? Your progress will be lost.')) {
        quizScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }
}

// Event Listeners
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => {
    startScreen.classList.remove('hidden');
    resultScreen.classList.add('hidden');
});
retryWrongBtn.addEventListener('click', retryWrongAnswers);
backToMenuBtn.addEventListener('click', backToMenu); 