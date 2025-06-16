// Get references to HTML elements
const startBtn = document.getElementById('startBtn');
const textarea = document.getElementById('transcription');

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert("Sorry, your browser doesn't support speech recognition.");
} else {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // Start speech recognition on button click
    startBtn.addEventListener('click', () => {
        recognition.start();
        startBtn.disabled = true;
        startBtn.textContent = "Listening...";
    });

    // When speech is detected
    recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
        }
        textarea.value = transcript;
    };

    // When recognition ends
    recognition.onend = () => {
        startBtn.disabled = false;
        startBtn.textContent = "Start Recording";
    };
}
