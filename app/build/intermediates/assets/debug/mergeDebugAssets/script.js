const quoteDisplay = document.getElementById('quote-display');
const textInput = document.getElementById('text-input');
const restartBtn = document.getElementById('restart-btn');
const wpmDisplay = document.getElementById('wpm-display');
const accuracyDisplay = document.getElementById('accuracy-display');

const quotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect, so keep practicing.",
    "Technology has changed the way we live and work.",
    "Learning new things is always a good idea.",
    "The journey of a thousand miles begins with one step."
];

let currentQuote = "";
let startTime = null;
let errors = 0;

function startNewGame() {
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteDisplay.innerText = currentQuote;
    textInput.value = "";
    textInput.disabled = false;
    textInput.focus();
    startTime = null;
    errors = 0;
    wpmDisplay.innerText = "WPM: 0";
    accuracyDisplay.innerText = "Accuracy: 0%";
}

function checkTyping() {
    const typedText = textInput.value;
    if (startTime === null && typedText.length>0) {
        startTime = new Date();
    }

    errors = 0;
    const quoteChars = currentQuote.split('');
    const typedChars = typedText.split('');

    quoteChars.forEach((char, index) => {
        if (typedChars[index] !== char) {
            errors++;
        }
    });

    let correctChars = typedText.length - errors;
    let accuracy = typedText.length>0 ? (correctChars / typedText.length) * 100 : 100;
    accuracyDisplay.innerText = `Accuracy: ${Math.round(accuracy)}%`;

    if (typedText === currentQuote) {
        const endTime = new Date();
        const timeElapsed = (endTime - startTime) / 1000;
        const wordCount = currentQuote.split(' ').length;
        const wpm = Math.round((wordCount / timeElapsed) * 60);
        wpmDisplay.innerText = `WPM: ${wpm}`;
        let finalAccuracy = ((currentQuote.length - errors) / currentQuote.length) * 100;
        accuracyDisplay.innerText = `Accuracy: ${Math.round(finalAccuracy)}%`;
        textInput.disabled = true;
    }
}

restartBtn.addEventListener('click', startNewGame);
textInput.addEventListener('input', checkTyping);
startNewGame();
